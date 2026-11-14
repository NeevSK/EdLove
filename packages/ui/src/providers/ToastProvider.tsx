import { sovereignBus } from '@repo/core/lib/sync/eventBus.adapter';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import {
  type LegacyToastType,
  listenForFeedback,
  READABLE_MS,
  showLegacyToast,
} from '../components/shared/feedbackToasts';
import { toast } from '../components/shared/toasts';

/**
 * The older toast API, kept so its callers keep working. Every toast now goes to the world's own
 * queue (`components/shared/toasts`) and is drawn by the kit's `ToastHost`; nothing is drawn here.
 * New code calls `toast.show` from the kit directly.
 */
export type ToastType = LegacyToastType;

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  count: number;
  duration?: number;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /**
   * Hand core's feedback announcements to another host instead of the world's toast queue.
   * Without it, `feedback:toast` and `feedback:clear` on the bus go straight to the queue.
   */
  delegate?: (toast: { message: string; type: ToastType; duration: number }) => void;
}

/** Listens for core's feedback announcements while mounted. Mount it once, near the root. */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children, delegate }) => {
  useEffect(() => {
    if (!delegate) return listenForFeedback();
    return listenForDelegated(delegate);
  }, [delegate]);
  return children;
};

function listenForDelegated(delegate: NonNullable<ToastProviderProps['delegate']>) {
  return sovereignBus.on('feedback:toast', ({ message, type, duration }) =>
    delegate({
      message,
      type,
      duration: Math.max(READABLE_MS.min, Math.min(duration, READABLE_MS.max)),
    }),
  );
}

/** Older callers' toast hook. Works with or without a `ToastProvider` above it. */
export const useSanctuaryToast = () =>
  useMemo(
    () => ({
      showToast: (options: { message: string; type?: ToastType; duration?: number }) => {
        showLegacyToast({ type: 'sanctuary', ...options });
      },
      removeToast: (id: string) => {
        const numeric = Number(id);
        if (Number.isInteger(numeric)) toast.dismiss(numeric);
        else toast.dismiss(id);
      },
    }),
    [],
  );

export { useSanctuaryToast as useToast };
