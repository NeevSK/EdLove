import { listenForFeedback, ToastHost } from '@repo/ui/components/web';
import { useEffect } from 'react';

/**
 * Where the person sees feedback on web. Core announces it on the event bus (`showToast`, and
 * `presentFailure` for failed queries and mutations); this carries each announcement into the
 * kit's toast queue and renders the kit's `ToastHost`. Mobile does the same in `ToastProvider`.
 */
export function FeedbackToasts() {
  useEffect(() => listenForFeedback(), []);
  return <ToastHost />;
}
