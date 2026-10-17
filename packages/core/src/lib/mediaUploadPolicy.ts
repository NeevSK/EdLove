export type MediaUploadPurpose = 'generic' | 'avatar' | 'wallpaper';

export interface MediaUploadMetadata {
  mimeType: string;
  byteLength: number;
  width?: number;
  height?: number;
}

export interface MediaUploadPolicy {
  readonly allowedMimeTypes: readonly string[];
  readonly maxBytes: number;
  readonly maxPixels: number;
  readonly requireDimensions: boolean;
}

export const WALLPAPER_UPLOAD_POLICY: MediaUploadPolicy = {
  allowedMimeTypes: ['image/avif', 'image/jpeg', 'image/png', 'image/webp'],
  maxBytes: 8 * 1024 * 1024,
  maxPixels: 16_000_000,
  requireDimensions: true,
};

export class MediaUploadValidationError extends Error {
  readonly code:
    | 'MEDIA_TYPE_UNSUPPORTED'
    | 'MEDIA_SIZE_EXCEEDED'
    | 'MEDIA_DIMENSIONS_REQUIRED'
    | 'MEDIA_DIMENSIONS_INVALID'
    | 'MEDIA_PIXELS_EXCEEDED';

  constructor(code: MediaUploadValidationError['code'], message: string) {
    super(message);
    this.name = 'MediaUploadValidationError';
    this.code = code;
  }
}

export function validateMediaUpload(
  metadata: MediaUploadMetadata,
  policy: MediaUploadPolicy,
): void {
  if (!policy.allowedMimeTypes.includes(metadata.mimeType.toLowerCase())) {
    throw new MediaUploadValidationError(
      'MEDIA_TYPE_UNSUPPORTED',
      `Unsupported media type: ${metadata.mimeType}`,
    );
  }

  if (!Number.isSafeInteger(metadata.byteLength) || metadata.byteLength <= 0) {
    throw new MediaUploadValidationError(
      'MEDIA_SIZE_EXCEEDED',
      'Media size must be a positive safe integer.',
    );
  }

  if (metadata.byteLength > policy.maxBytes) {
    throw new MediaUploadValidationError(
      'MEDIA_SIZE_EXCEEDED',
      `Media exceeds the ${policy.maxBytes} byte upload limit.`,
    );
  }

  if (policy.requireDimensions && (!metadata.width || !metadata.height)) {
    throw new MediaUploadValidationError(
      'MEDIA_DIMENSIONS_REQUIRED',
      'Image dimensions are required before upload.',
    );
  }

  if (metadata.width === undefined || metadata.height === undefined) return;
  if (
    !Number.isSafeInteger(metadata.width) ||
    !Number.isSafeInteger(metadata.height) ||
    metadata.width <= 0 ||
    metadata.height <= 0
  ) {
    throw new MediaUploadValidationError(
      'MEDIA_DIMENSIONS_INVALID',
      'Image dimensions must be positive safe integers.',
    );
  }

  if (metadata.width * metadata.height > policy.maxPixels) {
    throw new MediaUploadValidationError(
      'MEDIA_PIXELS_EXCEEDED',
      `Image exceeds the ${policy.maxPixels} pixel limit.`,
    );
  }
}
