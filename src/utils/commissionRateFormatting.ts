/**
 * Commission Rate Formatting Utilities
 *
 * Provides consistent formatting for commission rates, earnings breakdowns,
 * and commission-related messaging throughout the application.
 */

/**
 * Format commission rate as a split between organizer and platform
 * @param rate - Commission rate as decimal (e.g., 0.15 for 15%)
 * @returns Formatted string like "85% to you, 15% to us"
 */
export function formatCommissionSplit(rate: number): string {
  const organizerPercentage = ((1 - rate) * 100).toFixed(0);
  const platformPercentage = (rate * 100).toFixed(0);
  return `${organizerPercentage}% to you, ${platformPercentage}% to us`;
}

/**
 * Format earnings breakdown for a given price and commission rate
 * @param rate - Commission rate as decimal (e.g., 0.15 for 15%)
 * @param price - Price amount
 * @returns Object with formatted amounts and percentages
 */
export function formatEarningsBreakdown(
  rate: number,
  price: number
): {
  organizerAmount: string;
  platformAmount: string;
  organizerPercentage: string;
  platformPercentage: string;
} {
  const organizerAmount = price * (1 - rate);
  const platformAmount = price * rate;
  const organizerPercentage = ((1 - rate) * 100).toFixed(0);
  const platformPercentage = (rate * 100).toFixed(0);

  return {
    organizerAmount: organizerAmount.toFixed(2),
    platformAmount: platformAmount.toFixed(2),
    organizerPercentage,
    platformPercentage,
  };
}

/**
 * Format commission rate as a percentage
 * @param rate - Commission rate as decimal (e.g., 0.15 for 15%)
 * @param precision - Number of decimal places (default 1)
 * @returns Formatted percentage string like "15.0%"
 */
export function formatRatePercentage(rate: number, precision: number = 1): string {
  return `${(rate * 100).toFixed(precision)}%`;
}

/**
 * Format organizer's keep percentage (inverse of commission)
 * @param rate - Commission rate as decimal (e.g., 0.15 for 15%)
 * @param precision - Number of decimal places (default 1)
 * @returns Formatted percentage string like "85.0%"
 */
export function formatOrganizerKeepPercentage(rate: number, precision: number = 1): string {
  return `${((1 - rate) * 100).toFixed(precision)}%`;
}

/**
 * Calculate organizer earnings from a price and commission rate
 * @param price - Price amount
 * @param rate - Commission rate as decimal (e.g., 0.15 for 15%)
 * @returns Organizer's earnings as number
 */
export function calculateOrganizerEarnings(price: number, rate: number): number {
  return price * (1 - rate);
}

/**
 * Calculate platform commission from a price and commission rate
 * @param price - Price amount
 * @param rate - Commission rate as decimal (e.g., 0.15 for 15%)
 * @returns Platform commission as number
 */
export function calculatePlatformCommission(price: number, rate: number): number {
  return price * rate;
}

/**
 * Format a detailed earnings message for display
 * @param rate - Commission rate as decimal
 * @param price - Price amount
 * @returns Formatted message like "You'll keep 85% of $300.00 = $255.00 per booking. We keep 15% ($45.00) as our commission."
 */
export function formatDetailedEarningsMessage(rate: number, price: number): string {
  const breakdown = formatEarningsBreakdown(rate, price);
  return `You'll keep ${breakdown.organizerPercentage}% of $${price.toFixed(2)} = $${
    breakdown.organizerAmount
  } per booking. We keep ${breakdown.platformPercentage}% ($${
    breakdown.platformAmount
  }) as our commission.`;
}

/**
 * Parse commission rate from various input formats
 * @param input - Input as string or number (e.g., "15", "0.15", 15, 0.15)
 * @returns Commission rate as decimal (0-1 range)
 * @throws Error if input is invalid
 */
export function parseCommissionRate(input: string | number): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num)) {
    throw new Error('Invalid commission rate: must be a number');
  }

  // If > 1, assume it's a percentage (e.g., 15 means 15%)
  const rate = num > 1 ? num / 100 : num;

  if (rate < 0 || rate > 1) {
    throw new Error('Commission rate must be between 0 and 1 (0% to 100%)');
  }

  return rate;
}

/**
 * Validate commission rate is within acceptable range
 * @param rate - Commission rate to validate
 * @returns True if valid, false otherwise
 */
export function isValidCommissionRate(rate: number): boolean {
  return !isNaN(rate) && rate >= 0 && rate <= 1;
}
