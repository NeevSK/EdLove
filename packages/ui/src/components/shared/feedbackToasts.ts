import { sovereignBus } from '@repo/core/lib/sync/eventBus.adapter';
import type { ToastTone } from '../../theme/types';
import { toast } from './toasts';

/** Every older name a toast's kind has gone by, to the world's tones. */
export type LegacyToastType = 'success' | 'error' | 'info' | 'sanctuary' | 'warning';

const TONE: Record<LegacyToastType, ToastTone> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info',
  sanctuary: 'info',
};

/** Shortest and longest a toast from older callers stays: long enough to read, never forever. */
export const READABLE_MS = { min: 2500, max: 10000 } as const;

export function toneOf(type: string | undefined): ToastTone {
  return TONE[(type ?? 'info') as LegacyToastType] ?? 'info';
}

/** Shows a toast from an older caller in the world's own host, at a readable length. */
export function showLegacyToast({
  message,
  type,
  duration = 4000,
}: {
  message: string;
  type?: string;
  duration?: number;
}): number {
  return toast.show({
    message,
    tone: toneOf(type),
    durationMs: Math.max(READABLE_MS.min, Math.min(duration, READABLE_MS.max)),
  });
}

/**
 * Carries core's feedback announcements (`showToast`, `presentFailure`, and the bus's `feedback:clear`)
 * into the world's toast queue. Mount it once per app: mobile's `ToastProvider` and web's
 * `FeedbackToasts` do. Returns the way to stop listening.
 */
export function listenForFeedback(): () => void {
  const offShow = sovereignBus.on('feedback:toast', (event) => {
    showLegacyToast(event);
  });
  const offClear = sovereignBus.on('feedback:clear', () => toast.dismissAll());
  return () => {
    offShow();
    offClear();
  };
}
