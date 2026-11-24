import { describe, expect, it, vi } from 'vitest';
import { readServerConfig } from '../../config';
import { resolveAssetAccessPolicy } from '../accessPolicy';
import { confirmAssetUpload, createUploadGrant, resolveAssetDownload } from '../files';
import type { ObjectStoragePort } from '../storagePort';
import { resolveRoutedObjectTarget, resolveStorageLane } from '../storageRoutingPolicy';

const SAMPLE_SHA = 'a'.repeat(64);

function makeStorage(overrides: Partial<ObjectStoragePort> = {}): ObjectStoragePort {
  return {
    createPresignedUpload: vi.fn(async ({ key }) => ({
      uploadUrl: `https://r2.example.com/put/${key}`,
      objectKey: key,
      headers: { 'Content-Type': 'application/pdf' },
      expiresAt: '2026-11-25T00:00:00.000Z',
    })),
    createPresignedDownload: vi.fn(async ({ key }) => ({
      downloadUrl: `https://r2.example.com/get/${key}`,
      expiresAt: '2026-11-25T00:00:00.000Z',
    })),
    headObject: vi.fn(async () => ({ exists: false })),
    ...overrides,
  };
}

describe('configurable asset storage policies', () => {
  it('validates R2 and Supabase driver requirements in ServerConfig', () => {
    expect(() => readServerConfig({ ASSET_STORAGE_DRIVER: 'r2' })).toThrow();
    expect(() => readServerConfig({ ASSET_STORAGE_DRIVER: 'supabase' })).toThrow();
    const ok = readServerConfig({
      ASSET_STORAGE_DRIVER: 'r2',
      R2_ENDPOINT: 'https://acct.r2.cloudflarestorage.com',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET: 'gurudevi-assets',
    });
    expect(ok.ASSET_STORAGE_DRIVER).toBe('r2');
  });

  it('routes public library assets to CDN when configured, and private/submissions to signed URLs', () => {
    const policy = { publicCdnUrl: 'https://cdn.gurudevi.app', signedUrlTtlSeconds: 600 };
    expect(
      resolveAssetAccessPolicy(
        { objectKey: 'assets/aa/book.pdf', visibility: 'public', purpose: 'library_resource' },
        policy,
      ),
    ).toEqual({ mode: 'public_cdn', url: 'https://cdn.gurudevi.app/assets/aa/book.pdf' });

    expect(
      resolveAssetAccessPolicy(
        { objectKey: 'assets/aa/hw.pdf', visibility: 'private', purpose: 'submission' },
        policy,
      ),
    ).toEqual({ mode: 'signed_url', ttlSeconds: 600 });
  });

  it('enforces FILE_POLICY and deduplicates existing sha256 objects', async () => {
    const storage = makeStorage({
      headObject: vi.fn(async () => ({ exists: true, bytes: 1024 })),
    });
    const dedup = await createUploadGrant(
      {
        fileName: 'lesson.pdf',
        mime: 'application/pdf',
        bytes: 1024,
        sha256: SAMPLE_SHA,
        purpose: 'library_resource',
      },
      { storage, signedUrlTtlSeconds: 900 },
    );
    expect(dedup.ok).toBe(true);
    if (dedup.ok) {
      expect(dedup.deduplicated).toBe(true);
      expect(dedup.uploadUrl).toBeNull();
    }

    const oversized = await createUploadGrant(
      {
        fileName: 'huge.pdf',
        mime: 'application/pdf',
        bytes: 500 * 1024 * 1024,
        sha256: SAMPLE_SHA,
        purpose: 'library_resource',
      },
      { storage, signedUrlTtlSeconds: 900 },
    );
    expect(oversized).toEqual({ ok: false, code: 'MEDIA_SIZE_EXCEEDED' });
  });

  it('rejects confirmAssetUpload on size mismatch and resolves signed download', async () => {
    const storage = makeStorage({
      headObject: vi.fn(async () => ({ exists: true, bytes: 999 })),
    });
    const res = await confirmAssetUpload(
      { objectKey: 'assets/aa/file.pdf', expectedBytes: 1024 },
      { storage },
    );
    expect(res).toEqual({ ok: false, code: 'ASSET_SIZE_MISMATCH' });

    const dl = await resolveAssetDownload(
      { objectKey: 'assets/aa/file.pdf', visibility: 'private', purpose: 'library_resource' },
      { storage, policy: { signedUrlTtlSeconds: 300 } },
    );
    expect(dl.mode).toBe('signed_url');
    expect(dl.url).toContain('r2.example.com/get/');
  });

  it('routes images, video/audio, documents, and external links to their configured lanes', () => {
    expect(resolveStorageLane({ name: 'photo.webp', mime: 'image/webp' })).toBe('images');
    expect(resolveStorageLane({ name: 'lecture.mp4', mime: 'video/mp4' })).toBe('media');
    expect(resolveStorageLane({ name: 'notes.pdf', mime: 'application/pdf' })).toBe('documents');
    expect(resolveStorageLane({ name: 'yt', isExternalLink: true })).toBe('link_only');

    const imgTarget = resolveRoutedObjectTarget({
      sha256: SAMPLE_SHA,
      fileName: 'photo.webp',
      mime: 'image/webp',
    });
    expect(imgTarget.bucket).toBe('images');
    expect(imgTarget.objectKey).toMatch(/^images\/aa\//);

    const docTarget = resolveRoutedObjectTarget({
      sha256: SAMPLE_SHA,
      fileName: 'lesson.docx',
    });
    expect(docTarget.bucket).toBe('files');
    expect(docTarget.objectKey).toMatch(/^documents\/aa\//);
  });
});
