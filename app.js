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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateAll(500000);
});

// Select volume
function selectVolume(volume) {
  // Update button states
  document.querySelectorAll('.volume-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.volume) === volume) {
      btn.classList.add('active');
    }
  });

  updateAll(volume);
}

// Update all displays
function updateAll(volume) {
  updateVolumeDisplay(volume);
  updateProfitAnalysis(volume);
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

