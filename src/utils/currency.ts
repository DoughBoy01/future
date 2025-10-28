export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
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

  const currenciesWithoutDecimals = ['JPY', 'KRW', 'VND', 'IDR'];
  const decimals = currenciesWithoutDecimals.includes(currency) ? 0 : 2;

  const symbol = currencySymbols[currency] || currency;
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formattedAmount}`;
}

export function getCurrencySymbol(currency: string): string {
  const currencySymbols: Record<string, string> = {
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

  return currencySymbols[currency] || currency;
}
