import { checkFile, type FilePurpose } from '@repo/core/logic/files/filePolicy';
import { z } from 'zod';
import { type AssetAccessPolicyConfig, type AssetVisibility, resolveAssetAccessPolicy } from './accessPolicy';
import type { ObjectStoragePort } from './storagePort';
import {
  DEFAULT_STORAGE_ROUTING_POLICY,
  resolveRoutedObjectTarget,
  type StorageRoutingPolicy,
} from './storageRoutingPolicy';

const SHA256_RE = /^[0-9a-f]{64}$/;

export const CreateUploadGrantInput = z.strictObject({
  fileName: z.string().min(1).max(255),
  mime: z.string().min(3).max(127),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(SHA256_RE),
  purpose: z.enum([
    'avatar',
    'wallpaper',
    'submission',
    'scan',
    'attachment',
    'library_resource',
    'h5p_package',
  ]),
});
export type CreateUploadGrantInput = z.infer<typeof CreateUploadGrantInput>;

export function contentAddressedKey(sha256: string, fileName: string): string {
  const ext = fileName.includes('.') ? `.${fileName.split('.').pop()?.toLowerCase() ?? 'bin'}` : '';
  return `assets/${sha256.slice(0, 2)}/${sha256}${ext}`;
}

export async function createUploadGrant(
  input: CreateUploadGrantInput,
  deps: {
    storage: ObjectStoragePort;
    signedUrlTtlSeconds: number;
    routingPolicy?: StorageRoutingPolicy;
  },
) {
  const check = checkFile(
    { name: input.fileName, mime: input.mime, size: input.bytes },
    input.purpose as FilePurpose,
  );
  if (!check.ok) {
    return { ok: false as const, code: check.refusal };
  }

  const routed = resolveRoutedObjectTarget(
    { sha256: input.sha256, fileName: input.fileName, mime: input.mime },
    deps.routingPolicy ?? DEFAULT_STORAGE_ROUTING_POLICY,
  );
  const objectKey = routed.objectKey;
  const existing = await deps.storage.headObject(objectKey);
  if (existing.exists && existing.bytes === input.bytes) {
    return {
      ok: true as const,
      deduplicated: true,
      contentAddressed: true,
      sha256: input.sha256,
      lane: routed.lane,
      bucket: routed.bucket,
      objectKey,
      uploadUrl: null,
      headers: {} as Record<string, string>,
    };
  }

  const grant = await deps.storage.createPresignedUpload({
    key: objectKey,
    contentType: input.mime,
    bytes: input.bytes,
    expiresInSeconds: deps.signedUrlTtlSeconds,
  });

  return {
    ok: true as const,
    deduplicated: false,
    contentAddressed: true,
    sha256: input.sha256,
    lane: routed.lane,
    bucket: routed.bucket,
    objectKey: grant.objectKey,
    uploadUrl: grant.uploadUrl,
    headers: grant.headers,
    expiresAt: grant.expiresAt,
  };
}

export async function confirmAssetUpload(
  input: { readonly objectKey: string; readonly expectedBytes: number },
  deps: { storage: ObjectStoragePort },
) {
  const head = await deps.storage.headObject(input.objectKey);
  if (!head.exists) {
    return { ok: false as const, code: 'ASSET_NOT_UPLOADED' as const };
  }
  if (head.bytes !== undefined && head.bytes !== input.expectedBytes) {
    return { ok: false as const, code: 'ASSET_SIZE_MISMATCH' as const };
  }
  return { ok: true as const, objectKey: input.objectKey, bytes: head.bytes ?? input.expectedBytes };
}

export async function resolveAssetDownload(
  input: {
    readonly objectKey: string;
    readonly visibility: AssetVisibility;
    readonly purpose: FilePurpose;
  },
  deps: { storage: ObjectStoragePort; policy: AssetAccessPolicyConfig },
) {
  const decision = resolveAssetAccessPolicy(input, deps.policy);
  if (decision.mode === 'public_cdn') {
    return { url: decision.url, mode: 'public_cdn' as const };
  }
  const signed = await deps.storage.createPresignedDownload({
    key: input.objectKey,
    expiresInSeconds: decision.ttlSeconds,
  });
  return {
    url: signed.downloadUrl,
    mode: 'signed_url' as const,
    expiresAt: signed.expiresAt,
  };
}
