import type {
  PlanEvent,
  PlanNotice,
  SchedulePreview,
} from '@repo/core/api/planBridge.orpc.contract';
import { describe, expect, it } from 'vitest';
import {
  eventNoticeDue,
  noticeStatusView,
  readScheduleConflict,
  schoolLocalToIso,
  suggestedNoticeTime,
  timingPrompt,
  validateNoticeDraft,
} from './noticeComposer';

const TZ = 'Asia/Colombo';
const preview = (over: Partial<SchedulePreview> = {}): SchedulePreview => ({
  timezone: TZ,
  requested_at: '2026-10-17T16:10:00.000Z',
  requested_label: 'Sat 17 Oct, 9:40 pm',
  in_quiet_hours: true,
  suggested_at: '2026-10-18T01:00:00.000Z',
  suggested_label: 'Sun 18 Oct, 6:30 am',
  window: { start: '20:00', end: '06:30' },
  mode_key: 'good_night',
  lock: 'locked',
  can_override: false,
  recipient_count: 12,
  ...over,
});
const notice = (over: Partial<PlanNotice>): PlanNotice => ({
  id: 'n',
  school_id: 's',
  grade_class_id: 'g',
  grade_class_name: '6 A',
  calendar_event_id: null,
  author_id: 'a',
  title: 'Sports day',
  body: 'White shoes',
  status: 'scheduled',
  send_at: '2026-10-18T01:00:00.000Z',
  sent_at: null,
  recipient_count: null,
  drafted_in_quiet_hours: true,
  held_by_mode: 'good_night',
  override_reason: null,
  overridden_by: null,
  schedule_version: 0,
  created_at: '2026-10-17T16:10:00.000Z',
  ...over,
});

describe('notice composer view logic', () => {
  it('asks "send at 6:30 AM?" inside quiet hours, and offers the override only when allowed', () => {
    const prompt = timingPrompt(preview());
    expect(prompt).toMatchObject({
      kind: 'quiet_hours',
      windowLabel: '8:00 PM to 6:30 AM',
      canOverride: false,
    });
    expect(timingPrompt(preview({ can_override: true }))).toMatchObject({ canOverride: true });
    expect(timingPrompt(preview({ in_quiet_hours: false }))).toEqual({
      kind: 'send',
      timing: 'as_requested',
      label: 'Sat 17 Oct, 9:40 pm',
    });
  });

  it('reads the server quiet-hours refusal', () => {
    expect(
      readScheduleConflict({
        code: 'CONFLICT',
        message: 'Quiet hours',
        data: { reason: 'INSIDE_POLICY_WINDOW', nextAllowedAt: 'x' },
      }),
    ).toMatchObject({ reason: 'INSIDE_POLICY_WINDOW', nextAllowedAt: 'x' });
    expect(readScheduleConflict({ code: 'FORBIDDEN' })).toBeNull();
    expect(readScheduleConflict(new Error('offline'))).toBeNull();
  });

  it('requires a reason for an override', () => {
    expect(
      validateNoticeDraft({
        title: 'Closure',
        body: 'School closed',
        timing: 'override',
        overrideReason: 'flood',
      }),
    ).toHaveProperty('overrideReason');
    expect(
      validateNoticeDraft({
        title: 'Closure',
        body: 'School closed',
        timing: 'override',
        overrideReason: 'Flooding on the main road',
      }),
    ).toEqual({});
    expect(validateNoticeDraft({ title: '', body: '', timing: 'next_allowed' })).toMatchObject({
      title: expect.any(String),
      body: expect.any(String),
    });
  });

  it('describes scheduled and sent notices in plain words', () => {
    expect(noticeStatusView(notice({}), TZ).label).toMatch(
      /^Goes out Sun 18 Oct, 6:30 .m \(after quiet hours\)$/i,
    );
    expect(
      noticeStatusView(notice({ status: 'sent', recipient_count: 1, held_by_mode: null }), TZ)
        .label,
    ).toBe('Sent to 1 guardian');
    expect(
      noticeStatusView(
        notice({
          status: 'sent',
          recipient_count: 3,
          override_reason: 'Flooding on the main road',
        }),
        TZ,
      ).label,
    ).toBe('Sent to 3 guardians during quiet hours (logged)');
    expect(noticeStatusView(notice({ status: 'cancelled' }), TZ).tone).toBe('muted');
  });

  it('turns school-local form fields into instants', () => {
    expect(schoolLocalToIso('2026-10-23', '08:00', TZ)).toBe('2026-10-23T02:30:00.000Z');
    expect(schoolLocalToIso('23/10/2026', '08:00', TZ)).toBeNull();
    expect(schoolLocalToIso('2026-10-23', '8am', TZ)).toBeNull();
  });

  it('suggests 07:00 on the notice due day for a planned event', () => {
    const event: PlanEvent = {
      id: 'e',
      school_id: 's',
      grade_class_id: 'g',
      title: 'Sports day',
      type: 'sports',
      description: null,
      starts_at: '2026-10-23T03:00:00.000Z',
      ends_at: null,
      notice_lead_days: 3,
      notice_due_at: '2026-10-20T03:00:00.000Z',
      created_by: 'a',
    };
    expect(eventNoticeDue(event, TZ)).toMatch(/20 Oct/);
    expect(suggestedNoticeTime(event, TZ, new Date('2026-10-17T05:00:00Z'))).toBe(
      '2026-10-20T01:30:00.000Z',
    );
    expect(suggestedNoticeTime(event, TZ, new Date('2026-10-21T05:00:00Z'))).toBeNull();
  });
});
