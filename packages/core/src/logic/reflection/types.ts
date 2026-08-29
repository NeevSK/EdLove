/**
 * Types for the guided-reflection engine — a structured thought record.
 * Domain: noticing an automatic thought, naming the feeling, spotting a
 * thinking trap, weighing evidence, and reframing into a balanced view.
 * Shared by @repo/self (Reframe) and @repo/classroom (Learning Reflection).
 * Clean-room pattern (inspiration: thought records / classic CBT practice).
 */

export type ThoughtEmotion =
  | 'happy'
  | 'relaxed'
  | 'calm'
  | 'focused'
  | 'anxious'
  | 'frustrated'
  | 'overwhelmed'
  | 'sad'
  | 'guilty'
  | 'angry';

export type TrapSlope = 'general' | 'learning';

export interface ThinkingTrap {
  id: string;
  label: string;
  emoji: string;
  /** general = applies to anyone; learning = academic/study context */
  slope: TrapSlope;
  description: string;
  example: string;
  /** Question the user can ask to challenge this trap. */
  challengePrompt: string;
}

export type ReframeStepId =
  | 'checkup'
  | 'thought'
  | 'feeling'
  | 'traps'
  | 'evidence'
  | 'reframe'
  | 'recheck';

export interface EvidencePair {
  forThought: string;
  againstThought: string;
}

export type ReframeOutcome = 'better' | 'same' | 'worse';

export interface ReframeFollowUp {
  dueAt: string;
  completedAt?: string;
  outcome?: ReframeOutcome;
  reflection?: string;
}

export interface ThoughtRecord {
  id: string;
  userId: string;
  /** Pre-check: felt mood before starting (1..5). */
  preMood: number;
  preNote?: string;
  automaticThought: string;
  emotion: ThoughtEmotion;
  /** Intensity of the emotion at the moment (1..10). */
  intensity: number;
  trapIds: string[];
  customTrap?: string;
  evidence: EvidencePair;
  reframedThought: string;
  /** Post-check: felt mood after reframing (1..5). */
  postMood: number;
  postOutcome: ReframeOutcome;
  followUp?: ReframeFollowUp;
  createdAt: string;
  completedAt: string;
}

/** Draft state captured while the user walks the wizard. */
export interface ThoughtRecordDraft {
  currentStep: ReframeStepId;
  preMood?: number;
  preNote?: string;
  automaticThought?: string;
  emotion?: ThoughtEmotion;
  intensity?: number;
  trapIds: string[];
  customTrap?: string;
  forThought?: string;
  againstThought?: string;
  reframedThought?: string;
  postMood?: number;
  postOutcome?: ReframeOutcome;
  scheduledFollowUp?: { dueAt: string } | null;
}
