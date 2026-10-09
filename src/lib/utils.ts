/**
 * Utility / formatting helpers
 *
 * Small pure functions used across the whole app.
 */

/**
 * Format a number as USD currency.
 * Handles very small values (e.g. $0.0001) without rounding to $0.00.
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return '$0.00';

  // For tiny amounts show more decimal places so they don't appear as $0.00
  if (amount > 0 && amount < 0.01) {
    return `$${amount.toFixed(4)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a large number with commas.
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/**
 * Generate a unique id.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Format a date string into a friendly format.
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
