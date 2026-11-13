'use client';

/**
 * The web's one keyboard listener (see `./core.ts`). Pages use the hooks:
 *
 *   useShortcut('mod+k', open, { label: 'Search', scope: 'app' })
 *   useEscapeLayer(open, close)      // a dialog, panel or menu Escape closes
 *
 * and never call addEventListener('keydown') themselves.
 */

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createKeyboard, type ShortcutScope } from './core';

export const keyboard = createKeyboard();

let bound = false;
function bind() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.isComposing) return;
    const el = event.target as HTMLElement | null;
    const typing =
      !!el &&
      (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) &&
      !(el instanceof HTMLInputElement && /^(checkbox|radio|button|submit|range)$/.test(el.type));
    // A native modal <dialog> closes itself on Escape; leave it that key.
    if (event.key === 'Escape' && el?.closest('dialog[open]')) return;
    if (keyboard.handle(event, typing)) event.preventDefault();
  });
}

export interface ShortcutOptions {
  label?: string;
  scope?: ShortcutScope;
  /** Off while false (a screen that is not showing). */
  enabled?: boolean;
}

/** Answer a key while this component is on screen. */
export function useShortcut(keys: string, run: () => void, options: ShortcutOptions = {}) {
  const latest = useRef(run);
  latest.current = run;
  const { label, scope, enabled = true } = options;
  useEffect(() => {
    if (!enabled) return;
    bind();
    return keyboard.register({ keys, label, scope, run: () => latest.current() });
  }, [keys, label, scope, enabled]);
}

/** While `open`, Escape closes this layer (and only this one, if it is on top). */
export function useEscapeLayer(open: boolean, close: () => void) {
  const latest = useRef(close);
  latest.current = close;
  useEffect(() => {
    if (!open) return;
    bind();
    return keyboard.openLayer(() => latest.current());
  }, [open]);
}

/** Outside React (a state machine, an overlay controller): open a layer Escape closes. */
export function openEscapeLayer(close: () => void): () => void {
  bind();
  return keyboard.openLayer(close);
}

/** The shortcuts on screen now, for the "?" list. */
export function useShortcutList() {
  return useSyncExternalStore(keyboard.subscribe, keyboard.list, keyboard.list);
}
