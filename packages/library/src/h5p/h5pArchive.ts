import { unzipSync } from 'fflate';
import {
  checkEntryType,
  type H5PPackageIndex,
  type H5PProblem,
  type IndexOptions,
  indexPackage,
  isArchiveNoise,
  safeEntryPath,
} from './h5pPackage';

/**
 * Limits on what a package may unpack to. Defaults suit a 2 GB phone; a school's curated
 * library can raise them. Every limit is checked against the declared size before a file is
 * inflated, and against the real size after, so a zip that lies about its sizes still stops.
 */
export interface ArchiveLimits {
  readonly maxEntries: number;
  readonly maxFileBytes: number;
  readonly maxTotalBytes: number;
}

export const DEFAULT_ARCHIVE_LIMITS: ArchiveLimits = {
  maxEntries: 4000,
  maxFileBytes: 64 * 1024 * 1024,
  maxTotalBytes: 160 * 1024 * 1024,
};

export interface OpenedPackage {
  readonly index: H5PPackageIndex;
  /** Every file to write under the package folder, by canonical path. */
  readonly files: ReadonlyMap<string, Uint8Array>;
  readonly totalBytes: number;
}

export type OpenResult =
  | { readonly ok: true; readonly opened: OpenedPackage }
  | { readonly ok: false; readonly problems: readonly H5PProblem[] };

export interface OpenOptions extends IndexOptions {
  readonly limits?: ArchiveLimits;
}

const decoder = new TextDecoder('utf-8', { fatal: false });

/**
 * Opens an `.h5p` file held in memory and checks it: safe paths, allowed file types, limits,
 * and a manifest whose libraries are all present. Nothing touches the disk here; the caller
 * writes `files` through its own storage once the result is `ok`.
 */
export function openH5PArchive(bytes: Uint8Array, options: OpenOptions = {}): OpenResult {
  const limits = options.limits ?? DEFAULT_ARCHIVE_LIMITS;
  const problems: H5PProblem[] = [];
  const canonical = new Map<string, string>();
  let entries = 0;
  let declaredTotal = 0;

  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(bytes, {
      filter: (file) => {
        if (isArchiveNoise(file.name)) return false;
        if (file.name.endsWith('/')) return false;
        entries += 1;
        if (entries > limits.maxEntries) {
          if (entries === limits.maxEntries + 1)
            problems.push({ code: 'too_many_entries', detail: String(limits.maxEntries) });
          return false;
        }
        const path = safeEntryPath(file.name);
        if (path === null) {
          problems.push({ code: 'unsafe_path', path: file.name });
          return false;
        }
        const lowered = path.toLowerCase();
        if (canonical.has(lowered)) {
          problems.push({ code: 'duplicate_entry', path });
          return false;
        }
        canonical.set(lowered, path);
        const typeProblem = checkEntryType(path);
        if (typeProblem !== null) {
          problems.push(typeProblem);
          return false;
        }
        if (file.originalSize > limits.maxFileBytes) {
          problems.push({ code: 'too_large', path, detail: String(file.originalSize) });
          return false;
        }
        const wasWithin = declaredTotal <= limits.maxTotalBytes;
        declaredTotal += file.originalSize;
        if (declaredTotal > limits.maxTotalBytes) {
          if (wasWithin) problems.push({ code: 'too_large', detail: 'package' });
          return false;
        }
        return true;
      },
    });
  } catch (error) {
    return {
      ok: false,
      problems: [
        {
          code: 'archive_unreadable',
          detail: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
  if (problems.length > 0) return { ok: false, problems };

  const files = new Map<string, Uint8Array>();
  let totalBytes = 0;
  for (const [name, data] of Object.entries(unzipped)) {
    const path = safeEntryPath(name);
    if (path === null) continue;
    totalBytes += data.byteLength;
    if (data.byteLength > limits.maxFileBytes || totalBytes > limits.maxTotalBytes) {
      return {
        ok: false,
        problems: [{ code: 'too_large', path, detail: 'actual size exceeds the declared size' }],
      };
    }
    files.set(path, data);
  }

  const paths = new Set(files.keys());
  const indexed = indexPackage(
    paths,
    (path) => {
      const data = files.get(path);
      return data === undefined ? undefined : decoder.decode(data);
    },
    options,
  );
  if (!indexed.ok) return indexed;
  return { ok: true, opened: { index: indexed.index, files, totalBytes } };
}
