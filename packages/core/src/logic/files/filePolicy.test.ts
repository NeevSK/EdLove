import { describe, expect, it } from 'vitest';
import {
  acceptAttributeFor,
  assertFileAllowed,
  checkFile,
  checkFiles,
  FILE_POLICY,
  fileRulesFor,
  MediaUploadValidationError,
} from './filePolicy';

const wallpaper = { mime: 'image/webp', size: 1024, width: 1920, height: 1080 };
const refusal = (check: ReturnType<typeof checkFile>) => (check.ok ? null : check.refusal);

describe('file policy / G1 pure', () => {
  describe('wallpaper (the rules uploads already used)', () => {
    it('accepts a bounded supported image', () => {
      expect(checkFile(wallpaper, 'wallpaper')).toEqual({ ok: true });
    });

    it.each([
      ['an unsupported type', { mime: 'image/svg+xml' }, 'MEDIA_TYPE_UNSUPPORTED'],
      ['an oversized file', { size: FILE_POLICY.wallpaper.maxBytes! + 1 }, 'MEDIA_SIZE_EXCEEDED'],
      ['an empty file', { size: 0 }, 'MEDIA_SIZE_EXCEEDED'],
      ['unknown dimensions', { width: undefined, height: undefined }, 'MEDIA_DIMENSIONS_REQUIRED'],
      ['broken dimensions', { width: 1.5 }, 'MEDIA_DIMENSIONS_INVALID'],
      ['too many pixels', { width: 5000, height: 5000 }, 'MEDIA_PIXELS_EXCEEDED'],
    ])('refuses %s', (_name, overrides, code) => {
      expect(refusal(checkFile({ ...wallpaper, ...overrides }, 'wallpaper'))).toBe(code);
    });

    it('throws the same code for upload code', () => {
      expect(() => assertFileAllowed({ ...wallpaper, mime: 'image/gif' }, 'wallpaper')).toThrow(
        MediaUploadValidationError,
      );
      try {
        assertFileAllowed({ ...wallpaper, size: 9 * 1024 * 1024 }, 'wallpaper');
      } catch (error) {
        expect((error as MediaUploadValidationError).code).toBe('MEDIA_SIZE_EXCEEDED');
      }
    });
  });

  it('refuses an avatar over 2 MB, as the profile screen did', () => {
    expect(refusal(checkFile({ mime: 'image/png', size: 2 * 1024 * 1024 + 1 }, 'avatar'))).toBe(
      'MEDIA_SIZE_EXCEEDED',
    );
    expect(checkFile({ mime: 'image/png', size: 300_000 }, 'avatar').ok).toBe(true);
  });

  it('decides a kind from the name when the type is generic', () => {
    expect(
      checkFile({ name: 'essay.docx', mime: 'application/octet-stream', size: 10 }, 'submission')
        .ok,
    ).toBe(true);
    expect(refusal(checkFile({ name: 'clip.mp4', size: 10 }, 'submission'))).toBe(
      'MEDIA_TYPE_UNSUPPORTED',
    );
  });

  it('counts files against what is already chosen', () => {
    const page = { name: 'page.jpg', mime: 'image/jpeg', size: 10 };
    expect(checkFiles([page, page], 'submission', 3).ok).toBe(true);
    expect(refusal(checkFiles([page], 'submission', 5))).toBe('MEDIA_COUNT_EXCEEDED');
    expect(refusal(checkFiles([page, { ...page, size: 0 }], 'submission'))).toBe(
      'MEDIA_SIZE_EXCEEDED',
    );
  });

  it('accepts anything for a plain attachment, within the count', () => {
    expect(checkFile({ name: 'notes.xyz', size: 50 * 1024 * 1024 }, 'attachment').ok).toBe(true);
  });

  it('gives the kit and the browser the same rules', () => {
    expect(fileRulesFor('submission')).toEqual({
      accept: ['image', 'pdf', 'document', 'archive'],
      maxBytes: 20 * 1024 * 1024,
      maxFiles: 5,
    });
    expect(acceptAttributeFor('avatar')).toBe('image/jpeg,image/png,image/webp');
    expect(acceptAttributeFor('submission')).toBe(
      '.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.odt,.rtf,.zip',
    );
    expect(acceptAttributeFor('attachment')).toBeUndefined();
  });
});
