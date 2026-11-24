import { type FileKind, fileKindOf } from '@repo/core/logic/files/fileKind';

export type StorageLane = 'images' | 'media' | 'documents' | 'link_only';

export interface StorageRoutingPolicy {
  readonly buckets: Readonly<Record<Exclude<StorageLane, 'link_only'>, string>>;
  readonly prefixes: Readonly<Record<Exclude<StorageLane, 'link_only'>, string>>;
}

export const DEFAULT_STORAGE_ROUTING_POLICY: StorageRoutingPolicy = {
  buckets: {
    images: 'images',
    media: 'media',
    documents: 'files',
  },
  prefixes: {
    images: 'images',
    media: 'media',
    documents: 'documents',
  },
};

export function resolveStorageLane(file: {
  readonly name: string;
  readonly mime?: string;
  readonly isExternalLink?: boolean;
}): StorageLane {
  if (file.isExternalLink) return 'link_only';
  const kind: FileKind = fileKindOf({ name: file.name, mime: file.mime });
  if (kind === 'image') return 'images';
  if (kind === 'video' || kind === 'audio') return 'media';
  return 'documents';
}

export function resolveRoutedObjectTarget(
  input: { readonly sha256: string; readonly fileName: string; readonly mime?: string },
  policy: StorageRoutingPolicy = DEFAULT_STORAGE_ROUTING_POLICY,
): { readonly lane: Exclude<StorageLane, 'link_only'>; readonly bucket: string; readonly objectKey: string } {
  const lane = resolveStorageLane({ name: input.fileName, mime: input.mime });
  const effectiveLane: Exclude<StorageLane, 'link_only'> = lane === 'link_only' ? 'documents' : lane;
  const ext = input.fileName.includes('.')
    ? `.${input.fileName.split('.').pop()?.toLowerCase() ?? 'bin'}`
    : '';
  const prefix = policy.prefixes[effectiveLane].replace(/^\/+|\/+$/g, '');
  return {
    lane: effectiveLane,
    bucket: policy.buckets[effectiveLane],
    objectKey: `${prefix}/${input.sha256.slice(0, 2)}/${input.sha256}${ext}`,
  };
}
