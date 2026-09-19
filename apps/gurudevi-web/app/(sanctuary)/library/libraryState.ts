export type BrowserLibraryResource = Readonly<{
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  url: string | null;
  subjects: readonly string[];
  verified: boolean;
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
    return {
      id: item.id,
      title: item.title,
      description: typeof item.description === 'string' ? item.description : null,
      type: typeof item.type === 'string' ? item.type : null,
      url: typeof item.url === 'string' ? item.url : null,
      subjects: strings(item.subjects),
      verified: item.verified === true || item.is_verified === true,
    };
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
