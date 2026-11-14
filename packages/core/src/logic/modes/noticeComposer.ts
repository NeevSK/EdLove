/**
 * Pure view logic for the plan > compose > schedule flow.
 * Free of React and platform native bindings, so it is shared across
 * apps/gurudevi-web, apps/gurudevi-mobile, and packages/classroom.
 */
import type {
  NoticeTiming,
  PlanEvent,
  PlanNotice,
  SchedulePreview,
} from '../../api/planBridge.orpc.contract';
import { MIN_OVERRIDE_REASON } from './resolveSendTime';
import { formatClock, formatLocal, zonedTimeToInstant } from './schedule';

export { MIN_OVERRIDE_REASON };

export type ScheduleConflict = {
  reason: 'INSIDE_POLICY_WINDOW' | 'OVERRIDE_NOT_ALLOWED' | 'OVERRIDE_REASON_REQUIRED' | string;
  nextAllowedAt: string | null;
  nextAllowedLabel: string | null;
  message: string;
};

/** Reads the server's quiet-hours refusal (oRPC CONFLICT with data). */
export function readScheduleConflict(error: unknown): ScheduleConflict | null {
  const e = error as { code?: string; message?: string; data?: Record<string, unknown> } | null;
  if (!e || e.code !== 'CONFLICT' || !e.data || typeof e.data.reason !== 'string') return null;
  return {
    reason: e.data.reason,
    nextAllowedAt: typeof e.data.nextAllowedAt === 'string' ? e.data.nextAllowedAt : null,
    nextAllowedLabel: typeof e.data.nextAllowedLabel === 'string' ? e.data.nextAllowedLabel : null,
    message: e.message ?? 'Could not schedule this notice.',
  };
}

export type TimingPrompt =
  | { kind: 'send'; timing: 'as_requested'; label: string }
  | {
      kind: 'quiet_hours';
      /** "School quiet hours are 8:00 PM to 6:30 AM." */
      windowLabel: string;
      /** "Sun 18 Oct, 6:30 AM" */
      suggestedLabel: string;
      suggestedAt: string;
      canOverride: boolean;
    };

/** What the composer asks before sending, from the server preview. */
export function timingPrompt(preview: SchedulePreview): TimingPrompt {
  if (!preview.in_quiet_hours) {
    return { kind: 'send', timing: 'as_requested', label: preview.requested_label };
  }
  const windowLabel = preview.window
    ? `${formatClock(preview.window.start)} to ${formatClock(preview.window.end)}`
    : 'now';
  return {
    kind: 'quiet_hours',
    windowLabel,
    suggestedLabel: preview.suggested_label,
    suggestedAt: preview.suggested_at,
    canOverride: preview.can_override,
  };
}

export type NoticeDraft = {
  title: string;
  body: string;
  timing: NoticeTiming;
  overrideReason?: string;
};

export type DraftErrors = Partial<Record<'title' | 'body' | 'overrideReason', string>>;

export function validateNoticeDraft(draft: NoticeDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (draft.title.trim().length < 2) errors.title = 'Add a short title.';
  if (draft.title.trim().length > 140) errors.title = 'Keep the title under 140 characters.';
  if (draft.body.trim().length < 2) errors.body = 'Write the notice.';
  if (draft.body.trim().length > 2000) errors.body = 'Keep the notice under 2000 characters.';
  if (
    draft.timing === 'override' &&
    (draft.overrideReason ?? '').trim().length < MIN_OVERRIDE_REASON
  ) {
    errors.overrideReason = `Say why this cannot wait (at least ${MIN_OVERRIDE_REASON} characters).`;
  }
  return errors;
}

export type NoticeStatusView = {
  tone: 'waiting' | 'done' | 'muted' | 'problem';
  i18nKey: string;
  label: string;
  /** Spoken by screen readers. */
  a11y: string;
};

export function noticeStatusView(notice: PlanNotice, timeZone: string): NoticeStatusView {
  switch (notice.status) {
    case 'scheduled': {
      const when = notice.send_at ? formatLocal(new Date(notice.send_at), timeZone) : 'soon';
      const held =
        notice.held_by_mode === 'good_night'
          ? ' (after quiet hours)'
          : notice.held_by_mode === 'rest_day'
            ? ' (after rest day)'
            : notice.held_by_mode
              ? ` (held by ${notice.held_by_mode})`
              : '';
      return {
        tone: 'waiting',
        i18nKey: 'planBridge.status.scheduled',
        label: `Goes out ${when}${held}`,
        a11y: `Scheduled. Goes out ${when}${held}.`,
      };
    }
    case 'sent': {
      const count = notice.recipient_count ?? 0;
      const who = count === 1 ? '1 guardian' : `${count} guardians`;
      const override = notice.override_reason ? ' during quiet hours (logged)' : '';
      return {
        tone: 'done',
        i18nKey: 'planBridge.status.sent',
        label: `Sent to ${who}${override}`,
        a11y: `Sent to ${who}${override}.`,
      };
    }
    case 'cancelled':
      return {
        tone: 'muted',
        i18nKey: 'planBridge.status.cancelled',
        label: 'Cancelled',
        a11y: 'Cancelled.',
      };
    case 'failed':
      return {
        tone: 'problem',
        i18nKey: 'planBridge.status.failed',
        label: 'Did not go out',
        a11y: 'Failed to send.',
      };
    default:
      return { tone: 'muted', i18nKey: 'planBridge.status.draft', label: 'Draft', a11y: 'Draft.' };
  }
}

/** "Notice due Tue 20 Oct" for an event with lead days. */
export function eventNoticeDue(event: PlanEvent, timeZone: string): string | null {
  if (!event.notice_due_at) return null;
  return formatLocal(new Date(event.notice_due_at), timeZone);
}

/**
 * Form fields are school-local wall clock ("2026-10-23", "08:00"); the API
 * wants an instant. Returns null for malformed input.
 */
export function schoolLocalToIso(date: string, time: string, timeZone: string): string | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const t = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!d || !t) return null;
  const [year, month, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return zonedTimeToInstant(
    year,
    month,
    day,
    Number(t[1]) * 60 + Number(t[2]),
    timeZone,
  ).toISOString();
}

/** Default "send" time for an event's notice: lead days before, at 07:00 local. */
export function suggestedNoticeTime(
  event: PlanEvent,
  timeZone: string,
  now: Date = new Date(),
): string | null {
  if (!event.notice_due_at) return null;
  const due = new Date(event.notice_due_at);
  const iso = formatIsoDate(due, timeZone);
  const at = schoolLocalToIso(iso, '07:00', timeZone);
  if (!at) return null;
  return new Date(at) < now ? null : at;
}

function formatIsoDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant); // en-CA yields YYYY-MM-DD
}
