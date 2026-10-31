import { safeFileUrl } from './files';

/** English words for the basic pieces; screens pass their own for si and ta. */
export const BASICS_ENGLISH = {
  dismiss: 'Dismiss',
  clear: 'Clear search',
  results: (count: number) => (count === 1 ? '1 result' : `${count} results`),
  decrease: 'Decrease',
  increase: 'Increase',
  step: (n: number, total: number) => `Step ${n} of ${total}`,
  done: 'Done',
  error: 'Needs attention',
};

/** A number kept inside its bounds and on its step from `min` (or zero). */
export function clampStep(value: number, min = -Infinity, max = Infinity, step = 1): number {
  const base = Number.isFinite(min) ? min : 0;
  const snapped = base + Math.round((value - base) / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

export const SETTINGS_ENGLISH = {
  notSet: 'Not set',
  opensOutside: 'Opens outside the app',
  cancel: 'Cancel',
  working: 'Working…',
};

/**
 * An address safe to open from a settings link: the file rules (https, http,
 * relative) plus mail and phone, which settings rows commonly offer.
 */
export function safeLinkUrl(uri: string): string | null {
  const value = uri.trim();
  if (/^(mailto|tel):[^\s\u0000-\u001F\u007F]+$/i.test(value)) return value;
  return safeFileUrl(value);
}

export const LAUNCHER_ENGLISH = {
  search: 'Search rooms and tools',
  recent: 'Recent',
  keep: 'Keep in tabs',
  kept: (title: string) => `${title} kept in tabs`,
  results: (count: number) => (count === 1 ? '1 result' : `${count} results`),
  empty: 'Nothing matches. Try another word.',
  other: 'More',
};

export interface LauncherSection<T> {
  key: string;
  title: string | null;
  items: T[];
}

/**
 * Launcher items as sections: Recent first (when not searching), then each
 * group in the order its first item appears, ungrouped ones under "More".
 * A search keeps only items whose title, description or group has every word.
 */
export function launcherSections<
  T extends { id: string; title: string; description?: string; group?: string },
>(
  items: readonly T[],
  query: string,
  recent: readonly string[] = [],
  words: { recent: string; other: string } = LAUNCHER_ENGLISH,
): LauncherSection<T>[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const found = terms.length
    ? items.filter((item) => {
        const hay = [item.title, item.description, item.group]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();
        return terms.every((t) => hay.includes(t));
      })
    : [...items];
  const sections: LauncherSection<T>[] = [];
  if (!terms.length && recent.length) {
    const byId = new Map(items.map((i) => [i.id, i]));
    const latest = recent
      .map((id) => byId.get(id))
      .filter((i): i is T => !!i)
      .slice(0, 4);
    if (latest.length) sections.push({ key: '__recent', title: words.recent, items: latest });
  }
  const groups = new Map<string, T[]>();
  const loose: T[] = [];
  for (const item of found) {
    if (!item.group) loose.push(item);
    else groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  }
  for (const [group, list] of groups) sections.push({ key: group, title: group, items: list });
  if (loose.length)
    sections.push({ key: '__other', title: groups.size ? words.other : null, items: loose });
  return sections;
}
