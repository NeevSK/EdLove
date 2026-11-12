'use client';

import { sovereignBus } from '@repo/core/lib/sync/eventBus.adapter';
import { ToastHost, toast } from '@repo/ui/components/web';
import { useEffect } from 'react';

const TONE = { error: 'danger', success: 'success', info: 'info' } as const;

/**
 * Where the person sees feedback on web. Core announces it on the event bus (`showToast`, and
 * `presentFailure` for failed queries and mutations); this forwards each announcement into the
 * kit's toast queue and renders the kit's `ToastHost`. Mobile does the same in `ToastProvider`.
 */
export function FeedbackToasts() {
  useEffect(
    () =>
      sovereignBus.on('feedback:toast', ({ message, type, duration }) => {
        toast.show({ message, tone: TONE[type], durationMs: duration });
      }),
    [],
  );
  return <ToastHost />;
}
