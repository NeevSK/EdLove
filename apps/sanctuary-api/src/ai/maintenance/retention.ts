import { canUseZenStackDb, queryDatabaseRows } from '@repo/database/client';

const DEFAULT_RETENTION_DAYS = 90;
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours

/**
 * Deletes expired AI messages at service level (bypasses user RLS):
 *  - temporary messages whose expires_at has passed
 *  - saved messages older than the configured retention window
 */
export async function runAiRetentionCleanup(): Promise<{ deleted: number }> {
  if (!canUseZenStackDb()) {
    return { deleted: 0 };
  }

  try {
    const rows = await queryDatabaseRows<{ value: string }>(
      `SELECT value FROM public.app_config WHERE key = 'ai_message_retention_days' LIMIT 1`,
    );
    const retentionDays = Number(rows[0]?.value) || DEFAULT_RETENTION_DAYS;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const deleted = await queryDatabaseRows<{ id: string }>(
      `DELETE FROM public.ai_messages
        WHERE (expires_at IS NOT NULL AND expires_at < NOW())
           OR (privacy_mode = 'saved' AND created_at < $1)
        RETURNING id`,
      [cutoff.toISOString()],
    );
    return { deleted: deleted.length };
  } catch (err) {
    console.error('[AiRetention] Cleanup failed:', err);
    return { deleted: 0 };
  }
}

/**
 * Schedules periodic retention cleanup. Returns the timer so callers can
 * unref() it (does not keep the event loop alive).
 */
export function startRetentionMaintenance(): ReturnType<typeof setInterval> {
  void runAiRetentionCleanup();
  const timer = setInterval(() => {
    void runAiRetentionCleanup();
  }, CLEANUP_INTERVAL_MS);
  timer.unref?.();
  return timer;
}
