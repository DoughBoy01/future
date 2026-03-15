const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  MYR: 'RM',
  HKD: 'HK$',
  JPY: '¥',
  CNY: '¥',
  THB: '฿',
  KRW: '₩',
  IDR: 'Rp',
  PHP: '₱',
  VND: '₫',
  TWD: 'NT$',
  INR: '₹',
};

const CURRENCIES_WITHOUT_DECIMALS = new Set(['JPY', 'KRW', 'VND', 'IDR']);

export function formatCurrency(amount: number, currency: string): string {
  const decimals = CURRENCIES_WITHOUT_DECIMALS.has(currency) ? 0 : 2;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formattedAmount}`;
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}
