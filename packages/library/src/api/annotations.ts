import { knowledgeDB } from '@repo/library/api/database';
import type {
  Bookmark,
  BookmarkRow,
  ReadingProgress,
  ReadingProgressRow,
  TextHighlight,
  TextHighlightRow,
  TextNote,
  TextNoteRow,
} from '@repo/library/types';
import { v7 as uuidv7 } from 'uuid';

function toHighlight(highlight: TextHighlightRow): TextHighlight {
  return {
    id: highlight.id,
    resourceId: highlight.resource_id,
    userId: highlight.user_id,
    cfiRange: highlight.cfi_range ?? undefined,
    pdfSelection:
      highlight.pdf_page_index !== null && highlight.pdf_rects
        ? {
            pageIndex: highlight.pdf_page_index,
            rects: JSON.parse(highlight.pdf_rects),
            text: highlight.pdf_text ?? '',
          }
        : undefined,
    color: highlight.color as TextHighlight['color'],
    createdAt: new Date(highlight.created_at).toISOString(),
    updatedAt: new Date(highlight.updated_at).toISOString(),
  };
}

function toNote(note: TextNoteRow): TextNote {
  return {
    id: note.id,
    resourceId: note.resource_id,
    userId: note.user_id,
    highlightId: note.highlight_id ?? undefined,
    cfiPosition: note.cfi_position ?? undefined,
    pdfPosition:
      note.pdf_page_index !== null && note.pdf_x !== null && note.pdf_y !== null
        ? { pageIndex: note.pdf_page_index, x: note.pdf_x, y: note.pdf_y }
        : undefined,
    content: note.content,
    isPrivate: note.is_private === 1,
    tags: note.tags ? JSON.parse(note.tags) : [],
    createdAt: new Date(note.created_at).toISOString(),
    updatedAt: new Date(note.updated_at).toISOString(),
  };
}

function toProgress(progress: ReadingProgressRow): ReadingProgress {
  return {
    id: progress.id,
    resourceId: progress.resource_id,
    userId: progress.user_id,
    cfiProgress: progress.cfi_progress ?? undefined,
    pdfProgress:
      progress.pdf_page_index !== null
        ? {
            pageIndex: progress.pdf_page_index,
            scrollY: progress.pdf_scroll_y ?? 0,
            totalPages: progress.pdf_total_pages ?? 0,
          }
        : undefined,
    timeSpentMs: progress.time_spent_ms,
    completedAt: progress.completed_at ? new Date(progress.completed_at).toISOString() : undefined,
    lastReadAt: new Date(progress.last_read_at).toISOString(),
  };
}

function toBookmark(bookmark: BookmarkRow): Bookmark {
  return {
    id: bookmark.id,
    resourceId: bookmark.resource_id,
    userId: bookmark.user_id,
    cfiPosition: bookmark.cfi_position ?? undefined,
    pdfPosition:
      bookmark.pdf_page_index !== null && bookmark.pdf_scroll_y !== null
        ? { pageIndex: bookmark.pdf_page_index, scrollY: bookmark.pdf_scroll_y }
        : undefined,
    title: bookmark.title ?? undefined,
    note: bookmark.note ?? undefined,
    createdAt: new Date(bookmark.created_at).toISOString(),
  };
}

/**
 * Reader Annotations API (P2)
 * Local-first CRUD for highlights, notes, reading progress, and bookmarks.
 * Uses the knowledgeDB (SQLite + FTS) for offline-first storage.
 */
export const annotationsAPI = {
  // ============================================================
  // Highlights
  // ============================================================
  async createHighlight(
    userId: string,
    resourceId: string,
    highlight: Omit<TextHighlight, 'id' | 'userId' | 'resourceId' | 'createdAt' | 'updatedAt'>,
  ): Promise<TextHighlight> {
    const id = `hl_${uuidv7()}`;
    const now = Date.now();
    const row = {
      id,
      resource_id: resourceId,
      user_id: userId,
      cfi_range: highlight.cfiRange ?? null,
      pdf_page_index: highlight.pdfSelection?.pageIndex ?? null,
      pdf_rects: highlight.pdfSelection ? JSON.stringify(highlight.pdfSelection.rects) : null,
      pdf_text: highlight.pdfSelection?.text ?? null,
      color: highlight.color,
      created_at: now,
      updated_at: now,
    };
    await knowledgeDB.createHighlight(row);
    return toHighlight(row as any);
  },

  async updateHighlight(
    highlightId: string,
    updates: Partial<
      Omit<TextHighlight, 'id' | 'resourceId' | 'userId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<void> {
    await knowledgeDB.updateHighlight(highlightId, updates as any);
  },

  async deleteHighlight(highlightId: string): Promise<void> {
    await knowledgeDB.deleteHighlight(highlightId);
  },

  async getHighlights(resourceId: string, userId: string): Promise<TextHighlight[]> {
    const rows = await knowledgeDB.getHighlightsByResource(resourceId, userId);
    return rows.map(toHighlight);
  },

  // ============================================================
  // Notes
  // ============================================================
  async createNote(
    userId: string,
    resourceId: string,
    note: Omit<TextNote, 'id' | 'userId' | 'resourceId' | 'createdAt' | 'updatedAt'>,
  ): Promise<TextNote> {
    const id = `note_${uuidv7()}`;
    const now = Date.now();
    const row = {
      id,
      resource_id: resourceId,
      user_id: userId,
      highlight_id: note.highlightId ?? null,
      cfi_position: note.cfiPosition ?? null,
      pdf_page_index: note.pdfPosition?.pageIndex ?? null,
      pdf_x: note.pdfPosition?.x ?? null,
      pdf_y: note.pdfPosition?.y ?? null,
      content: note.content,
      is_private: note.isPrivate ? 1 : 0,
      tags: JSON.stringify(note.tags),
      created_at: now,
      updated_at: now,
    };
    await knowledgeDB.createNote(row);
    return toNote(row as any);
  },

  async updateNote(
    noteId: string,
    updates: Partial<Omit<TextNote, 'id' | 'resourceId' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<void> {
    const rowUpdates: any = {};
    if (updates.content !== undefined) rowUpdates.content = updates.content;
    if (updates.isPrivate !== undefined) rowUpdates.is_private = updates.isPrivate ? 1 : 0;
    if (updates.tags !== undefined) rowUpdates.tags = JSON.stringify(updates.tags);
    if (updates.pdfPosition !== undefined) {
      rowUpdates.pdf_page_index = updates.pdfPosition?.pageIndex ?? null;
      rowUpdates.pdf_x = updates.pdfPosition?.x ?? null;
      rowUpdates.pdf_y = updates.pdfPosition?.y ?? null;
    }
    if (updates.cfiPosition !== undefined) rowUpdates.cfi_position = updates.cfiPosition;
    await knowledgeDB.updateNote(noteId, rowUpdates);
  },

  async deleteNote(noteId: string): Promise<void> {
    await knowledgeDB.deleteNote(noteId);
  },

  async getNotes(resourceId: string, userId: string): Promise<TextNote[]> {
    const rows = await knowledgeDB.getNotesByResource(resourceId, userId);
    return rows.map(toNote);
  },

  async getNotesForHighlight(highlightId: string): Promise<TextNote[]> {
    const rows = await knowledgeDB.getNotesByHighlight(highlightId);
    return rows.map(toNote);
  },

  // ============================================================
  // Reading Progress
  // ============================================================
  async upsertProgress(
    userId: string,
    resourceId: string,
    progress: Omit<ReadingProgress, 'id' | 'resourceId' | 'userId'>,
  ): Promise<ReadingProgress> {
    const id = `prog_${resourceId}_${userId}`;
    const row = {
      id,
      resource_id: resourceId,
      user_id: userId,
      cfi_progress: progress.cfiProgress ?? null,
      pdf_page_index: progress.pdfProgress?.pageIndex ?? null,
      pdf_scroll_y: progress.pdfProgress?.scrollY ?? null,
      pdf_total_pages: progress.pdfProgress?.totalPages ?? null,
      time_spent_ms: progress.timeSpentMs,
      completed_at: progress.completedAt ? new Date(progress.completedAt).getTime() : null,
      last_read_at: new Date(progress.lastReadAt).getTime(),
    };
    await knowledgeDB.upsertReadingProgress(row);
    return toProgress(row as any);
  },

  async getProgress(resourceId: string, userId: string): Promise<ReadingProgress | null> {
    const row = await knowledgeDB.getReadingProgress(resourceId, userId);
    return row ? toProgress(row) : null;
  },

  // ============================================================
  // Bookmarks
  // ============================================================
  async createBookmark(
    userId: string,
    resourceId: string,
    bookmark: Omit<Bookmark, 'id' | 'userId' | 'resourceId' | 'createdAt'>,
  ): Promise<Bookmark> {
    const id = `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const row = {
      id,
      resource_id: resourceId,
      user_id: userId,
      cfi_position: bookmark.cfiPosition ?? null,
      pdf_page_index: bookmark.pdfPosition?.pageIndex ?? null,
      pdf_scroll_y: bookmark.pdfPosition?.scrollY ?? null,
      title: bookmark.title ?? null,
      note: bookmark.note ?? null,
      created_at: Date.now(),
    };
    await knowledgeDB.createBookmark(row);
    return toBookmark(row as any);
  },

  async deleteBookmark(bookmarkId: string): Promise<void> {
    await knowledgeDB.deleteBookmark(bookmarkId);
  },

  async getBookmarks(resourceId: string, userId: string): Promise<Bookmark[]> {
    const rows = await knowledgeDB.getBookmarksByResource(resourceId, userId);
    return rows.map(toBookmark);
  },
};
