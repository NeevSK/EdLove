'use client';

import { uploadWallpaper } from '@repo/core/api/mediaUpload';
import {
  MediaUploadValidationError,
  validateMediaUpload,
  WALLPAPER_UPLOAD_POLICY,
} from '@repo/core/lib/mediaUploadPolicy';
import type { WorkspaceWallpaper } from '@repo/core/types';
import { useRef, useState } from 'react';
import styles from './floor-atmosphere.module.css';

const MAX_EDGE = 1920;

function toJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('The selected image could not be prepared.')),
      'image/jpeg',
      0.86,
    );
  });
}

async function prepareWallpaper(
  file: File,
): Promise<{ blob: Blob; width: number; height: number }> {
  validateMediaUpload(
    { mimeType: file.type, byteLength: file.size },
    { ...WALLPAPER_UPLOAD_POLICY, requireDimensions: false },
  );
  if (typeof createImageBitmap !== 'function') {
    throw new Error('This browser cannot prepare wallpaper images. Try a current browser.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    validateMediaUpload(
      { mimeType: file.type, byteLength: file.size, width: bitmap.width, height: bitmap.height },
      WALLPAPER_UPLOAD_POLICY,
    );
    const scale = Math.min(1, MAX_EDGE / bitmap.width, MAX_EDGE / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the selected image.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await toJpegBlob(canvas);
    validateMediaUpload(
      { mimeType: blob.type, byteLength: blob.size, width, height },
      WALLPAPER_UPLOAD_POLICY,
    );
    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}

function describeError(error: unknown): string {
  if (error instanceof MediaUploadValidationError) {
    if (error.code === 'MEDIA_SIZE_EXCEEDED') return 'Choose an image smaller than 8 MB.';
    if (error.code === 'MEDIA_PIXELS_EXCEEDED')
      return 'Choose an image with no more than 16 megapixels.';
    if (error.code === 'MEDIA_TYPE_UNSUPPORTED') return 'Choose a JPG, PNG, WebP, or AVIF image.';
  }
  return error instanceof Error ? error.message : 'Wallpaper upload failed. Try again.';
}

export function WallpaperUploadControl({
  onUploaded,
}: Readonly<{ onUploaded: (wallpaper: WorkspaceWallpaper) => void }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setBusy(true);
    setError('');
    setMessage('Preparing and uploading wallpaper…');
    try {
      const prepared = await prepareWallpaper(file);
      const wallpaper = await uploadWallpaper(prepared.blob, {
        mimeType: 'image/jpeg',
        byteLength: prepared.blob.size,
        width: prepared.width,
        height: prepared.height,
      });
      onUploaded(wallpaper);
      setMessage('Wallpaper uploaded and selected.');
    } catch (uploadError) {
      setMessage('');
      setError(describeError(uploadError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.optionSection}>
      <span className={styles.optionLabel}>Custom wallpaper</span>
      <input
        aria-label="Choose wallpaper image"
        accept="image/avif,image/jpeg,image/png,image/webp"
        className={styles.fileInput}
        disabled={busy}
        onChange={(event) => void handleChange(event)}
        ref={inputRef}
        type="file"
      />
      <button
        className={styles.optionButton}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {busy ? 'Uploading…' : 'Choose image'}
      </button>
      <span className={styles.uploadHint}>JPG, PNG, WebP, or AVIF · up to 8 MB</span>
      {message ? (
        <span aria-live="polite" role="status">
          {message}
        </span>
      ) : null}
      {error ? (
        <span className={styles.uploadError} role="alert">
          {error}
        </span>
      ) : null}
    </section>
  );
}
