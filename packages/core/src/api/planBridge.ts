/**
 * Plan & Bridge client (typed oRPC). The server derives the actor, school and
 * capacity from the session; nothing here can choose another author or school.
 */

import { orpcClient } from '@repo/core/api/orpcClient';
import type {
  CalendarEventType,
  NoticeTiming,
  PlanEvent,
  PlanGradeClass,
  PlanNotice,
  PlanSettings,
  planBridgeORPCContract,
  SchedulePreview,
} from '@repo/core/api/planBridge.orpc.contract';
import type { z } from 'zod';

type Body<K extends keyof typeof planBridgeORPCContract> =
  (typeof planBridgeORPCContract)[K]['request'] extends {
    body: infer B extends z.ZodTypeAny;
  }
    ? z.input<B>
    : never;

export type CreatePlanEventInput = Body<'createEvent'>;
export type ScheduleNoticeInput = Body<'scheduleNotice'>;
export type UpdateQuietHoursInput = Body<'updateQuietHours'>;

const rpc = () => (orpcClient as any).planBridge;

export const planBridgeAPI = {
  listMyGradeClasses(): Promise<PlanGradeClass[]> {
    return rpc().listMyGradeClasses({});
  },
  getSettings(): Promise<PlanSettings> {
    return rpc().getSettings({});
  },
  updateQuietHours(body: UpdateQuietHoursInput): Promise<PlanSettings> {
    return rpc().updateQuietHours({ body });
  },
  listEvents(query: { gradeClassId?: string; from?: string } = {}): Promise<PlanEvent[]> {
    return rpc().listEvents({ query });
  },
  createEvent(body: CreatePlanEventInput & { type: CalendarEventType }): Promise<PlanEvent> {
    return rpc().createEvent({ body });
  },
  previewNotice(body: { gradeClassId: string; sendAt?: string | null }): Promise<SchedulePreview> {
    return rpc().previewNotice({ body });
  },
  scheduleNotice(body: ScheduleNoticeInput & { timing: NoticeTiming }): Promise<PlanNotice> {
    return rpc().scheduleNotice({ body });
  },
  cancelNotice(noticeId: string): Promise<PlanNotice> {
    return rpc().cancelNotice({ body: { noticeId } });
  },
  listNotices(query: { gradeClassId?: string } = {}): Promise<PlanNotice[]> {
    return rpc().listNotices({ query });
  },
  verifyGuardianLink(body: { relationshipId: string; decision: 'verified' | 'revoked' }) {
    return rpc().verifyGuardianLink({ body }) as Promise<{
      id: string;
      verification_status: 'pending' | 'verified' | 'revoked';
    }>;
  },
};

export type PlanBridgeAPI = typeof planBridgeAPI;
