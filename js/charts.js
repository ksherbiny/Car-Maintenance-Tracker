// js/charts.js — Chart.js builders
// All charts share the primary blue palette

const PALETTE = [
  '#0070C0','#1a8fd1','#33aee3','#66c5ed','#99daf6',
  '#005a9e','#003f6e','#f5a623','#27ae60','#e74c3c',
  '#8e44ad','#2ecc71'
];

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => ` ${Number(ctx.parsed.y ?? ctx.parsed).toLocaleString('en-US')} EGP`
      }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { family: "'Cairo', sans-serif", size: 11 } } },
    y: {
      grid: { color: '#e2e8f0' },
      ticks: {
        font: { family: "'Cairo', sans-serif", size: 11 },
        callback: v => v >= 1000 ? (v / 1000) + 'k' : v
      }
    }
  }
};

// Active chart instances keyed by canvas id — destroy before re-render
const _instances = {};

function destroyIfExists(id) {
  if (_instances[id]) { _instances[id].destroy(); delete _instances[id]; }
}

// ── 1. Yearly spending bar chart ─────────────────────────────────────────────
export function renderYearlyChart(canvasId, yearlyData) {
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  _instances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: yearlyData.map(d => d.year),
      datasets: [{
        data: yearlyData.map(d => d.total),
        backgroundColor: yearlyData.map((_, i) => i === yearlyData.length - 1 ? '#f5a623' : '#0070C0'),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      ...BASE_OPTS,
      plugins: {
        ...BASE_OPTS.plugins,
        tooltip: {
          callbacks: { label: ctx => ` ${Number(ctx.parsed.y).toLocaleString('en-US')} EGP` }
        }
      }
    }
  });
}

// ── 2. Category doughnut ─────────────────────────────────────────────────────
export function renderCategoryChart(canvasId, catData) {
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  _instances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: catData.map(d => d.category),
      datasets: [{
        data: catData.map(d => d.total),
        backgroundColor: PALETTE,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { font: { family: "'Cairo', sans-serif", size: 11 }, padding: 10, boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${Number(ctx.parsed).toLocaleString('en-US')} EGP`
          }
        }
      }
    }
  });
}

// ── 3. Cost vs Odometer line chart ───────────────────────────────────────────
export function renderKmChart(canvasId, kmData) {
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  // Bin entries by every 20k km and sum prices
  const bins = {};
  for (const d of kmData) {
    const bin = Math.floor(d.km / 20) * 20;
    bins[bin] = (bins[bin] || 0) + d.price;
  }
  const sorted = Object.entries(bins).sort((a, b) => +a[0] - +b[0]);

  _instances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sorted.map(([k]) => k + 'k'),
      datasets: [{
        data: sorted.map(([, v]) => v),
        borderColor: '#0070C0',
        backgroundColor: 'rgba(0,112,192,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#0070C0'
      }]
    },
    options: {
      ...BASE_OPTS,
      plugins: {
        ...BASE_OPTS.plugins,
        legend: { display: false }
      }
    }
  });
}

// ── 4. Monthly spending bar (current year) ───────────────────────────────────
export function renderMonthlyChart(canvasId, monthlyArr) {
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  _instances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        data: monthlyArr,
        backgroundColor: '#0070C0',
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: { ...BASE_OPTS }
  });
}

// ── 5. Top 5 expenses horizontal bar ────────────────────────────────────────
export function renderTopExpensesChart(canvasId, topEntries) {
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  _instances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topEntries.map(e => e.item.length > 20 ? e.item.slice(0, 20) + '…' : e.item),
      datasets: [{
        data: topEntries.map(e => e.price),
        backgroundColor: PALETTE.slice(0, topEntries.length),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      ...BASE_OPTS,
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: '#e2e8f0' },
          ticks: {
            font: { family: "'Cairo', sans-serif", size: 11 },
            callback: v => v >= 1000 ? (v / 1000) + 'k' : v
          }
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: "'Cairo', sans-serif", size: 11 } }
        }
      }
    }
  });
}

// ── Mini home chart (last 5 years) ───────────────────────────────────────────
export function renderHomeChart(canvasId, yearlyData) {
  const last5 = yearlyData.slice(-5);
  destroyIfExists(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  _instances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: last5.map(d => d.year),
      datasets: [{
        data: last5.map(d => d.total),
        backgroundColor: last5.map((_, i) => i === last5.length - 1 ? '#f5a623' : 'rgba(0,112,192,0.65)'),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${Number(ctx.parsed.y).toLocaleString('en-US')} EGP` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: {
          display: false,
          grid: { display: false }
        }
      }
    }
  });
}
