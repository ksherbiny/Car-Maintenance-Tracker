// js/data.js — IndexedDB layer via localForage

const STORE_KEY = 'car_entries';
const META_KEY  = 'car_meta';

// ── Init ────────────────────────────────────────────────────────────────────

export async function initDB() {
  localforage.config({ name: 'CarTracker', storeName: 'entries' });
}

// ── CRUD ────────────────────────────────────────────────────────────────────

export async function getAllEntries() {
  const entries = await localforage.getItem(STORE_KEY) || [];
  return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function addEntry(entry) {
  const entries = await localforage.getItem(STORE_KEY) || [];
  entries.push(entry);
  await localforage.setItem(STORE_KEY, entries);
}

export async function updateEntry(updated) {
  const entries = await localforage.getItem(STORE_KEY) || [];
  const idx = entries.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    entries[idx] = updated;
    await localforage.setItem(STORE_KEY, entries);
  }
}

export async function deleteEntry(id) {
  const entries = await localforage.getItem(STORE_KEY) || [];
  await localforage.setItem(STORE_KEY, entries.filter(e => e.id !== id));
}

export async function getEntryById(id) {
  const entries = await localforage.getItem(STORE_KEY) || [];
  return entries.find(e => e.id === id) || null;
}

// ── Stats ───────────────────────────────────────────────────────────────────

export async function getStats() {
  const entries = await localforage.getItem(STORE_KEY) || [];
  const now = new Date();
  const thisYear  = now.getFullYear();
  const thisMonth = now.getMonth();

  let totalAll = 0, totalYear = 0, totalMonth = 0;
  let lastOil = null, maxKm = 0, maxKmDate = null;

  for (const e of entries) {
    const d = new Date(e.date);
    totalAll += e.price;
    if (d.getFullYear() === thisYear) totalYear += e.price;
    if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) totalMonth += e.price;
    if (e.km > maxKm) { maxKm = e.km; maxKmDate = e.date; }
    if (e.category === 'Oil Change') {
      if (!lastOil || new Date(e.date) > new Date(lastOil.date)) lastOil = e;
    }
  }

  return { totalAll, totalYear, totalMonth, lastOil, currentKm: maxKm, lastKmDate: maxKmDate };
}

export async function getYearlyTotals() {
  const entries = await localforage.getItem(STORE_KEY) || [];
  const map = {};
  for (const e of entries) {
    const y = new Date(e.date).getFullYear();
    map[y] = (map[y] || 0) + e.price;
  }
  return Object.entries(map).sort((a, b) => a[0] - b[0]).map(([year, total]) => ({ year: +year, total }));
}

export async function getCategoryTotals() {
  const entries = await localforage.getItem(STORE_KEY) || [];
  const map = {};
  for (const e of entries) {
    map[e.category] = (map[e.category] || 0) + e.price;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([category, total]) => ({ category, total }));
}

export async function getMonthlyTotals(year) {
  const entries = await localforage.getItem(STORE_KEY) || [];
  const arr = new Array(12).fill(0);
  for (const e of entries) {
    const d = new Date(e.date);
    if (d.getFullYear() === year) arr[d.getMonth()] += e.price;
  }
  return arr;
}

export async function getTopExpenses(n = 5) {
  const entries = await localforage.getItem(STORE_KEY) || [];
  return [...entries].sort((a, b) => b.price - a.price).slice(0, n);
}

export async function getKmData() {
  const entries = await localforage.getItem(STORE_KEY) || [];
  return [...entries]
    .filter(e => e.km)
    .sort((a, b) => a.km - b.km)
    .map(e => ({ km: e.km, price: e.price, date: e.date, item: e.item }));
}

// ── Settings ────────────────────────────────────────────────────────────────

export async function getSetting(key) {
  const meta = await localforage.getItem(META_KEY) || {};
  return meta[key];
}

export async function setSetting(key, value) {
  const meta = await localforage.getItem(META_KEY) || {};
  meta[key] = value;
  await localforage.setItem(META_KEY, meta);
}

// ── Category helper ─────────────────────────────────────────────────────────

const KEYWORD_MAP = [
  { category: 'Oil Change',     re: /زيت|فلتر.*زيت|oil|filter/i },
  { category: 'Tires',          re: /عجل|تيل.*عجل|بطاحات|زوايا|tire|wheel|alignment/i },
  { category: 'Engine',         re: /موتور|بوجيهات|فلتر بنزين|سير توقيت|كرنك|engine|spark|timing|belt/i },
  { category: 'Suspension',     re: /مساعد|كوبلن|بارات|طنابير|عفشة|suspension|shock|control/i },
  { category: 'AC',             re: /تكيف|تكييف|كمبريسور|فريون|ac|air.*cond|compressor/i },
  { category: 'Electrical',     re: /بطارية|كهرباء|حساس|كنترول|داينمو|battery|sensor|electric/i },
  { category: 'Cooling',        re: /ريدياتير|مياه|طرمبة مياه|قربة|radiator|coolant|water pump/i },
  { category: 'Body & Glass',   re: /سمكرة|زجاج|باب|دوكو|body|glass|door|paint/i },
  { category: 'Brakes',         re: /فرامل|تيل فرامل|brake/i },
  { category: 'Gearbox',        re: /فتيس|دريكسيون|باور|gearbox|transmission|power/i },
  { category: 'General Service',re: /صيانة|service|maintenance/i },
];

export function guessCategory(itemText) {
  for (const { category, re } of KEYWORD_MAP) {
    if (re.test(itemText)) return category;
  }
  return 'Other';
}

export const CATEGORIES = [
  'Oil Change','Tires','Engine','Suspension','AC','Electrical',
  'Cooling','Body & Glass','Brakes','Gearbox','General Service','Other'
];
