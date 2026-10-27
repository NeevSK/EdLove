import { sovereignBus } from '@repo/core/lib/sync/eventBus';

/** Requests display by the mounted feedback host; contains no auth state. */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'info',
  duration = 3000,
): void {
  sovereignBus.emit('feedback:toast', { message, type, duration });
}
