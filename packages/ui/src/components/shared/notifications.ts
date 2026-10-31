/** Platform-neutral rules for notification lists. */

export const NOTIFICATION_ENGLISH = {
  unread: 'Unread',
  markRead: 'Mark as read',
  today: 'Today',
  yesterday: 'Yesterday',
};

export interface DayGroup<T> {
  key: string;
  label: string;
  items: T[];
}

/**
 * Items grouped by calendar day, newest first: "Today", "Yesterday", then
 * the date in the reader's locale. Dates that cannot be read go last.
 */
export function groupByDay<T>(
  items: readonly T[],
  dateOf: (item: T) => string,
  now: Date = new Date(),
  locale?: string,
  words: { today: string; yesterday: string } = NOTIFICATION_ENGLISH,
): DayGroup<T>[] {
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const today = dayKey(now);
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yesterday = dayKey(y);
  const groups = new Map<string, DayGroup<T> & { at: number }>();
  for (const item of items) {
    const d = new Date(dateOf(item));
    const valid = !Number.isNaN(d.getTime());
    const key = valid ? dayKey(d) : 'unknown';
    const label = !valid
      ? '—'
      : key === today
        ? words.today
        : key === yesterday
          ? words.yesterday
          : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(d);
    const g = groups.get(key) ?? { key, label, items: [], at: valid ? d.getTime() : -Infinity };
    g.items.push(item);
    g.at = Math.max(g.at, valid ? d.getTime() : -Infinity);
    groups.set(key, g);
  }
  return [...groups.values()].sort((a, b) => b.at - a.at).map(({ at: _at, ...g }) => g);
}
