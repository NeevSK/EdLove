import type { BrowserLibraryResource } from '../../app/(sanctuary)/library/libraryState';

export interface LocalLibraryItem extends BrowserLibraryResource {
  readonly assetId?: string;
  readonly sha256?: string;
  readonly mime?: string;
  readonly fileName?: string;
  readonly body_markdown?: string;
  readonly ocrText?: string;
  readonly storageLane?: 'images' | 'media' | 'documents' | 'link_only';
  readonly syncStatus: 'queued' | 'synced' | 'link_saved';
  readonly createdAt: number;
}

const STORAGE_KEY = 'gurudevi_local_library_items_v1';

export function listLocalLibraryItems(): readonly LocalLibraryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalLibraryItem[]) : [];
  } catch {
    return [];
  }
}

export function getLocalLibraryItem(id: string): LocalLibraryItem | undefined {
  return listLocalLibraryItems().find((item) => item.id === id);
}

export function saveLocalLibraryItem(item: LocalLibraryItem): readonly LocalLibraryItem[] {
  const existing = listLocalLibraryItems().filter((entry) => entry.id !== item.id);
  const next = [item, ...existing];
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors on metadata mirror
    }
  }
  return next;
}
