/**
 * Pure helpers for the guided-reflection engine.
 * Clean-room pattern (inspiration: CBT follow-up re-checks).
 */
import type { ReframeOutcome, ThoughtRecord } from './types';

/**
 * Derive the shift outcome from pre/post mood when the user did not rate it
 * explicitly. post > pre = better, post < pre = worse, otherwise same.
 */
export function deriveReframeOutcome(preMood: number, postMood: number): ReframeOutcome {
  if (postMood > preMood) return 'better';
  if (postMood < preMood) return 'worse';
  return 'same';
}

/**
 * True when a scheduled follow-up re-check is due and has not been completed.
 * A missing dueAt never counts as due.
 */
export function isFollowUpDue(record: ThoughtRecord, now: number = Date.now()): boolean {
  const dueAt = record.followUp?.dueAt;
  if (!dueAt || record.followUp?.completedAt) return false;
  const due = new Date(dueAt).getTime();
  return Number.isFinite(due) && due <= now;
}
