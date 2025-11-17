/**
 * Currency conversion utilities
 * Exchange rates updated: 2025-11-17
 * Rates sourced from multiple financial data providers for November 2025
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  SGD: 'S$',
  NZD: 'NZ$',
  HKD: 'HK$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  MXN: 'MX$',
  BRL: 'R$',
  ZAR: 'R',
  KRW: '₩',
  THB: '฿',
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  SGD: 'Singapore Dollar',
  NZD: 'New Zealand Dollar',
  HKD: 'Hong Kong Dollar',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  MXN: 'Mexican Peso',
  BRL: 'Brazilian Real',
  ZAR: 'South African Rand',
  KRW: 'South Korean Won',
  THB: 'Thai Baht',
};

// Exchange rates relative to USD (1 USD = X currency)
// Updated with current rates as of November 17, 2025
// In production, these should be fetched from an API like exchangerate-api.com or fixer.io
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.8604,
  GBP: 0.76,
  JPY: 154.035,
  AUD: 1.563,
  CAD: 1.403,
  CHF: 0.7953,
  CNY: 7.10,
  INR: 88.689,
  SGD: 1.2975,
  NZD: 1.754,
  HKD: 7.7722,
  SEK: 9.32,
  NOK: 9.91,
  DKK: 6.4245,
  MXN: 18.32,
  BRL: 5.30,
  ZAR: 17.121,
  KRW: 1457,
  THB: 32.214,
};

export interface ConvertedPrice {
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
  originalAmount: number;
  originalCurrency: string;
  isConverted: boolean;
}

/**
 * Convert price from one currency to another
 */
export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;

  return convertedAmount;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(
  amount: number,
  currency: string,
  options: {
    showDecimals?: boolean;
    showCurrency?: boolean;
  } = {}
): string {
  const { showDecimals = true, showCurrency = true } = options;

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  // For currencies that typically don't use decimals (JPY, KRW)
  const noDecimalCurrencies = ['JPY', 'KRW'];
  const shouldShowDecimals = showDecimals && !noDecimalCurrencies.includes(currency);

  const formattedAmount = shouldShowDecimals
    ? amount.toFixed(2)
    : Math.round(amount).toString();

  // Format with thousands separator
  const parts = formattedAmount.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const finalAmount = parts.join('.');

  if (!showCurrency) {
    return finalAmount;
  }

  // Position symbol based on currency
  const symbolAfterCurrencies = ['SEK', 'NOK', 'DKK'];
  if (symbolAfterCurrencies.includes(currency)) {
    return `${finalAmount} ${symbol}`;
  }

  return `${symbol}${finalAmount}`;
}

/**
 * Get converted price with all details
 */
export function getConvertedPrice(
  amount: number,
  originalCurrency: string,
  targetCurrency: string
): ConvertedPrice {
  const isConverted = originalCurrency !== targetCurrency;
  const convertedAmount = isConverted
    ? convertPrice(amount, originalCurrency, targetCurrency)
    : amount;

  return {
    amount: convertedAmount,
    currency: targetCurrency,
    symbol: CURRENCY_SYMBOLS[targetCurrency] || targetCurrency,
    formatted: formatPrice(convertedAmount, targetCurrency),
    originalAmount: amount,
    originalCurrency,
    isConverted,
  };
}

/**
 * Detect user's currency based on browser locale
 */
export function detectUserCurrency(): string {
  try {
    const locale = navigator.language || 'en-US';

    // Map common locales to currencies
    const localeToCurrency: Record<string, string> = {
      'en-US': 'USD',
      'en-GB': 'GBP',
      'en-AU': 'AUD',
      'en-CA': 'CAD',
      'en-NZ': 'NZD',
      'en-SG': 'SGD',
      'en-IN': 'INR',
      'en-HK': 'HKD',
      'en-ZA': 'ZAR',
      'de': 'EUR',
      'de-DE': 'EUR',
      'de-CH': 'CHF',
      'fr': 'EUR',
      'fr-FR': 'EUR',
      'fr-CH': 'CHF',
      'fr-CA': 'CAD',
      'es': 'EUR',
      'es-ES': 'EUR',
      'es-MX': 'MXN',
      'it': 'EUR',
      'pt-BR': 'BRL',
      'ja': 'JPY',
      'ko': 'KRW',
      'zh-CN': 'CNY',
      'zh-HK': 'HKD',
      'zh-SG': 'SGD',
      'th': 'THB',
      'sv': 'SEK',
      'no': 'NOK',
      'da': 'DKK',
    };

    // Try exact match first
    if (localeToCurrency[locale]) {
      return localeToCurrency[locale];
    }

    // Try language code only (e.g., 'en' from 'en-US')
    const language = locale.split('-')[0];
    if (localeToCurrency[language]) {
      return localeToCurrency[language];
    }

    // Default to USD
    return 'USD';
  } catch {
    return 'USD';
  }
}

/**
 * Get popular currencies for quick selection
 */
export function getPopularCurrencies(): string[] {
  return ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'CNY'];
}

/**
 * Get all supported currencies
 */
export function getAllCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES).sort();
}
