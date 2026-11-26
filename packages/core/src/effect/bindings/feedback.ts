import { presentFailure } from '@repo/core/lib/failureFeedback.adapter';
import { showToast } from '@repo/core/lib/feedback.adapter';

/** What the user is told: a toast, or the message and remedy for a failure. */
export const feedback = {
  toast: (...args: Parameters<typeof showToast>): void => showToast(...args),
  presentFailure: (error: unknown, operation?: string) => presentFailure(error, operation),
};
