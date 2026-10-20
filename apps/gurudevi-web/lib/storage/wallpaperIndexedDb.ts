'use client';

import type { WorkspaceWallpaper } from '@repo/core/types';

const DB_NAME = 'SanctuaryWallpaperDB';
const DB_VERSION = 1;
const STORE_NAME = 'wallpapers';

export interface StoredWallpaperRecord {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is unavailable in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open Sanctuary wallpaper database'));
  });
}

/**
 * Downsamples user uploaded images client-side to 1920x1080 max WebP.
 * Prevents memory bloat and protects GPU texture pipelines.
 */
export async function downsampleImageFile(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82,
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not acquire 2D canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP; fallback to JPEG if browser does not support WebP canvas export
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve({ dataUrl, width, height });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Saves a downsampled custom user wallpaper to IndexedDB.
 */
export async function saveCustomWallpaper(file: File): Promise<WorkspaceWallpaper> {
  const { dataUrl, width, height } = await downsampleImageFile(file);
  const id = `custom:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 32);

  const record: StoredWallpaperRecord = {
    id,
    name: cleanName,
    dataUrl,
    width,
    height,
    createdAt: Date.now(),
  };

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => {
      resolve({
        provider: 'custom',
        url: dataUrl,
        publicId: id,
        width,
        height,
        name: cleanName,
      });
    };
    request.onerror = () => reject(request.error ?? new Error('Failed to store wallpaper in IndexedDB'));
  });
}

/**
 * Loads all custom wallpapers from IndexedDB.
 */
export async function loadCustomWallpapers(): Promise<WorkspaceWallpaper[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = (request.result as StoredWallpaperRecord[]) ?? [];
        records.sort((a, b) => b.createdAt - a.createdAt);
        resolve(
          records.map((r) => ({
            provider: 'custom',
            url: r.dataUrl,
            publicId: r.id,
            width: r.width,
            height: r.height,
            name: r.name,
          })),
        );
      };
      request.onerror = () => reject(request.error ?? new Error('Failed to load wallpapers from IndexedDB'));
    });
  } catch {
    return [];
  }
}

/**
 * Deletes a custom wallpaper by its unique ID.
 */
export async function deleteCustomWallpaper(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error(`Failed to delete wallpaper ${id}`));
  });
}
