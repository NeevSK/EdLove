/**
 * The toast queue both platforms read. Not a provider: `toast.show()` works from anywhere (a hook,
 * an event handler, a mutation callback), and each platform's `ToastHost` subscribes with
 * `useSyncExternalStore` and renders nothing while the queue is empty.
 *
 * A toast is alive while it is up: it can be updated in place (`update`, or `show` with the same
 * `key`), counts up when the same news repeats, waits while the person is reading or holding it
 * (`pause` / `resume`), and follows a promise from "Saving…" to "Saved" or "Couldn't save". When the
 * screen is full, the oldest ordinary toast makes room; important or still-working ones are never
 * pushed out, so a toast that can't fit waits its turn, important ones first.
 */

import type { ToastOptions, ToastSize } from '../../theme/contracts';
import type { ToastTone } from '../../theme/types';

export interface ToastItem {
  id: number;
  message: string;
  description?: string;
  tone: ToastTone;
  size: ToastSize;
  action?: ToastOptions['action'];
  durationMs: number;
  key?: string;
  important: boolean;
  dismissible: boolean;
  /** Waiting on a promise: shows its progress and doesn't time out. */
  pending: boolean;
  /** How many times the same news arrived while this toast was up. */
  count: number;
  /** Goes up on every update, so a host can give the toast a nudge when it changes. */
  revision: number;
}

/** Long enough to read a short sentence; longer when there is something to do. */
const DEFAULT_MS = 4000;
const WITH_ACTION_MS = 7000;
/** More than this at once is noise, not news: the rest wait their turn. Banners don't count. */
const MAX_VISIBLE = 3;

let visible: readonly ToastItem[] = [];
let waiting: readonly ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
/** Running timers, and the time left on paused ones. */
const timers = new Map<number, { handle: ReturnType<typeof setTimeout> | null; endsAt: number; left: number }>();
let pausedAll = false;

function emit() {
  for (const listener of listeners) listener();
}

const stays = (item: ToastItem) => item.pending || !Number.isFinite(item.durationMs);
const counted = (item: ToastItem) => item.size !== 'banner';

function arm(item: ToastItem, ms = item.durationMs) {
  disarm(item.id);
  if (stays(item)) return;
  if (pausedAll) {
    timers.set(item.id, { handle: null, endsAt: 0, left: ms });
    return;
  }
  timers.set(item.id, { handle: setTimeout(() => dismiss(item.id), ms), endsAt: Date.now() + ms, left: ms });
}

function disarm(id: number) {
  const timer = timers.get(id);
  if (timer?.handle) clearTimeout(timer.handle);
  timers.delete(id);
}

/** Moves waiting toasts up while there is room, important ones first. */
function promote() {
  let room = MAX_VISIBLE - visible.filter(counted).length;
  if (room <= 0 || waiting.length === 0) return;
  const order = [...waiting].sort((a, b) => Number(b.important) - Number(a.important));
  const up: ToastItem[] = [];
  const still: ToastItem[] = [];
  for (const item of order) {
    if (room > 0 || !counted(item)) {
      up.push(item);
      if (counted(item)) room -= 1;
    } else still.push(item);
  }
  waiting = waiting.filter((item) => still.includes(item));
  visible = [...visible, ...up];
  for (const item of up) arm(item);
}

function find(target: number | string) {
  const match = (item: ToastItem) => (typeof target === 'number' ? item.id === target : item.key === target);
  return visible.find(match) ?? waiting.find(match);
}

function replace(next: ToastItem) {
  visible = visible.map((item) => (item.id === next.id ? next : item));
  waiting = waiting.map((item) => (item.id === next.id ? next : item));
}

function dismiss(target: number | string) {
  const item = find(target);
  if (!item) return;
  disarm(item.id);
  visible = visible.filter((i) => i.id !== item.id);
  waiting = waiting.filter((i) => i.id !== item.id);
  promote();
  emit();
}

function itemFrom(options: ToastOptions, id: number): ToastItem {
  const size = options.size ?? (options.description || options.action ? 'card' : 'pill');
  const tone = options.tone ?? 'info';
  return {
    id,
    message: options.message,
    description: options.description,
    tone,
    size,
    action: options.action,
    durationMs:
      options.durationMs ??
      (size === 'banner' ? Number.POSITIVE_INFINITY : options.action ? WITH_ACTION_MS : DEFAULT_MS),
    key: options.key,
    important: options.important ?? tone === 'danger',
    dismissible: options.dismissible ?? true,
    pending: false,
    count: 1,
    revision: 0,
  };
}

function show(options: ToastOptions): number {
  const existing = options.key ? find(options.key) : undefined;
  if (existing) {
    const same = existing.message === options.message && existing.tone === (options.tone ?? 'info');
    const next: ToastItem = {
      ...itemFrom(options, existing.id),
      count: same ? existing.count + 1 : 1,
      revision: existing.revision + 1,
    };
    replace(next);
    if (visible.some((item) => item.id === next.id)) arm(next);
    emit();
    return existing.id;
  }
  const item = itemFrom(options, nextId++);
  // Fresh news goes up: when the screen is full, the oldest ordinary toast leaves early. Only when
  // everything up is important or still working does the new one wait its turn.
  if (counted(item) && visible.filter(counted).length >= MAX_VISIBLE) {
    const oldest = visible.find((i) => counted(i) && !i.important && !i.pending);
    if (oldest) {
      disarm(oldest.id);
      visible = visible.filter((i) => i.id !== oldest.id);
    }
  }
  waiting = [...waiting, item];
  promote();
  emit();
  return item.id;
}

/** Changes a toast in place (its words, tone, action, or `pending`), restarting its time. */
function update(target: number | string, patch: Partial<ToastOptions> & { pending?: boolean }) {
  const item = find(target);
  if (!item) return;
  const merged: ToastItem = {
    ...item,
    ...itemFrom({ ...item, ...patch, message: patch.message ?? item.message }, item.id),
    count: item.count,
    pending: patch.pending ?? false,
    revision: item.revision + 1,
  };
  replace(merged);
  if (visible.some((i) => i.id === merged.id)) arm(merged);
  emit();
}

export interface ToastPromiseMessages<T> {
  /** While waiting: "Saving…" */
  loading: string;
  /** When it worked: "Saved", or a message from the result. */
  success: string | ((result: T) => string);
  /** When it failed: "Couldn't save", or a message from the error. */
  error: string | ((error: unknown) => string);
  /** Offered on failure, such as a retry. */
  retry?: ToastOptions['action'];
}

/**
 * Follows a piece of work in one toast: pending while it runs, then success or failure in place.
 * Returns the same promise, so it reads inline: `await toast.promise(save(), { … })`.
 */
function promise<T>(work: Promise<T>, messages: ToastPromiseMessages<T>, options: Partial<ToastOptions> = {}) {
  const id = show({ ...options, message: messages.loading, durationMs: Number.POSITIVE_INFINITY });
  update(id, { message: messages.loading, durationMs: Number.POSITIVE_INFINITY, pending: true });
  work.then(
    (result) =>
      update(id, {
        message: typeof messages.success === 'function' ? messages.success(result) : messages.success,
        tone: 'success',
        durationMs: options.durationMs,
      }),
    (error: unknown) =>
      update(id, {
        message: typeof messages.error === 'function' ? messages.error(error) : messages.error,
        tone: 'danger',
        action: messages.retry,
        durationMs: options.durationMs,
      }),
  );
  return work;
}

/** Stops the clock: one toast (held, or focused by a screen reader), or all of them (app hidden). */
function pause(id?: number) {
  if (id === undefined) pausedAll = true;
  for (const [timerId, timer] of timers) {
    if (id !== undefined && timerId !== id) continue;
    if (!timer.handle) continue;
    clearTimeout(timer.handle);
    timers.set(timerId, { handle: null, endsAt: 0, left: Math.max(0, timer.endsAt - Date.now()) });
  }
}

/** Starts the clock again with the time that was left. */
function resume(id?: number) {
  if (id === undefined) pausedAll = false;
  if (pausedAll) return;
  for (const [timerId, timer] of timers) {
    if (id !== undefined && timerId !== id) continue;
    if (timer.handle) continue;
    const item = visible.find((i) => i.id === timerId);
    if (item) arm(item, Math.max(600, timer.left));
  }
}

export const toast = {
  show,
  update,
  dismiss,
  dismissAll() {
    for (const item of [...visible, ...waiting]) disarm(item.id);
    visible = [];
    waiting = [];
    emit();
  },
  promise,
  pause,
  resume,
  /** Run the toast's action, then let it go. */
  act(id: number) {
    const item = find(id);
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

/** The toasts on screen, oldest first. */
export function getToasts(): readonly ToastItem[] {
  return visible;
}

/** How many are waiting for room. */
export function getWaitingCount(): number {
  return waiting.length;
}

/** Tests only: empty the queue and cancel every timer. */
export function resetToasts() {
  for (const id of timers.keys()) disarm(id);
  visible = [];
  waiting = [];
  pausedAll = false;
  emit();
}
