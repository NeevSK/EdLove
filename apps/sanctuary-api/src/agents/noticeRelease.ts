/**
 * Calm notice release.
 * - noticeRelease: one durable run per scheduled notice version. It sleeps
 *   until send_at and then calls the idempotent SQL release. A reschedule bumps
 *   the version, so a stale run releases nothing ("superseded"). An explicit
 *   cancel also cancels the run early (cancelOn).
 * - noticeSweep: every 5 minutes, releases anything due. This covers lost runs
 *   and send times beyond one durable sleep. pg_cron runs the same SQL each
 *   minute where the extension exists.
 */
import {
  getPlanBridgeService,
  NOTICE_CANCELLED_EVENT,
  NOTICE_SCHEDULED_EVENT,
} from '../core/planBridge/runtime';
import { sanctuaryInngest } from './inngest';

// Inngest sleeps are bounded by plan limits; the sweep covers anything longer.
const MAX_SLEEP_MS = 6 * 86_400_000;

export const noticeRelease = sanctuaryInngest.createFunction(
  {
    id: 'plan-bridge-notice-release',
    retries: 5,
    triggers: [{ event: NOTICE_SCHEDULED_EVENT }],
    cancelOn: [{ event: NOTICE_CANCELLED_EVENT, match: 'data.noticeId' }],
    idempotency: 'event.data.noticeId + "-" + event.data.version',
  } as any,
  async ({ event, step }: any) => {
    const { noticeId, version, sendAt } = event.data as {
      noticeId: string;
      version: number;
      sendAt: string;
    };
    const due = new Date(sendAt);
    if (due.getTime() - Date.now() > MAX_SLEEP_MS) {
      return { outcome: 'deferred_to_sweep', noticeId };
    }
    await step.sleepUntil('wait-for-send-window', due);
    return step.run('release-notice', () =>
      getPlanBridgeService().releaseNotice(noticeId, version),
    );
  },
) as any;

export const noticeSweep = sanctuaryInngest.createFunction(
  { id: 'plan-bridge-notice-sweep', retries: 2, triggers: [{ cron: '*/5 * * * *' }] } as any,
  async ({ step }: any) =>
    step.run('release-due-notices', () => getPlanBridgeService().releaseDue()),
) as any;

export const noticeFunctions = [noticeRelease, noticeSweep];
