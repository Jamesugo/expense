// Currency symbols map
export const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$',
  CHF: 'Fr', CNY: '¥', INR: '₹', MXN: 'MX$', BRL: 'R$', KRW: '₩',
  SGD: 'S$', HKD: 'HK$', NOK: 'kr', SEK: 'kr', DKK: 'kr', NZD: 'NZ$',
  ZAR: 'R', NGN: '₦',
};

export const CURRENCIES = Object.keys(CURRENCY_SYMBOLS).map((code) => ({
  code,
  symbol: CURRENCY_SYMBOLS[code],
  label: `${code} (${CURRENCY_SYMBOLS[code]})`,
}));

/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} currency - ISO currency code
 * @param {object} [opts] - Intl.NumberFormat options
 */
export const formatCurrency = (amount, currency = 'USD', opts = {}) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...opts,
    }).format(amount || 0);
  } catch {
    const sym = CURRENCY_SYMBOLS[currency] || '$';
    return `${sym}${(amount || 0).toFixed(2)}`;
  }
};

export const getCurrencySymbol = (currency = 'USD') => CURRENCY_SYMBOLS[currency] || '$';
