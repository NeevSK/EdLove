export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? 'Recently'
    : new Intl.DateTimeFormat([], { dateStyle: 'medium' }).format(date);
}
