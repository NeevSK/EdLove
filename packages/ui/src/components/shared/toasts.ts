/**
 * The toast queue both platforms read. Not a provider: `toast.show()` works
 * from anywhere (a hook, an event handler, a mutation callback), and each
 * platform's `ToastHost` subscribes with `useSyncExternalStore` and renders
 * nothing while the queue is empty.
 */

import type { ToastOptions } from '../../theme/contracts';
import type { ToastTone } from '../../theme/types';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  action?: ToastOptions['action'];
  durationMs: number;
}

/** Long enough to read a short sentence; longer when there is something to do. */
const DEFAULT_MS = 4000;
const WITH_ACTION_MS = 7000;
/** More than this and the oldest leaves: a stack of toasts is noise, not news. */
const MAX_VISIBLE = 3;

let items: readonly ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

function dismiss(id: number) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return;
  items = next;
  emit();
}

function show(options: ToastOptions): number {
  const id = nextId++;
  const durationMs = options.durationMs ?? (options.action ? WITH_ACTION_MS : DEFAULT_MS);
  const item: ToastItem = {
    id,
    message: options.message,
    tone: options.tone ?? 'info',
    action: options.action,
    durationMs,
  };
  const overflow = items.length + 1 - MAX_VISIBLE;
  for (const old of items.slice(0, Math.max(0, overflow))) {
    const timer = timers.get(old.id);
    if (timer) clearTimeout(timer);
    timers.delete(old.id);
  }
  items = [...items.slice(Math.max(0, overflow)), item];
  timers.set(
    id,
    setTimeout(() => dismiss(id), durationMs),
  );
  emit();
  return id;
}

export const toast = {
  show,
  dismiss,
  /** Run the toast's action, then let it go. */
  act(id: number) {
    const item = items.find((i) => i.id === id);
    item?.action?.onPress();
    dismiss(id);
  },
};

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): readonly ToastItem[] {
  return items;
}

/** Tests only: empty the queue and cancel every timer. */
export function resetToasts() {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  items = [];
  emit();
}
