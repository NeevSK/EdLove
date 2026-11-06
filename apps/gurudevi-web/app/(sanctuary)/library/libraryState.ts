export type BrowserLibraryResource = Readonly<{
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  url: string | null;
  subjects: readonly string[];
  verified: boolean;
  format?: string | null;
  is_official?: boolean;
}>;

export type LibraryLoadState = 'loading' | 'ready' | 'denied' | 'error';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function strings(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/** Validates the small browser projection; never trust an arbitrary API DTO in the floor. */
export function parseBrowserLibraryResources(value: unknown): readonly BrowserLibraryResource[] {
  if (!Array.isArray(value)) throw new Error('Library returned an invalid resource collection.');
  return value.map((item) => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.title !== 'string')
      throw new Error('The Library returned an invalid resource.');
    const res: BrowserLibraryResource = {
      id: item.id,
      title: item.title,
      description: typeof item.description === 'string' ? item.description : null,
      type: typeof item.type === 'string' ? item.type : null,
      url: typeof item.url === 'string' ? item.url : null,
      subjects: strings(item.subjects),
      verified: item.verified === true || item.is_verified === true,
      ...(typeof item.format === 'string' ? { format: item.format } : {}),
      ...(typeof item.is_official === 'boolean' ? { is_official: item.is_official } : {}),
    };
    return res;
  });
}

export function safeResourceUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function classifyLibraryFailure(
  error: unknown,
): Exclude<LibraryLoadState, 'loading' | 'ready'> {
  const message = error instanceof Error ? error.message : '';
  const status = isRecord(error) ? error.status : undefined;
  const code = isRecord(error) ? error.code : undefined;
  return status === 401 ||
    status === 403 ||
    code === 'UNAUTHORIZED' ||
    /401|403|forbidden|unauthorized/i.test(message)
    ? 'denied'
    : 'error';
}

/** Pure filter function for library resources across categories, query and sorting */
export function filterBrowserResources(
  resources: readonly BrowserLibraryResource[],
  query: string,
  category: string,
  sort: 'recent' | 'popular' | 'most_endorsed' = 'recent',
): readonly BrowserLibraryResource[] {
  const q = query.trim().toLowerCase();
  let list = resources;

  if (category && category !== 'All' && category !== 'saved') {
    list = list.filter((r) => r.type?.toLowerCase() === category.toLowerCase());
  }

  if (q) {
    list = list.filter(
      (r) =>
        (r.title ?? '').toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.subjects ?? []).some((s) => s.toLowerCase().includes(q)),
    );
  }

  if (sort === 'most_endorsed') {
    return [...list].sort((a, b) => Number(b.verified) - Number(a.verified));
  }

  return list;
}

/** Strictly isolated guest bookmarks store (never merged or synced to real accounts) */
const GUEST_BOOKMARKS_KEY = 'gurudevi_library_bookmarks_guest';

export function getGuestBookmarks(): Set<string> {
  if (typeof window === 'undefined') return new Set(['mangroves']);
  try {
    const stored = window.localStorage.getItem(GUEST_BOOKMARKS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set(['mangroves']);
  } catch {
    return new Set(['mangroves']);
  }
}

export function persistGuestBookmarks(bookmarks: ReadonlySet<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_BOOKMARKS_KEY, JSON.stringify(Array.from(bookmarks)));
  } catch {
    // LocalStorage fallback
  }
}

