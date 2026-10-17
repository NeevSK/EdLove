/**
 * Plan & Bridge client (typed oRPC with Effect resilience). The server derives
 * the actor, school, and capacity from the session; nothing here can choose
 * another author or school.
 */

import { orpcClient } from '@repo/core/api/orpcClient';
import type {
  CalendarEventType,
  createPlanEventInputSchema,
  GuardianLinkItem,
  NoticeTiming,
  PlanEvent,
  PlanGradeClass,
  PlanNotice,
  PlanSettings,
  SchedulePreview,
  scheduleNoticeInputSchema,
  UpdateModePolicyInput,
  updateQuietHoursInputSchema,
} from '@repo/core/api/planBridge.orpc.contract';
import { APIError } from '@repo/core/types/API';
import { defaultRetryPolicy } from '@repo/core/utils/effect';
import { Data, Duration, Effect, pipe } from 'effect';
import type { z } from 'zod';

export type CreatePlanEventInput = z.infer<typeof createPlanEventInputSchema>;
export type ScheduleNoticeInput = z.infer<typeof scheduleNoticeInputSchema>;
export type UpdateQuietHoursInput = z.infer<typeof updateQuietHoursInputSchema>;

export class PlanBridgeHttpError extends Data.TaggedError('PlanBridgeHttpError')<{
  readonly message: string;
  readonly status: string;
  readonly code?: string;
  readonly data?: Record<string, unknown>;
}> {}

function apiEffect<T>(fn: () => Promise<T>): Effect.Effect<T, PlanBridgeHttpError, never> {
  return pipe(
    Effect.tryPromise({
      try: fn,
      catch: (e: any) =>
        new PlanBridgeHttpError({
          message: String(e?.message ?? 'PlanBridge API call failed'),
          status: String(e?.status ?? e?.statusCode ?? '500'),
          code: typeof e?.code === 'string' ? e.code : undefined,
          data: typeof e?.data === 'object' && e?.data !== null ? e.data : undefined,
        }),
    }),
    Effect.retry(defaultRetryPolicy),
    Effect.timeout(Duration.seconds(15)),
    Effect.catchTag('TimeoutError', () =>
      Effect.fail(
        new PlanBridgeHttpError({
          message: 'PlanBridge API timed out after 15s',
          status: '408',
        }),
      ),
    ),
  );
}

function toPromise<T>(effect: Effect.Effect<T, PlanBridgeHttpError, never>): Promise<T> {
  return Effect.runPromise(
    effect.pipe(
      Effect.catch((e: PlanBridgeHttpError) => {
        const err = new APIError(e.message, e.status);
        (err as any).code = e.code;
        (err as any).data = e.data;
        return Effect.fail(err);
      }),
    ),
  );
}

const rpc = () => (orpcClient as any).planBridge;

export const planBridgeAPI = {
  listMyGradeClasses(): Promise<PlanGradeClass[]> {
    return toPromise(apiEffect(() => rpc().listMyGradeClasses({})));
  },
  getSettings(): Promise<PlanSettings> {
    return toPromise(apiEffect(() => rpc().getSettings({})));
  },
  updateQuietHours(body: UpdateQuietHoursInput): Promise<PlanSettings> {
    return toPromise(apiEffect(() => rpc().updateQuietHours({ body })));
  },
  updateModePolicy(body: UpdateModePolicyInput): Promise<PlanSettings> {
    return toPromise(apiEffect(() => rpc().updateModePolicy({ body })));
  },
  listEvents(query: { gradeClassId?: string; from?: string } = {}): Promise<PlanEvent[]> {
    return toPromise(apiEffect(() => rpc().listEvents({ query })));
  },
  createEvent(body: CreatePlanEventInput & { type: CalendarEventType }): Promise<PlanEvent> {
    return toPromise(apiEffect(() => rpc().createEvent({ body })));
  },
  previewNotice(body: { gradeClassId: string; sendAt?: string | null }): Promise<SchedulePreview> {
    return toPromise(apiEffect(() => rpc().previewNotice({ body })));
  },
  scheduleNotice(body: ScheduleNoticeInput & { timing: NoticeTiming }): Promise<PlanNotice> {
    return toPromise(apiEffect(() => rpc().scheduleNotice({ body })));
  },
  cancelNotice(noticeId: string): Promise<PlanNotice> {
    return toPromise(apiEffect(() => rpc().cancelNotice({ body: { noticeId } })));
  },
  listNotices(query: { gradeClassId?: string } = {}): Promise<PlanNotice[]> {
    return toPromise(apiEffect(() => rpc().listNotices({ query })));
  },
  listGuardianLinks(
    query: { status?: 'pending' | 'verified' | 'revoked' } = {},
  ): Promise<GuardianLinkItem[]> {
    return toPromise(apiEffect(() => rpc().listGuardianLinks({ query })));
  },
  verifyGuardianLink(body: { relationshipId: string; decision: 'verified' | 'revoked' }): Promise<{
    id: string;
    verification_status: 'pending' | 'verified' | 'revoked';
  }> {
    return toPromise(apiEffect(() => rpc().verifyGuardianLink({ body })));
  },
};

export type PlanBridgeAPI = typeof planBridgeAPI;
