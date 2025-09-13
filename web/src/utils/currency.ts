/**
 * Format a number as currency with commas and optional decimal places
 */
export function formatCurrency(value: number | string, includeDecimals = false): string {
  // Convert to number and handle invalid inputs
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  
  if (isNaN(numValue)) {
    return '';
  }

  // Format with commas
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  return formatter.format(numValue);
}

/**
 * Parse a formatted currency string back to a number
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point and minus sign
  const cleanValue = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format input value as user types
 */
export function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters
  const numericValue = value.replace(/[^0-9]/g, '');
  
  if (!numericValue) {
    return '';
  }

  // Convert to number and format
  const num = parseInt(numericValue, 10);
  return formatCurrency(num);
}