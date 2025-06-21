export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount)
}

export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and spaces, replace comma with dot
  const cleanString = currencyString
    .replace(/[€$£¥₪]/g, '')
    .replace(/\s/g, '')
    .replace(',', '.')
  
  return parseFloat(cleanString) || 0
}