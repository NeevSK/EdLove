import type { WallpaperUploadMetadata } from '@repo/core/api/mediaUpload.contract';
import { orpcClient } from '@repo/core/api/orpcClient';
import { validateMediaUpload, WALLPAPER_UPLOAD_POLICY } from '@repo/core/lib/mediaUploadPolicy';

export interface UploadedWallpaperAsset {
  provider: 'cloudinary';
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

interface CloudinaryUploadResponse {
  secure_url?: unknown;
  public_id?: unknown;
  width?: unknown;
  height?: unknown;
  format?: unknown;
}

interface WallpaperUploadIntent {
  uploadUrl: string;
  fields: Record<string, string>;
}

function readWallpaperUploadIntent(value: unknown): WallpaperUploadIntent {
  if (!value || typeof value !== 'object') throw new Error('Wallpaper upload intent is invalid.');
  const candidate = value as { uploadUrl?: unknown; fields?: unknown };
  if (typeof candidate.uploadUrl !== 'string') {
    throw new Error('Wallpaper upload intent has an invalid upload URL.');
  }
  const uploadUrl = new URL(candidate.uploadUrl);
  if (
    uploadUrl.protocol !== 'https:' ||
    uploadUrl.hostname !== 'api.cloudinary.com' ||
    !/^\/v1_1\/[^/]+\/image\/upload$/.test(uploadUrl.pathname)
  ) {
    throw new Error('Wallpaper upload intent has an invalid upload URL.');
  }
  if (
    !candidate.fields ||
    typeof candidate.fields !== 'object' ||
    Array.isArray(candidate.fields)
  ) {
    throw new Error('Wallpaper upload intent has invalid upload fields.');
  }
  const fields = Object.entries(candidate.fields);
  if (fields.some(([key, field]) => !key || typeof field !== 'string')) {
    throw new Error('Wallpaper upload intent has invalid upload fields.');
  }
  return { uploadUrl: uploadUrl.toString(), fields: Object.fromEntries(fields) };
}

function readCloudinaryResponse(value: CloudinaryUploadResponse): UploadedWallpaperAsset {
  if (
    typeof value.secure_url !== 'string' ||
    !value.secure_url.startsWith('https://') ||
    typeof value.public_id !== 'string' ||
    typeof value.width !== 'number' ||
    typeof value.height !== 'number' ||
    typeof value.format !== 'string'
  ) {
    throw new Error('Cloudinary returned an invalid wallpaper asset.');
  }
  return {
    provider: 'cloudinary',
    url: value.secure_url,
    publicId: value.public_id,
    width: value.width,
    height: value.height,
    format: value.format,
  };
}

export class WallpaperRegistrationOutcomeUnknownError extends Error {
  constructor(
    readonly publicId: string,
    readonly originalError: unknown,
    options?: ErrorOptions,
  ) {
    super('Wallpaper upload completed, but reconciliation could not confirm its outcome.', options);
    this.name = 'WallpaperRegistrationOutcomeUnknownError';
  }
}

function isAmbiguousRegistrationFailure(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (!error || typeof error !== 'object') return false;
  const status = 'status' in error ? error.status : undefined;
  if (typeof status === 'number') return status === 408 || status === 429 || status >= 500;
  const code = 'code' in error ? error.code : undefined;
  return code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'NETWORK_ERROR';
}

export async function uploadWallpaper(source: Blob, metadata: WallpaperUploadMetadata) {
  const sourceMetadata = { ...metadata, byteLength: source.size };
  validateMediaUpload(sourceMetadata, WALLPAPER_UPLOAD_POLICY);
  const intent = readWallpaperUploadIntent(
    await orpcClient.media.requestWallpaperUpload({ body: metadata }),
  );
  const form = new FormData();
  for (const [key, value] of Object.entries(intent.fields)) form.append(key, value);
  form.append('file', source, 'wallpaper');

  const response = await fetch(intent.uploadUrl, { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error(`Wallpaper upload failed with status ${response.status}.`);
  }
  const uploaded = readCloudinaryResponse((await response.json()) as CloudinaryUploadResponse);
  const registration = {
    body: {
      publicId: uploaded.publicId,
      secureUrl: uploaded.url,
      format: uploaded.format,
      mimeType: metadata.mimeType,
      byteLength: source.size,
      width: uploaded.width,
      height: uploaded.height,
    },
  };
  let registered: Awaited<ReturnType<typeof orpcClient.media.registerWallpaperAsset>>;
  try {
    registered = await orpcClient.media.registerWallpaperAsset(registration);
  } catch (registrationError) {
    if (!isAmbiguousRegistrationFailure(registrationError)) throw registrationError;
    let reconciliation: Awaited<ReturnType<typeof orpcClient.media.reconcileWallpaperAsset>>;
    try {
      reconciliation = await orpcClient.media.reconcileWallpaperAsset(registration);
    } catch (reconciliationError) {
      throw new WallpaperRegistrationOutcomeUnknownError(uploaded.publicId, reconciliationError, {
        cause: registrationError,
      });
    }
    if (reconciliation.status === 'registered') registered = reconciliation.asset;
    else throw registrationError;
  }
  return {
    provider: 'cloudinary' as const,
    url: registered.secureUrl,
    publicId: registered.publicId,
    width: registered.width,
    height: registered.height,
  };
}

export async function deleteWallpaper(publicId: string): Promise<void> {
  await orpcClient.media.deleteWallpaperAsset({ body: { publicId } });
}
