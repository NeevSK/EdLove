import {
  MediaUploadValidationError,
  validateMediaUpload,
  WALLPAPER_UPLOAD_POLICY,
} from './mediaUploadPolicy';

const validWallpaper = {
  mimeType: 'image/webp',
  byteLength: 1024,
  width: 1920,
  height: 1080,
};

describe('wallpaper upload policy', () => {
  test('accepts bounded supported images', () => {
    expect(() => validateMediaUpload(validWallpaper, WALLPAPER_UPLOAD_POLICY)).not.toThrow();
  });

  test('rejects unsupported types and oversized payloads', () => {
    expect(() =>
      validateMediaUpload(
        { ...validWallpaper, mimeType: 'image/svg+xml' },
        WALLPAPER_UPLOAD_POLICY,
      ),
    ).toThrowError(MediaUploadValidationError);
    expect(() =>
      validateMediaUpload(
        { ...validWallpaper, byteLength: WALLPAPER_UPLOAD_POLICY.maxBytes + 1 },
        WALLPAPER_UPLOAD_POLICY,
      ),
    ).toThrowError(MediaUploadValidationError);
  });

  test('requires dimensions and bounds decoded pixel count', () => {
    expect(() =>
      validateMediaUpload({ mimeType: 'image/png', byteLength: 100 }, WALLPAPER_UPLOAD_POLICY),
    ).toThrowError(MediaUploadValidationError);
    expect(() =>
      validateMediaUpload(
        { ...validWallpaper, width: 5000, height: 5000 },
        WALLPAPER_UPLOAD_POLICY,
      ),
    ).toThrowError(MediaUploadValidationError);
  });
});
