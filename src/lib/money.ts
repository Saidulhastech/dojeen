// Format a numeric amount as currency using the store's currency code.
// Falls back to "<amount> <code>" if Intl can't resolve the currency.
export function formatMoney(amount: number, currency?: string): string {
  const cur = currency || 'USD';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${cur}`;
  }
}
