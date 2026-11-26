import { z } from 'zod';

/**
 * The shapes inside an `.h5p` file (a zip): `h5p.json` at the root, `content/content.json`, and
 * one folder per bundled library named `MachineName-major.minor` holding `library.json`.
 * These are H5P's own formats, parsed from untrusted files. Nothing here is stored as a
 * Gurudevi record; a learning record is made from the player's events by an adapter.
 */

// Real exports carry versions as numbers, and some older tools write numeric strings.
const version = z.union([
  z.number().int().nonnegative(),
  z.string().regex(/^\d+$/).transform(Number),
]);

export const H5PDependency = z.object({
  machineName: z.string().regex(/^[\w.-]+$/),
  majorVersion: version,
  minorVersion: version,
});
export type H5PDependency = z.infer<typeof H5PDependency>;

export const H5PManifest = z.object({
  title: z.string().min(1),
  mainLibrary: z.string().regex(/^[\w.-]+$/),
  language: z.string().optional(),
  defaultLanguage: z.string().optional(),
  embedTypes: z.array(z.enum(['div', 'iframe'])).min(1),
  preloadedDependencies: z.array(H5PDependency).min(1),
  license: z.string().optional(),
  authors: z.array(z.object({ name: z.string(), role: z.string().optional() })).optional(),
  source: z.string().optional(),
});
export type H5PManifest = z.infer<typeof H5PManifest>;

const assetPath = z.object({ path: z.string().min(1) });

export const H5PLibrary = z.object({
  machineName: z.string().regex(/^[\w.-]+$/),
  majorVersion: version,
  minorVersion: version,
  patchVersion: version,
  title: z.string().optional(),
  runnable: z.union([z.literal(0), z.literal(1), z.boolean()]).optional(),
  preloadedJs: z.array(assetPath).optional(),
  preloadedCss: z.array(assetPath).optional(),
  preloadedDependencies: z.array(H5PDependency).optional(),
  dynamicDependencies: z.array(H5PDependency).optional(),
});
export type H5PLibrary = z.infer<typeof H5PLibrary>;

/** `H5P.MultiChoice-1.16`: the folder name and the key a library is known by. */
export const libraryKey = (
  d: Pick<H5PDependency, 'machineName' | 'majorVersion' | 'minorVersion'>,
): string => `${d.machineName}-${d.majorVersion}.${d.minorVersion}`;

export type H5PProblemCode =
  | 'archive_unreadable'
  | 'too_many_entries'
  | 'too_large'
  | 'unsafe_path'
  | 'file_type_not_allowed'
  | 'script_outside_library'
  | 'duplicate_entry'
  | 'manifest_missing'
  | 'manifest_invalid'
  | 'content_missing'
  | 'content_invalid'
  | 'main_library_not_preloaded'
  | 'library_missing'
  | 'library_invalid'
  | 'library_mismatch'
  | 'asset_missing';

export interface H5PProblem {
  readonly code: H5PProblemCode;
  readonly path?: string;
  readonly detail?: string;
}

/**
 * What a package may hold. H5P core's default allow-list, without `swf` (Flash) and with
 * scripts and styles allowed only inside library folders, so content can never carry code.
 */
export const CONTENT_EXTENSIONS: ReadonlySet<string> = new Set([
  'json',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'tif',
  'tiff',
  'svg',
  'webp',
  'avif',
  'eot',
  'ttf',
  'woff',
  'woff2',
  'otf',
  'webm',
  'mp4',
  'ogg',
  'oga',
  'mp3',
  'm4a',
  'wav',
  'vtt',
  'webvtt',
  'txt',
  'md',
  'textile',
  'csv',
  'xml',
  'pdf',
  'rtf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'odt',
  'ods',
  'odp',
  'gltf',
  'glb',
  'diff',
  'patch',
]);
export const LIBRARY_ONLY_EXTENSIONS: ReadonlySet<string> = new Set(['js', 'css']);

/** Archive noise left by zip tools. Skipped, never extracted, never a problem. */
export const isArchiveNoise = (path: string): boolean =>
  path.startsWith('__MACOSX/') ||
  path.endsWith('/.DS_Store') ||
  path === '.DS_Store' ||
  path.endsWith('/Thumbs.db');

/**
 * Returns the path in canonical form, or null when it could escape the package folder:
 * absolute paths, drive letters, backslashes, control characters, `.` or `..` segments.
 */
export function safeEntryPath(raw: string): string | null {
  if (raw.length === 0 || raw.length > 512) return null;
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i);
    if (code < 0x20 || code === 0x7f || code === 0x5c) return null; // control characters, backslash
  }
  if (raw.startsWith('/') || /^[a-zA-Z]:/.test(raw)) return null;
  const segments = raw.split('/');
  const isDirectory = raw.endsWith('/');
  const parts = isDirectory ? segments.slice(0, -1) : segments;
  if (parts.some((s) => s === '' || s === '.' || s === '..')) return null;
  return parts.join('/') + (isDirectory ? '/' : '');
}

export const extensionOf = (path: string): string => {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot <= 0 ? '' : name.slice(dot + 1).toLowerCase();
};

const LIBRARY_FOLDER = /^[\w.-]+-\d+\.\d+$/;

/** Which library folder an entry lives in, or null for `h5p.json` and `content/`. */
export function libraryFolderOf(path: string): string | null {
  const top = path.split('/', 1)[0] ?? '';
  return path.includes('/') && top !== 'content' && LIBRARY_FOLDER.test(top) ? top : null;
}

/** Whether a file may be in a package at this path. Returns the problem when it may not. */
export function checkEntryType(path: string): H5PProblem | null {
  if (path === 'h5p.json') return null;
  const ext = extensionOf(path);
  const inLibrary = libraryFolderOf(path) !== null;
  if (LIBRARY_ONLY_EXTENSIONS.has(ext)) {
    return inLibrary ? null : { code: 'script_outside_library', path };
  }
  return CONTENT_EXTENSIONS.has(ext)
    ? null
    : { code: 'file_type_not_allowed', path, detail: ext || '(none)' };
}

export interface H5PPackageIndex {
  readonly manifest: H5PManifest;
  /** Libraries bundled in the package, by key. */
  readonly libraries: ReadonlyMap<string, H5PLibrary>;
  /** Every library the content needs, in load order (dependencies first). */
  readonly loadOrder: readonly string[];
}

export interface IndexOptions {
  /**
   * Libraries already present on the device, by key. h5p.org exports leave out common
   * libraries; content still plays when the device holds them.
   */
  readonly installedLibraries?: ReadonlyMap<string, H5PLibrary>;
}

export type IndexResult =
  | { readonly ok: true; readonly index: H5PPackageIndex }
  | { readonly ok: false; readonly problems: readonly H5PProblem[] };

const parseJson = (text: string | undefined): unknown => {
  if (text === undefined) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return Symbol.for('invalid-json');
  }
};

function checkContent(readText: (path: string) => string | undefined): H5PProblem | null {
  const content = parseJson(readText('content/content.json'));
  if (content === undefined) return { code: 'content_missing', path: 'content/content.json' };
  const isObject = typeof content === 'object' && content !== null && !Array.isArray(content);
  return isObject ? null : { code: 'content_invalid', path: 'content/content.json' };
}

function readLibrary(
  folder: string,
  paths: ReadonlySet<string>,
  readText: (path: string) => string | undefined,
  problems: H5PProblem[],
): H5PLibrary | null {
  const parsed = H5PLibrary.safeParse(parseJson(readText(`${folder}/library.json`)));
  if (!parsed.success) {
    problems.push({ code: 'library_invalid', path: `${folder}/library.json` });
    return null;
  }
  const key = libraryKey(parsed.data);
  if (key !== folder) {
    problems.push({ code: 'library_mismatch', path: `${folder}/library.json`, detail: key });
    return null;
  }
  for (const asset of [...(parsed.data.preloadedJs ?? []), ...(parsed.data.preloadedCss ?? [])]) {
    const inPackage = safeEntryPath(`${folder}/${asset.path}`);
    if (inPackage === null || !paths.has(inPackage)) {
      problems.push({ code: 'asset_missing', path: `${folder}/${asset.path}` });
    }
  }
  return parsed.data;
}

/**
 * Depth-first, dependencies before dependants. A cycle is cut where it closes, as H5P does.
 * Returns the load order and the keys no library could be found for.
 */
function resolveLoadOrder(
  roots: readonly H5PDependency[],
  lookup: (key: string) => H5PLibrary | undefined,
): { loadOrder: string[]; missing: string[] } {
  const loadOrder: string[] = [];
  const seen = new Set<string>();
  const missing = new Set<string>();
  const visit = (key: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    const library = lookup(key);
    if (library === undefined) {
      missing.add(key);
      return;
    }
    for (const dep of library.preloadedDependencies ?? []) visit(libraryKey(dep));
    loadOrder.push(key);
  };
  for (const dep of roots) visit(libraryKey(dep));
  return { loadOrder, missing: [...missing] };
}

/**
 * Checks that a package's parts agree and resolves the order its libraries load in.
 * `readText` returns a file's text, or undefined when the package doesn't hold it.
 */
export function indexPackage(
  paths: ReadonlySet<string>,
  readText: (path: string) => string | undefined,
  options: IndexOptions = {},
): IndexResult {
  const rawManifest = parseJson(readText('h5p.json'));
  if (rawManifest === undefined) {
    return { ok: false, problems: [{ code: 'manifest_missing', path: 'h5p.json' }] };
  }
  const manifest = H5PManifest.safeParse(rawManifest);
  if (!manifest.success) {
    return {
      ok: false,
      problems: [{ code: 'manifest_invalid', path: 'h5p.json', detail: manifest.error.message }],
    };
  }

  const problems: H5PProblem[] = [];
  const contentProblem = checkContent(readText);
  if (contentProblem !== null) problems.push(contentProblem);

  const { mainLibrary, preloadedDependencies } = manifest.data;
  if (!preloadedDependencies.some((d) => d.machineName === mainLibrary)) {
    problems.push({ code: 'main_library_not_preloaded', detail: mainLibrary });
  }

  const folders = new Set([...paths].map(libraryFolderOf).filter((f): f is string => f !== null));
  const bundled = new Map<string, H5PLibrary>();
  for (const folder of folders) {
    const library = readLibrary(folder, paths, readText, problems);
    if (library !== null) bundled.set(folder, library);
  }

  const installed = options.installedLibraries;
  const { loadOrder, missing } = resolveLoadOrder(
    preloadedDependencies,
    (key) => bundled.get(key) ?? installed?.get(key),
  );
  for (const key of missing) problems.push({ code: 'library_missing', detail: key });

  if (problems.length > 0) return { ok: false, problems };
  return { ok: true, index: { manifest: manifest.data, libraries: bundled, loadOrder } };
}
