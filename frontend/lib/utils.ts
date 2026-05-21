export function formatPrice(amount: number, locale: string = 'en'): string {
  if (locale === 'ar') {
    return `${amount.toLocaleString('ar-EG')} ج.م`;
  }
  return `${amount.toLocaleString('en-EG')} EGP`;
}

export function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTomorrowISO(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}
