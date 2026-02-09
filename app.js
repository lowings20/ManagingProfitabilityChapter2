// Break-Even Analysis Widget

// Core formulas
const PRICE = 4.00;

const options = {
  coPacker: { name: "Co-Packer", vc: 2.80, fixed: 450000, color: "#3B82F6", key: "copacker" },
  retrofit: { name: "Retrofit", vc: 1.80, fixed: 888000, color: "#F59E0B", key: "retrofit" },
  newPlant: { name: "New Plant", vc: 0.80, fixed: 1274000, color: "#10B981", key: "newplant" },
};

const revenue = (volume) => PRICE * volume;
const totalCost = (option, volume) => option.fixed + option.vc * volume;
const profit = (option, volume) => revenue(volume) - totalCost(option, volume);
const breakeven = (option) => option.fixed / (PRICE - option.vc);
const contributionMargin = (option) => PRICE - option.vc;

const demandScenarios = {
  low: 350000,
  medium: 500000,
  high: 650000,
};

// Chart instance
let chart;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initChart();
  updateAll(500000);
  setupSlider();
});

// Setup slider
function setupSlider() {
  const slider = document.getElementById('volume-slider');
  slider.addEventListener('input', (e) => {
    const volume = parseInt(e.target.value);
    updateAll(volume);
  });
}

// Update all displays
function updateAll(volume) {
  updateVolumeDisplay(volume);
  updateProfitAnalysis(volume);
  updateBreakevenBars();
  updateScenarios();
  updateInsight(volume);
  updateChartLine(volume);
}

// Format currency
function formatCurrency(value) {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return (value < 0 ? '-' : '') + '$' + (absValue / 1000000).toFixed(2) + 'M';
  } else if (absValue >= 1000) {
    return (value < 0 ? '-' : '') + '$' + (absValue / 1000).toFixed(0) + 'K';
  }
  return '$' + value.toFixed(0);
}

// Format number with commas
function formatNumber(value) {
  return value.toLocaleString();
}

// Update volume display
function updateVolumeDisplay(volume) {
  document.getElementById('volume-display').textContent = formatNumber(volume) + ' units';
  document.getElementById('analysis-volume').textContent = formatNumber(volume);
}

// Update profit analysis
function updateProfitAnalysis(volume) {
  Object.values(options).forEach(option => {
    const p = profit(option, volume);
    const rev = revenue(volume);
    const cost = totalCost(option, volume);

    const valueEl = document.getElementById(`profit-${option.key}`);
    const breakdownEl = document.getElementById(`breakdown-${option.key}`);

    valueEl.textContent = formatCurrency(p);
    valueEl.className = 'profit-value ' + (p >= 0 ? 'positive' : 'negative');

    breakdownEl.textContent = `Revenue: ${formatCurrency(rev)} | Cost: ${formatCurrency(cost)}`;
  });
}

// Update break-even bars
function updateBreakevenBars() {
  const maxBE = 500000; // Scale for visualization

  Object.values(options).forEach(option => {
    const be = breakeven(option);
    document.getElementById(`be-${option.key}`).textContent = formatNumber(Math.round(be)) + ' units';
    document.getElementById(`bar-${option.key}`).style.width = (be / maxBE * 100) + '%';
  });
}

// Update scenarios table
function updateScenarios() {
  const scenarios = ['low', 'medium', 'high'];

  scenarios.forEach(scenario => {
    const volume = demandScenarios[scenario];
    let bestProfit = -Infinity;
    let bestOption = null;

    // Find best option for this scenario
    Object.values(options).forEach(option => {
      const p = profit(option, volume);
      if (p > bestProfit) {
        bestProfit = p;
        bestOption = option.key;
      }
    });

    // Update cells
    Object.values(options).forEach(option => {
      const p = profit(option, volume);
      const cell = document.getElementById(`scenario-${option.key}-${scenario}`);
      cell.textContent = formatCurrency(p);

      // Reset classes
      cell.className = 'cell';

      if (p >= 0) {
        if (option.key === bestOption) {
          cell.classList.add('best');
        } else {
          cell.classList.add('positive');
        }
      } else {
        cell.classList.add('negative');
      }
    });
  });
}

// Update insight
function updateInsight(volume) {
  const profits = Object.values(options).map(opt => ({
    name: opt.name,
    profit: profit(opt, volume),
    be: breakeven(opt),
    cm: contributionMargin(opt)
  }));

  profits.sort((a, b) => b.profit - a.profit);
  const best = profits[0];
  const worst = profits[2];

  let insight = '';

  if (volume < Math.min(...profits.map(p => p.be))) {
    insight = `At ${formatNumber(volume)} units, <strong>all options operate at a loss</strong>. You need to reach at least ${formatNumber(Math.round(Math.min(...profits.map(p => p.be))))} units to break even with the most conservative option.`;
  } else if (best.profit > 0 && worst.profit < 0) {
    insight = `At ${formatNumber(volume)} units, <strong>${best.name}</strong> is the most profitable option (${formatCurrency(best.profit)}), while <strong>${worst.name}</strong> is still operating at a loss.`;
  } else {
    insight = `At ${formatNumber(volume)} units, <strong>${best.name}</strong> generates the highest profit (${formatCurrency(best.profit)}). The difference from the least profitable option is ${formatCurrency(best.profit - worst.profit)}.`;
  }

  // Add strategic insight
  if (volume > 600000) {
    insight += ` At high volumes, <strong>New Plant's lower variable cost ($0.80)</strong> delivers the best margins.`;
  } else if (volume < 400000) {
    insight += ` At lower volumes, <strong>Co-Packer's lower fixed costs</strong> minimize risk.`;
  }

  document.getElementById('insight-text').innerHTML = insight;
}

// Initialize chart
function initChart() {
  const ctx = document.getElementById('breakeven-chart').getContext('2d');

  // Generate data points
  const volumes = [];
  for (let v = 0; v <= 1000000; v += 25000) {
    volumes.push(v);
  }

  // Revenue line
  const revenueData = volumes.map(v => revenue(v));

  // Cost lines for each option
  const datasets = [
    {
      label: 'Revenue',
      data: revenueData,
      borderColor: '#6366F1',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      tension: 0,
    }
  ];

  Object.values(options).forEach(option => {
    datasets.push({
      label: option.name + ' Total Cost',
      data: volumes.map(v => totalCost(option, v)),
      borderColor: option.color,
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      tension: 0,
    });
  });

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: volumes,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: {
              family: "'Public Sans', sans-serif",
              size: 12,
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(14, 0, 57, 0.9)',
          titleFont: { family: "'Public Sans', sans-serif", size: 13 },
          bodyFont: { family: "'Public Sans', sans-serif", size: 12 },
          padding: 12,
          callbacks: {
            title: (items) => formatNumber(items[0].parsed.x) + ' units',
            label: (item) => item.dataset.label + ': ' + formatCurrency(item.parsed.y)
          }
        },
        annotation: {
          annotations: {}
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Production Volume (units)',
            font: { family: "'Public Sans', sans-serif", size: 12, weight: '600' }
          },
          ticks: {
            callback: (value, index) => {
              if (index % 4 === 0) return (value / 1000) + 'K';
              return '';
            },
            font: { family: "'Public Sans', sans-serif", size: 11 }
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Dollars ($)',
            font: { family: "'Public Sans', sans-serif", size: 12, weight: '600' }
          },
          ticks: {
            callback: (value) => formatCurrency(value),
            font: { family: "'Public Sans', sans-serif", size: 11 }
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        }
      }
    }
  });
}

// Update chart with volume line
function updateChartLine(volume) {
  // Could add a vertical line at current volume if desired
  // For now, chart is static showing all cost/revenue lines
}
