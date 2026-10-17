/**
 * Composition root for Plan & Bridge: SQL repository over the server pool and
 * an Inngest-backed scheduler. Tests swap the whole service via
 * setPlanBridgeServiceFactoryForTests().
 */
import { queryDatabaseRows } from '@repo/database/client';
import { sanctuaryInngest } from '../../agents/inngest';
import { createSqlPlanBridgeRepository } from './repository';
import { createPlanBridgeService, type PlanBridgeService, type SchedulerPort } from './service';

export const NOTICE_SCHEDULED_EVENT = 'school/notice.scheduled';
export const NOTICE_CANCELLED_EVENT = 'school/notice.cancelled';

export const inngestScheduler: SchedulerPort = {
  async noticeScheduled({ noticeId, schoolId, version, sendAt }) {
    await sanctuaryInngest.send({
      name: NOTICE_SCHEDULED_EVENT,
      // Idempotent per (notice, version): a retried request does not double-schedule.
      id: `notice-${noticeId}-v${version}`,
      data: { noticeId, schoolId, version, sendAt: sendAt.toISOString() },
    } as any);
  },
  async noticeCancelled({ noticeId, schoolId }) {
    await sanctuaryInngest.send({
      name: NOTICE_CANCELLED_EVENT,
      data: { noticeId, schoolId },
    } as any);
  },
};

const defaultFactory = (): PlanBridgeService =>
  createPlanBridgeService({
    repo: createSqlPlanBridgeRepository((query, params) => queryDatabaseRows(query, params ?? [])),
    scheduler: inngestScheduler,
  });

let factory: () => PlanBridgeService = defaultFactory;

export function getPlanBridgeService(): PlanBridgeService {
  return factory();
}

export function setPlanBridgeServiceFactoryForTests(next: (() => PlanBridgeService) | null) {
  factory = next ?? defaultFactory;
}
