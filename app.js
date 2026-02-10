// Break-Even Calculator

// Info content for each field
const infoContent = {
  fixed: {
    title: "Fixed Costs",
    text: "Fixed costs are expenses that stay the same regardless of how many units you produce. Examples include rent, salaries, insurance, and equipment leases. These costs must be paid whether you sell 1 unit or 1 million units."
  },
  price: {
    title: "Selling Price per Unit",
    text: "This is the price you charge customers for each unit of your product. Your selling price must be higher than your variable cost per unit to generate a positive contribution margin."
  },
  variable: {
    title: "Variable Cost per Unit",
    text: "Variable costs change based on how many units you produce. Examples include raw materials, packaging, shipping per unit, and sales commissions. The more you produce, the higher your total variable costs."
  },
  margin: {
    title: "Contribution Margin",
    text: "The contribution margin is the amount each unit sold contributes toward covering your fixed costs and generating profit. It's calculated as: Selling Price - Variable Cost. A higher contribution margin means you need to sell fewer units to break even."
  },
  breakeven: {
    title: "Break-Even Volume",
    text: "This is the number of units you need to sell to cover all your costs (both fixed and variable). At this volume, your total revenue equals your total costs — you're not making a profit, but you're not losing money either. Every unit sold above this number generates profit."
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  calculate();
});

// Calculate contribution margin and break-even volume
function calculate() {
  const fixedCosts = parseFloat(document.getElementById('fixed-costs').value) || 0;
  const sellingPrice = parseFloat(document.getElementById('selling-price').value) || 0;
  const variableCost = parseFloat(document.getElementById('variable-cost').value) || 0;

  // Contribution Margin = Selling Price - Variable Cost
  const contributionMargin = sellingPrice - variableCost;

  // Break-Even Volume = Fixed Costs / Contribution Margin
  let breakevenVolume = 0;
  let isError = false;

  if (contributionMargin > 0) {
    breakevenVolume = Math.ceil(fixedCosts / contributionMargin);
  } else {
    isError = true;
  }

  // Update displays
  document.getElementById('contribution-margin').textContent = '$' + contributionMargin.toFixed(2);

  const resultRow = document.querySelector('.calc-row.result');
  if (isError) {
    document.getElementById('breakeven-volume').textContent = 'Price must exceed variable cost';
    resultRow.classList.add('error');
  } else {
    document.getElementById('breakeven-volume').textContent = breakevenVolume.toLocaleString();
    resultRow.classList.remove('error');
  }
}

// Show info modal
function showInfo(type) {
  const info = infoContent[type];
  if (info) {
    document.getElementById('modal-title').textContent = info.title;
    document.getElementById('modal-text').textContent = info.text;
    document.getElementById('info-modal').classList.add('open');
  }
}

// Close info modal
function closeInfo(event) {
  if (!event || event.target === document.getElementById('info-modal')) {
    document.getElementById('info-modal').classList.remove('open');
  }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeInfo();
  }
});
