/**
 * Drafts that survive interruptions. A teacher writing a note is called away, the phone rings, a
 * low-memory Android closes the app in the background, the battery dies: what they typed is still
 * there when they come back. `useDraft` keeps a text value the way `useState` does, and also
 * writes it to the phone a moment after typing stops and at once when the app goes to the
 * background.
 *
 * Drafts belong to the person (a shared family phone keeps each account's apart), are dropped
 * after a week, and are cleared when the thing is sent (`clear`). Screens whose point is that
 * words are not kept (a journal you burn) do not use it.
 */

import { getActiveAccountId } from '@repo/core/lib/accountScope.adapter';
import { storage } from '@repo/core/lib/storage.adapter';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

const PREFIX = 'gurudevi.draft';
/** A week: long enough for "I'll finish it tomorrow", short enough not to surprise anyone. */
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SAVE_AFTER_MS = 600;

/** Drafts are filed under the signed-in account, so a shared phone keeps each person's apart. */
export function draftStorageKey(key: string, account: string | null = getActiveAccountId()): string {
  return `${PREFIX}:${account ?? 'device'}:${key}`;
}

interface Saved {
  v: string;
  at: number;
}

/** Read a saved draft; an old or broken one is treated as none. Pure apart from `now`. */
export function parseDraft(raw: string | null | undefined, now: number): string | null {
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as Partial<Saved>;
    if (typeof saved?.v !== 'string' || typeof saved.at !== 'number') return null;
    if (now - saved.at > DRAFT_TTL_MS || saved.v === '') return null;
    return saved.v;
  } catch {
    return null;
  }
}

export function readDraft(key: string): string | null {
  const full = draftStorageKey(key);
  try {
    const value = parseDraft(storage.getString(full), Date.now());
    if (value === null) storage.delete(full);
    return value;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, value: string): void {
  const full = draftStorageKey(key);
  try {
    if (value === '') storage.delete(full);
    else storage.set(full, JSON.stringify({ v: value, at: Date.now() } satisfies Saved));
  } catch (error) {
    console.warn('[drafts] could not keep the draft.', error);
  }
}

export function clearDraft(key: string): void {
  writeDraft(key, '');
}

export interface Draft {
  value: string;
  setValue: (next: string | ((current: string) => string)) => void;
  /** Forget the draft (after sending, or when the person throws it away). */
  clear: () => void;
  /** The value came back from an earlier visit: say so ("Your draft was kept"). */
  restored: boolean;
}

/**
 * A text value that is kept through interruptions. `key` names the place ("class-note:7B");
 * null keeps nothing (a guest, or a screen still loading what it edits).
 */
export function useDraft(key: string | null, initial = ''): Draft {
  const [start] = useState(() => (key ? readDraft(key) : null));
  const [value, setLocal] = useState(start ?? initial);
  const [restored, setRestored] = useState(start !== null);
  const latest = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (key) writeDraft(key, latest.current);
  }, [key]);

  const setValue = useCallback(
    (next: string | ((current: string) => string)) => {
      const resolved = typeof next === 'function' ? next(latest.current) : next;
      latest.current = resolved;
      setLocal(resolved);
      if (!key) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, SAVE_AFTER_MS);
    },
    [key, flush],
  );

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    latest.current = '';
    setLocal('');
    setRestored(false);
    if (key) clearDraft(key);
  }, [key]);

  // Leaving the app (a call, the home button, the system closing it) writes at once.
  useEffect(() => {
    if (!key) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flush();
    });
    return () => {
      sub.remove();
      flush();
    };
  }, [key, flush]);

  return { value, setValue, clear, restored };
}
