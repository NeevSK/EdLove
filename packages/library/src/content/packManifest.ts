import { z } from 'zod';
import { safeEntryPath } from '../h5p/h5pPackage';

/**
 * The offline unit of content: the files of one version of a work, with a manifest
 * (`gurudevi-pack.json`) giving each file's role, language, quality, size and SHA-256. A device
 * plans a download from it and checks what it received before opening anything. The stored
 * content model (works, versions, variants) is in docs/architecture/domains/library/resources.md.
 */

export const PACK_FORMAT = 'gurudevi-pack';
export const PACK_FORMAT_VERSION = 1;

export const PackFileRole = z.enum([
  'main',
  'asset',
  'caption',
  'transcript',
  'thumbnail',
  'library',
]);
export type PackFileRole = z.infer<typeof PackFileRole>;

export const Quality = z.enum(['low', 'standard', 'high']);
export type Quality = z.infer<typeof Quality>;

const language = z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/);
const id = z.string().min(1).max(128);

export const PackFile = z.strictObject({
  path: z.string().min(1).max(512),
  role: PackFileRole,
  /** Absent for files that don't depend on language (most images, H5P libraries). */
  language: language.optional(),
  /** Absent for files that come in one quality only. */
  quality: Quality.optional(),
  mediaType: z.string().min(3).max(127),
  bytes: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
});
export type PackFile = z.infer<typeof PackFile>;

export const PackManifest = z.strictObject({
  format: z.literal(PACK_FORMAT),
  formatVersion: z.literal(PACK_FORMAT_VERSION),
  packId: id,
  workId: id,
  versionId: id,
  kind: z.enum([
    'page',
    'document',
    'video',
    'audio',
    'image',
    'h5p',
    'activity',
    'link',
    'sequence',
  ]),
  /** Title by language; at least one. */
  title: z.record(language, z.string().min(1)).refine((t) => Object.keys(t).length > 0),
  licence: z.strictObject({ id: z.string().min(1), attribution: z.string().min(1) }),
  files: z.array(PackFile).min(1),
  /** Other packs this one needs on the device (shared H5P libraries, a sequence's parts). */
  requires: z.array(id).default([]),
});
export type PackManifest = z.infer<typeof PackManifest>;

export type ManifestProblem =
  | { readonly code: 'invalid'; readonly detail: string }
  | { readonly code: 'unsafe_path' | 'duplicate_path'; readonly path: string }
  | { readonly code: 'no_main_file' };

export type ReadManifestResult =
  | { readonly ok: true; readonly manifest: PackManifest }
  | { readonly ok: false; readonly problems: readonly ManifestProblem[] };

/** Reads an untrusted manifest: its shape, then paths that stay inside the pack and a main file. */
export function readPackManifest(raw: unknown): ReadManifestResult {
  const parsed = PackManifest.safeParse(raw);
  if (!parsed.success)
    return { ok: false, problems: [{ code: 'invalid', detail: parsed.error.message }] };
  const problems: ManifestProblem[] = [];
  const seen = new Set<string>();
  for (const file of parsed.data.files) {
    const safe = safeEntryPath(file.path);
    if (safe === null || safe.endsWith('/'))
      problems.push({ code: 'unsafe_path', path: file.path });
    else if (seen.has(safe.toLowerCase()))
      problems.push({ code: 'duplicate_path', path: file.path });
    else seen.add(safe.toLowerCase());
  }
  if (!parsed.data.files.some((f) => f.role === 'main')) problems.push({ code: 'no_main_file' });
  return problems.length > 0 ? { ok: false, problems } : { ok: true, manifest: parsed.data };
}
