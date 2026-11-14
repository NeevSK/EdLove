import type { MomentRule } from './moments';

/**
 * The learning loops as moments, with their defaults. Each rule's id is what its PJC record and
 * evidence link to (`feature:learning.loops` in the catalog). The flow ids name the flows each
 * offer opens; those flows are built with their screens, so a rule whose flow isn't registered
 * yet is simply not wired. Wording, defaults and which rules ship are product decisions.
 */
export const LEARNING_MOMENT_RULES = [
  {
    // Metacognition: planning before starting (EEF: +8 months, must be explicit).
    id: 'moment:plan_before_activity',
    on: 'activity.opening',
    audience: 'self',
    offer: { flowId: 'flow:self:plan_activity', stepId: 'step:self.plan_activity.choose' },
    perDay: 3,
    ignoresQuietHours: true,
  },
  {
    // Calibration after an attempt: sure-and-wrong answers are the likely misconceptions.
    id: 'moment:calibration_after_attempt',
    on: 'attempt.finished',
    audience: 'self',
    offer: {
      flowId: 'flow:self:attempt_reflection',
      stepId: 'step:self.attempt_reflection.calibration',
    },
    ignoresQuietHours: true,
    priority: 2,
  },
  {
    // Competence: help that faded, offered as a can-do moment for the person to claim or let pass.
    id: 'moment:help_faded',
    on: 'help.faded',
    audience: 'self',
    offer: { flowId: 'flow:self:claim_growth', stepId: 'step:self.claim_growth.offer' },
    perDay: 1,
    subjectCooldownMinutes: 7 * 24 * 60,
    priority: 1,
  },
  {
    // Spacing: a short, mixed review when items are due.
    id: 'moment:review_due',
    on: 'review.due',
    audience: 'self',
    offer: { flowId: 'flow:self:review_session', stepId: 'step:self.review_session.start' },
    perDay: 1,
  },
  {
    // Relatedness and the teacher's view: students who did alone what needed help before.
    id: 'moment:teacher_growth_noticed',
    on: 'class.growth_noticed',
    audience: 'teacher',
    offer: {
      flowId: 'flow:teacher:send_growth_note',
      stepId: 'step:teacher.send_growth_note.choose',
    },
    perDay: 1,
  },
  {
    // The mesosystem: a moment the child chose to share reaches the guardian.
    id: 'moment:guardian_shared_growth',
    on: 'growth.shared_with_guardian',
    audience: 'guardian',
    offer: { flowId: 'flow:guardian:shared_growth', stepId: 'step:guardian.shared_growth.view' },
    needsConsent: 'share.guardian',
    perDay: 2,
  },
] as const satisfies readonly MomentRule[];
