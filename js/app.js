// js/app.js — Router, init, nav, sync orchestration
import {
  initDB, getAllEntries, addEntry, updateEntry, deleteEntry,
  getStats, getYearlyTotals, getCategoryTotals, getMonthlyTotals,
  getTopExpenses, getKmData, getSetting, setSetting, guessCategory, CATEGORIES
} from './data.js';

import {
  renderYearlyChart, renderCategoryChart, renderKmChart,
  renderMonthlyChart, renderTopExpensesChart, renderHomeChart
} from './charts.js';

import {
  initGoogleAuth, requestAuth, isSignedIn, syncAll, appendRow, updateRow, deleteRow
} from './google-sheets.js';

// ── State ─────────────────────────────────────────────────────────────────────
let _currentPage    = 'home';
let _historyFilter  = 'All';
let _historySearch  = '';
let _historyPage    = 0;
const PAGE_SIZE     = 20;
let _allEntries     = [];
let _sheetsClientId = '';
let _sheetsSheetId  = '';

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  _allEntries = await getAllEntries();

  // Load saved settings
  _sheetsClientId = (await getSetting('clientId')) || '';
  _sheetsSheetId  = (await getSetting('sheetId'))  || '';

  // Wire nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  // Settings modal
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('settings-backdrop').addEventListener('click', closeSettings);
  document.getElementById('btn-connect-sheets').addEventListener('click', connectSheets);
  document.getElementById('btn-reset-data').addEventListener('click', resetData);

  // Navigate to home
  await navigate('home');

  // Hide loading overlay
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('hidden');

  // Attempt background sync if credentials exist
  if (_sheetsClientId && _sheetsSheetId) {
    syncInBackground();
  }

  // Online/offline badge
  updateSyncBadge();
  window.addEventListener('online',  () => { updateSyncBadge(); syncInBackground(); });
  window.addEventListener('offline', () => updateSyncBadge());
});

// ── Router ────────────────────────────────────────────────────────────────────
async function navigate(page) {
  _currentPage = page;

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  // Update top bar title
  const titles = { home: 'الرئيسية', add: 'إضافة سجل', history: 'سجل الصيانة', analysis: 'التحليل' };
  document.getElementById('page-title').textContent = titles[page] || '';

  // Load page HTML fragment
  const container = document.getElementById('page-container');
  container.innerHTML = '<div class="loading-spinner" style="margin:40px auto;"></div>';

  try {
    const resp = await fetch(`pages/${page}.html`);
    if (!resp.ok) throw new Error('Page not found');
    container.innerHTML = await resp.text();
  } catch {
    container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⚠️</div><div class="empty-state__text">تعذر تحميل الصفحة</div></div>';
    return;
  }

  // Wire delegation for section-link nav buttons (e.g. "عرض الكل" on home)
  container.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  // Initialise page
  _allEntries = await getAllEntries();
  if (page === 'home')     await initHome();
  if (page === 'add')      initAdd();
  if (page === 'history')  await initHistory();
  if (page === 'analysis') await initAnalysis();
}

// ── HOME ──────────────────────────────────────────────────────────────────────
async function initHome() {
  const stats   = await getStats();
  const yearly  = await getYearlyTotals();

  document.getElementById('val-total').textContent = fmtEGP(stats.totalAll);
  document.getElementById('val-year').textContent  = fmtEGP(stats.totalYear);
  document.getElementById('val-month').textContent = fmtEGP(stats.totalMonth);
  document.getElementById('val-km').textContent    = stats.currentKm ? stats.currentKm + ',000 كم' : '—';

  if (stats.lastOil) {
    document.getElementById('val-oil').textContent    = fmtDate(stats.lastOil.date);
    document.getElementById('val-oil-km').textContent = '@ ' + stats.lastOil.km + ',000 كم';
  }

  renderHomeChart('chart-home-yearly', yearly);

  // Recent 5
  const recent = _allEntries.slice(0, 5);
  const list = document.getElementById('recent-list');
  if (!recent.length) {
    list.innerHTML = '<div class="text-muted text-center" style="padding:12px 0;font-size:0.85rem;">لا توجد سجلات بعد</div>';
    return;
  }
  list.innerHTML = recent.map(e => `
    <div class="recent-item">
      <span class="recent-item__icon">${catIcon(e.category)}</span>
      <div class="recent-item__info">
        <div class="recent-item__name">${esc(e.item)}</div>
        <div class="recent-item__date">${fmtDate(e.date)}</div>
      </div>
      <span class="recent-item__price">${fmtEGP(e.price)}</span>
    </div>
  `).join('');
}

// ── ADD / EDIT ────────────────────────────────────────────────────────────────
function initAdd(editEntry = null) {
  // Default date to today
  const dateField = document.getElementById('field-date');
  if (dateField) dateField.value = editEntry?.date || todayISO();

  if (editEntry) {
    document.getElementById('edit-id').value           = editEntry.id;
    document.getElementById('field-category').value   = editEntry.category;
    document.getElementById('field-item').value        = editEntry.item;
    document.getElementById('field-price').value       = editEntry.price;
    document.getElementById('field-km').value          = editEntry.km || '';
    document.getElementById('field-comment').value     = editEntry.comment || '';
    document.getElementById('page-title').textContent  = 'تعديل السجل';
  }

  // Auto-detect category on item input
  const itemField = document.getElementById('field-item');
  const catField  = document.getElementById('field-category');
  const hint      = document.getElementById('cat-hint');

  itemField?.addEventListener('input', () => {
    if (!catField.value) {
      const guessed = guessCategory(itemField.value);
      if (guessed !== 'Other') {
        catField.value = guessed;
        hint.style.display = 'block';
      }
    }
  });

  document.getElementById('btn-cancel')?.addEventListener('click', () => navigate('history'));

  document.getElementById('entry-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id       = document.getElementById('edit-id').value;
    const date     = document.getElementById('field-date').value;
    const category = document.getElementById('field-category').value;
    const item     = document.getElementById('field-item').value.trim();
    const price    = parseInt(document.getElementById('field-price').value) || 0;
    const km       = parseInt(document.getElementById('field-km').value)    || 0;
    const comment  = document.getElementById('field-comment').value.trim();

    if (!date || !category || !item || price <= 0) {
      showToast('⚠️ يرجى ملء الحقول المطلوبة');
      return;
    }

    const entry = { id: id || 'local_' + Date.now(), date, item, price, km, category, comment, source: 'manual' };

    if (id) {
      await updateEntry(entry);
      showToast('✅ تم التعديل');
      if (isSignedIn() && _sheetsSheetId) {
        const all = await getAllEntries();
        const idx = all.findIndex(e => e.id === id);
        if (idx !== -1) updateRow(_sheetsSheetId, idx + 1, entry).catch(() => {});
      }
    } else {
      await addEntry(entry);
      showToast('✅ تم الحفظ');
      if (isSignedIn() && _sheetsSheetId) {
        appendRow(_sheetsSheetId, entry).catch(() => {});
      }
    }

    _allEntries = await getAllEntries();
    navigate('history');
  });
}

// ── HISTORY ───────────────────────────────────────────────────────────────────
async function initHistory() {
  buildFilterChips();
  renderHistory();

  document.getElementById('history-search')?.addEventListener('input', e => {
    _historySearch = e.target.value.toLowerCase();
    _historyPage   = 0;
    renderHistory();
  });

  // Pull-to-refresh
  let touchStartY = 0;
  const container = document.getElementById('page-container');
  container.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  container.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientY - touchStartY;
    if (delta > 80 && container.scrollTop === 0) syncInBackground(true);
  }, { passive: true });
}

function buildFilterChips() {
  const years = [...new Set(_allEntries.map(e => new Date(e.date).getFullYear()))].sort((a,b) => b-a);
  const chips = [
    { label: 'الكل', value: 'All' },
    ...years.map(y => ({ label: String(y), value: String(y) })),
    ...CATEGORIES.map(c => ({ label: c, value: c }))
  ];

  const wrap = document.getElementById('filter-chips');
  if (!wrap) return;
  wrap.innerHTML = chips.map(c =>
    `<button class="chip${_historyFilter === c.value ? ' active' : ''}" data-filter="${esc(c.value)}">${esc(c.label)}</button>`
  ).join('');

  wrap.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    _historyFilter = chip.dataset.filter;
    _historyPage   = 0;
    wrap.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('active', ch.dataset.filter === _historyFilter));
    renderHistory();
  });
}

function filterEntries() {
  return _allEntries.filter(e => {
    const year = String(new Date(e.date).getFullYear());
    const matchFilter = _historyFilter === 'All' || year === _historyFilter || e.category === _historyFilter;
    const matchSearch = !_historySearch ||
      e.item.toLowerCase().includes(_historySearch) ||
      e.category.toLowerCase().includes(_historySearch) ||
      e.date.includes(_historySearch) ||
      (e.comment || '').toLowerCase().includes(_historySearch);
    return matchFilter && matchSearch;
  });
}

function renderHistory() {
  const filtered = filterEntries();
  const total    = filtered.reduce((s, e) => s + e.price, 0);
  const shown    = filtered.slice(0, (_historyPage + 1) * PAGE_SIZE);
  const hasMore  = shown.length < filtered.length;

  const count   = document.getElementById('history-count');
  const totEl   = document.getElementById('history-total-shown');
  const listEl  = document.getElementById('history-list');
  const emptyEl = document.getElementById('history-empty');
  const moreEl  = document.getElementById('load-more-wrap');

  if (!listEl) return;

  if (count)  count.textContent  = filtered.length + ' سجل';
  if (totEl)  totEl.textContent  = fmtEGP(total);

  if (!filtered.length) {
    listEl.innerHTML = '';
    emptyEl?.classList.remove('hidden');
    moreEl?.classList.add('hidden');
    return;
  }
  emptyEl?.classList.add('hidden');

  listEl.innerHTML = shown.map(e => entryCardHTML(e)).join('');

  // Wire expand / edit / delete
  listEl.querySelectorAll('.entry-card__main').forEach(main => {
    main.addEventListener('click', () => {
      const expand = main.nextElementSibling;
      expand?.classList.toggle('open');
    });
  });
  listEl.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = btn.closest('.entry-card').dataset.id;
      const entry = _allEntries.find(en => en.id === id);
      if (!entry) return;
      await navigate('add');
      initAdd(entry);
    });
  });
  listEl.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('حذف هذا السجل؟')) return;
      const id = btn.closest('.entry-card').dataset.id;
      await deleteEntry(id);
      if (isSignedIn() && _sheetsSheetId) {
        const all  = await getAllEntries();
        const idx  = all.findIndex(en => en.id === id);
        if (idx !== -1) deleteRow(_sheetsSheetId, idx + 1).catch(() => {});
      }
      _allEntries = await getAllEntries();
      showToast('🗑 تم الحذف');
      renderHistory();
    });
  });

  if (moreEl) {
    moreEl.classList.toggle('hidden', !hasMore);
    document.getElementById('btn-load-more')?.addEventListener('click', () => {
      _historyPage++;
      renderHistory();
    });
  }
}

function entryCardHTML(e) {
  return `
  <div class="entry-card" data-id="${esc(e.id)}">
    <div class="entry-card__main">
      <div class="entry-card__icon">${catIcon(e.category)}</div>
      <div class="entry-card__info">
        <div class="entry-card__item">${esc(e.item)}</div>
        <div class="entry-card__meta">${fmtDate(e.date)}${e.km ? ' · ' + e.km + ',000 كم' : ''} · <span class="cat-badge">${esc(e.category)}</span></div>
      </div>
      <div class="entry-card__price">${fmtEGP(e.price)}</div>
    </div>
    <div class="entry-card__expand">
      ${e.comment ? `<div class="entry-card__comment">${esc(e.comment)}</div>` : ''}
      <div class="entry-card__actions">
        <button class="btn-sm btn-edit">✏️ تعديل</button>
        <button class="btn-sm btn-delete">🗑 حذف</button>
      </div>
    </div>
  </div>`;
}

// ── ANALYSIS ──────────────────────────────────────────────────────────────────
async function initAnalysis() {
  const [yearly, catData, topExp, kmData] = await Promise.all([
    getYearlyTotals(),
    getCategoryTotals(),
    getTopExpenses(5),
    getKmData()
  ]);

  const thisYear = new Date().getFullYear();
  const monthly  = await getMonthlyTotals(thisYear);

  // Stat tiles
  const avgYear   = yearly.length ? Math.round(yearly.reduce((s,d) => s+d.total,0) / yearly.length) : 0;
  const stats     = await getStats();
  const kmRange   = (stats.currentKm - 61) || 1;
  const costPerKm = Math.round((await getAllEntries()).reduce((s,e)=>s+e.price,0) / kmRange);
  const topCat    = catData[0]?.category || '—';
  const freqMap   = {};
  _allEntries.forEach(e => { freqMap[e.category] = (freqMap[e.category]||0)+1; });
  const freqCat   = Object.entries(freqMap).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';

  setText('tile-avg-year',   fmtEGP(avgYear));
  setText('tile-cost-per-km', fmtEGP(costPerKm));
  setText('tile-top-cat',    topCat);
  setText('tile-freq-cat',   freqCat);
  setText('chart-monthly-year', thisYear);

  renderYearlyChart('chart-yearly', yearly);
  renderCategoryChart('chart-category', catData);
  renderKmChart('chart-km', kmData);
  renderMonthlyChart('chart-monthly', monthly);
  renderTopExpensesChart('chart-top', topExp);
}

// ── Settings ──────────────────────────────────────────────────────────────────
function openSettings() {
  const modal = document.getElementById('settings-modal');
  modal.removeAttribute('hidden');
  document.getElementById('input-client-id').value = _sheetsClientId;
  document.getElementById('input-sheet-id').value  = _sheetsSheetId;
}

function closeSettings() {
  document.getElementById('settings-modal').setAttribute('hidden', '');
}

async function connectSheets() {
  const clientId = document.getElementById('input-client-id').value.trim();
  const sheetId  = document.getElementById('input-sheet-id').value.trim();
  if (!clientId || !sheetId) { showToast('⚠️ أدخل Client ID و Sheet ID'); return; }

  try {
    await initGoogleAuth(clientId);
    await requestAuth();
    _sheetsClientId = clientId;
    _sheetsSheetId  = sheetId;
    await setSetting('clientId', clientId);
    await setSetting('sheetId', sheetId);
    showToast('✅ تم الربط بـ Google Sheets');
    closeSettings();
    syncInBackground(true);
  } catch (err) {
    showToast('❌ فشل الربط: ' + (err.message || err));
  }
}

async function resetData() {
  if (!confirm('سيتم حذف كل البيانات المحلية. هل أنت متأكد؟')) return;
  await localforage.clear();
  showToast('تم إعادة التعيين');
  closeSettings();
  location.reload();
}

// ── Sync ──────────────────────────────────────────────────────────────────────
async function syncInBackground(showFeedback = false) {
  if (!navigator.onLine || !_sheetsClientId || !_sheetsSheetId) return;
  try {
    if (!isSignedIn()) {
      await initGoogleAuth(_sheetsClientId);
      await requestAuth();
    }
    const merged = await syncAll(_sheetsSheetId, _allEntries);
    // Persist merged result
    await localforage.setItem('car_entries', merged);
    _allEntries = await getAllEntries();
    updateSyncBadge(true);
    if (showFeedback) showToast('☁️ تمت المزامنة');
    if (_currentPage === 'home')    initHome();
    if (_currentPage === 'history') renderHistory();
  } catch {
    if (showFeedback) showToast('⚠️ فشلت المزامنة');
  }
}

function updateSyncBadge(synced = false) {
  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  if (!navigator.onLine) {
    badge.className = 'sync-badge sync-badge--offline';
    badge.textContent = '⬤ غير متصل';
  } else if (synced) {
    badge.className = 'sync-badge sync-badge--ok';
    badge.textContent = '⬤ متزامن';
  } else {
    badge.className = 'sync-badge sync-badge--ok';
    badge.textContent = '⬤ متصل';
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtEGP(n) {
  return Number(n).toLocaleString('ar-EG') + ' EGP';
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

const CAT_ICONS = {
  'Oil Change':     '🛢',
  'Tires':          '🛞',
  'Engine':         '⚙️',
  'Suspension':     '🔧',
  'AC':             '❄️',
  'Electrical':     '⚡',
  'Cooling':        '💧',
  'Body & Glass':   '🚗',
  'Brakes':         '🛑',
  'Gearbox':        '🔩',
  'General Service':'🔨',
  'Other':          '📋'
};

function catIcon(cat) {
  return CAT_ICONS[cat] || '📋';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
