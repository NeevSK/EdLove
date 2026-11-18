import { DEFAULT_SCHOOL_TIMEZONE } from '@repo/core/logic/modes/schedule';

export interface PlanGradeClass {
  id: string;
  name: string;
  school_id: string;
  enrolled_count: number;
  verified_guardian_count: number;
}

export interface PlanEvent {
  id: string;
  school_id: string;
  grade_class_id: string | null;
  title: string;
  type: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  notice_lead_days: number | null;
  notice_due_at: string | null;
  created_by: string | null;
}

export interface PlanSettings {
  school_id: string;
  timezone: string;
  good_night: {
    mode_key: string;
    lock: 'locked' | 'suggested' | 'off';
    schedule: { weekly: Array<{ days: string[]; start: string; end: string }> };
    everyday: { start: string; end: string } | null;
    override_roles: string[];
    override_rate_limit_per_day: number | null;
    provisional: boolean;
  };
  guardian_verification_required: boolean;
  usage_signal_opt_in: boolean;
  can_edit: boolean;
  can_override: boolean;
}

export const SAMPLE_GRADE_CLASSES: PlanGradeClass[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Grade 7 - Forest Canopy',
    school_id: '00000000-0000-4000-8000-000000000000',
    enrolled_count: 28,
    verified_guardian_count: 26,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Grade 8 - Ocean Horizon',
    school_id: '00000000-0000-4000-8000-000000000000',
    enrolled_count: 32,
    verified_guardian_count: 30,
  },
];

export const SAMPLE_EVENTS: PlanEvent[] = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    school_id: '00000000-0000-4000-8000-000000000000',
    grade_class_id: '11111111-1111-4111-8111-111111111111',
    title: 'Botanical Garden Field Exploration',
    type: 'event',
    description: 'Observation of flora and nature studies in the central gardens.',
    starts_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    ends_at: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
    notice_lead_days: 2,
    notice_due_at: new Date(Date.now() + 86400000).toISOString(),
    created_by: null,
  },
];

export const SAMPLE_SETTINGS: PlanSettings = {
  school_id: '00000000-0000-4000-8000-000000000000',
  timezone: DEFAULT_SCHOOL_TIMEZONE,
  good_night: {
    mode_key: 'good_night',
    lock: 'locked',
    schedule: {
      weekly: [
        {
          days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          start: '21:00',
          end: '06:00',
        },
      ],
    },
    everyday: { start: '21:00', end: '06:00' },
    override_roles: ['principal', 'deputy_principal'],
    override_rate_limit_per_day: 3,
    provisional: false,
  },
  guardian_verification_required: true,
  usage_signal_opt_in: true,
  can_edit: false,
  can_override: false,
};
