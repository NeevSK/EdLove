export type LibraryLoadState = 'loading' | 'ready' | 'denied' | 'unavailable' | 'error';

export type BrowserLibraryResource = Readonly<{
  id: string;
  title: string;
  type: string;
  description: string | null;
  subjects: readonly string[];
  verified: boolean;
  url: string | null;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseBrowserLibraryResources(value: unknown): readonly BrowserLibraryResource[] {
  if (!Array.isArray(value)) throw new Error('The Library returned an invalid resource list.');
  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.type !== 'string' ||
      (item.description !== null && typeof item.description !== 'string') ||
      !Array.isArray(item.subjects) ||
      !item.subjects.every((subject): subject is string => typeof subject === 'string') ||
      typeof item.verified !== 'boolean' ||
      (item.url !== null && typeof item.url !== 'string')
    ) {
      throw new Error('The Library returned an invalid resource.');
    }
    return {
      id: item.id,
      title: item.title,
      type: item.type,
      description: item.description,
      subjects: item.subjects,
      verified: item.verified,
      url: item.url,
    };
  });
}

export function classifyLibraryFailure(error: unknown): LibraryLoadState {
  if (!error || typeof error !== 'object') return 'error';
  if ('status' in error && (error.status === 401 || error.status === 403)) return 'denied';
  if ('code' in error && (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN'))
    return 'denied';
  return 'error';
}

export function safeResourceUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : null;
  } catch {
    return null;
  }
}
