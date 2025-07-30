// --- CONFIGURATION CONSTANTS ---
const NRV_TARGET = 3000000;
const ER_TARGET = 450000;

const achievementTiers = [50, 75, 100, 110, 120, 150];

// Fixed incentive amounts for NRV based on the achievement tier
const nrvFixedIncentives = {
    50: 7500,
    75: 16875,
    100: 30000,
    110: 33000,
    120: 36000,
    150: 45000
};

// Fixed incentive amounts for ER based on the achievement tier
const erFixedIncentives = {
    50: 4500,
    75: 16875,
    100: 45000,
    110: 59400,
    120: 64800,
    150: 81000
};

// Configuration for the New Customer Booster
const NEW_CUSTOMER_BOOSTER_THRESHOLD = 0.60; // 60%
const NEW_CUSTOMER_BOOSTER_RATE = 0.03; // 3%

// --- DOM ELEMENT REFERENCES ---
const nrvActualInput = document.getElementById('nrvActual');
const erActualInput = document.getElementById('erActual');
const erNewCustomersInput = document.getElementById('erNewCustomers');
const sihConditionCheckbox = document.getElementById('sihCondition');
const calculateBtn = document.getElementById('calculateBtn');
const resultsDiv = document.getElementById('results');
const sihWarningDiv = document.getElementById('sihWarning');
const resultsContentDiv = document.getElementById('resultsContent');
const nrvPercentEl = document.getElementById('nrvPercent');
const erPercentEl = document.getElementById('erPercent');
const finalAchievementTierEl = document.getElementById('finalAchievementTier');
const nrvIncentiveEl = document.getElementById('nrvIncentive');
const erIncentiveEl = document.getElementById('erIncentive');
const boosterIncentiveEl = document.getElementById('boosterIncentive');
const totalIncentiveEl = document.getElementById('totalIncentive');
const payout1El = document.getElementById('payout1');
const payout2El = document.getElementById('payout2');

// --- FUNCTIONS ---

/**
 * Formats a number into Indian Rupee currency format.
 * @param {number} num - The number to format.
 * @returns {string} - The formatted currency string.
 */
function formatCurrency(num) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

/**
 * Finds the applicable achievement tier based on the percentage.
 * @param {number} percent - The achievement percentage.
 * @returns {number} - The applicable tier or 0 if not met.
 */
function getAchievementTier(percent) {
    let applicableTier = 0;
    for (const tier of achievementTiers) {
        if (percent >= tier) {
            applicableTier = tier;
        } else {
            break;
        }
    }
    return applicableTier;
}

/**
 * Main calculation logic.
 */
function calculateIncentive() {
    // 1. Get user inputs
    const nrvActual = parseFloat(nrvActualInput.value) || 0;
    const erActual = parseFloat(erActualInput.value) || 0;
    const erNewCustomers = parseFloat(erNewCustomersInput.value) || 0;
    const isSihMet = sihConditionCheckbox.checked;

    resultsDiv.classList.remove('hidden');

    // 2. Validate: ER New Customers should not exceed ER Actual
    if (erNewCustomers > erActual) {
        alert("Error: ER from New Customers cannot exceed ER Actual.");
        updateUI(0, 0, 0, 0, 0, 0, 0);
        resultsContentDiv.classList.add('hidden');
        sihWarningDiv.classList.add('hidden');
        return;
    }

    // 3. Check S.I.H. condition
    if (!isSihMet) {
        sihWarningDiv.classList.remove('hidden');
        resultsContentDiv.classList.add('hidden');
        updateUI(0, 0, 0, 0, 0, 0, 0);
        return;
    }

    sihWarningDiv.classList.add('hidden');
    resultsContentDiv.classList.remove('hidden');

    // 4. Calculate achievement percentages
    const nrvAchievedPercent = (nrvActual / NRV_TARGET) * 100;
    const erAchievedPercent = (erActual / ER_TARGET) * 100;

    // 5. Determine the final achievement tier (the lower of the two)
    const finalAchievementPercent = Math.min(nrvAchievedPercent, erAchievedPercent);
    const finalTier = getAchievementTier(finalAchievementPercent);

    // Also determine individual tiers
    const nrvTier = getAchievementTier(nrvAchievedPercent);
    const erTier = getAchievementTier(erAchievedPercent);

    let nrvIncentive = 0;
    let erIncentive = 0;

    // 6. Get fixed incentive amounts
    if (nrvTier > 0) {
        nrvIncentive = nrvFixedIncentives[nrvTier] || 0;
    }
    if (erTier > 0) {
        erIncentive = erFixedIncentives[erTier] || 0;
    }

    // 7. Calculate New Customer Booster
    let boosterIncentive = 0;
    if (erActual > 0) {
        const newCustomerRatio = erNewCustomers / erActual;
        if (newCustomerRatio > NEW_CUSTOMER_BOOSTER_THRESHOLD) {
            boosterIncentive = erActual * NEW_CUSTOMER_BOOSTER_RATE;
        }
    }

    // 8. Calculate total incentive
    const totalIncentive = nrvIncentive + erIncentive + boosterIncentive;

    // 9. Update the UI
    updateUI(
        nrvAchievedPercent,
        erAchievedPercent,
        finalTier,
        nrvIncentive,
        erIncentive,
        boosterIncentive,
        totalIncentive
    );
}

/**
 * Updates all the result elements in the UI.
 */
function updateUI(nrvPercent, erPercent, finalTier, nrvInc, erInc, boosterInc, totalInc) {
    nrvPercentEl.textContent = `${nrvPercent.toFixed(2)}%`;
    erPercentEl.textContent = `${erPercent.toFixed(2)}%`;
    finalAchievementTierEl.textContent = `${finalTier}%`;

    nrvIncentiveEl.textContent = formatCurrency(nrvInc);
    erIncentiveEl.textContent = formatCurrency(erInc);
    boosterIncentiveEl.textContent = formatCurrency(boosterInc);

    totalIncentiveEl.textContent = formatCurrency(totalInc);
    payout1El.textContent = formatCurrency(totalInc / 2);
    payout2El.textContent = formatCurrency(totalInc / 2);
}

// --- EVENT LISTENERS ---
calculateBtn.addEventListener('click', calculateIncentive);
