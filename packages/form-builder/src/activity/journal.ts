import type { ProctoringEvent } from '@intuitui-labs/form-builder-engine/assessment';
import type { GradeQuizInput } from '../quiz/grade';

/**
 * The journal of one attempt: every step, in the order it happened, append-only. It records
 * what the person did and **what help they had**, so an attempt shows what someone can do
 * alone and what they can do with help. Marks are worked out from it; it is never rewritten.
 *
 * `part` names the question: a form field's `name`, or an H5P `subContentId`.
 * Step ids are made on the device, so a step sent twice is kept once.
 */

export type AssistanceKind = 'hint' | 'worked_example' | 'peer' | 'teacher' | 'guardian' | 'ai';

interface StepBase {
  readonly id: string;
  /** Device time, ISO 8601. */
  readonly at: string;
}

export type AttemptStep =
  | (StepBase & { readonly kind: 'answered'; readonly part: string; readonly response: unknown })
  | (StepBase & { readonly kind: 'retried'; readonly part: string })
  | (StepBase & { readonly kind: 'help_asked'; readonly part: string })
  | (StepBase & {
      readonly kind: 'helped';
      readonly part: string;
      readonly assistance: AssistanceKind;
      /** The rung on a hint ladder, from 1. */
      readonly level?: number;
      /** The person who helped, when a person did. */
      readonly helperId?: string;
    })
  | (StepBase & { readonly kind: 'left_app' })
  | (StepBase & { readonly kind: 'returned' })
  | (StepBase & { readonly kind: 'time_up' })
  /** How sure the person was of an answer, given with it. Used only to reflect back to them. */
  | (StepBase & { readonly kind: 'confidence'; readonly part: string; readonly level: Confidence })
  /** A planning, monitoring or evaluating note the person wrote around the activity. */
  | (StepBase & {
      readonly kind: 'reflected';
      readonly stage: ReflectionStage;
      readonly text: string;
    });

export type Confidence = 'guessing' | 'unsure' | 'fairly_sure' | 'sure';
export type ReflectionStage = 'plan' | 'monitor' | 'evaluate';

export type Journal = readonly AttemptStep[];

/** Adds a step. A step whose id is already in the journal changes nothing. */
export function appendStep(journal: Journal, step: AttemptStep): Journal {
  return journal.some((s) => s.id === step.id) ? journal : [...journal, step];
}

export interface PartAssistance {
  readonly part: string;
  /** Answered at least once with no help before the last answer. */
  readonly independent: boolean;
  /** Each kind of help had before the last answer, in the order first had. */
  readonly kinds: readonly AssistanceKind[];
  /** The highest hint rung opened before the last answer; 0 when none. */
  readonly highestHintLevel: number;
  readonly tries: number;
  readonly askedForHelp: boolean;
  /** Help had only after the last answer, such as reviewing a worked example. */
  readonly helpAfterAnswer: boolean;
}

/**
 * What help each question had. Help counts toward an answer only when it came before the last
 * answer to that question; help looked at afterwards is review, not assistance.
 */
export function assistanceByPart(journal: Journal): ReadonlyMap<string, PartAssistance> {
  const lastAnswer = new Map<string, number>();
  journal.forEach((step, index) => {
    if (step.kind === 'answered') lastAnswer.set(step.part, index);
  });

  const out = new Map<string, PartAssistance>();
  const entry = (part: string): PartAssistance =>
    out.get(part) ?? {
      part,
      independent: false,
      kinds: [],
      highestHintLevel: 0,
      tries: 0,
      askedForHelp: false,
      helpAfterAnswer: false,
    };

  journal.forEach((step, index) => {
    if (!('part' in step)) return;
    const current = entry(step.part);
    const beforeLast = index < (lastAnswer.get(step.part) ?? Number.POSITIVE_INFINITY);
    switch (step.kind) {
      case 'answered':
        out.set(step.part, { ...current, tries: current.tries + 1 });
        return;
      case 'help_asked':
        out.set(step.part, { ...current, askedForHelp: true });
        return;
      case 'helped':
        if (!beforeLast) {
          out.set(step.part, { ...current, helpAfterAnswer: true });
          return;
        }
        out.set(step.part, {
          ...current,
          kinds: current.kinds.includes(step.assistance)
            ? current.kinds
            : [...current.kinds, step.assistance],
          highestHintLevel:
            step.assistance === 'hint'
              ? Math.max(current.highestHintLevel, step.level ?? 1)
              : current.highestHintLevel,
        });
        return;
      case 'retried':
      case 'confidence':
        out.set(step.part, current);
        return;
    }
  });

  for (const [part, value] of out) {
    out.set(part, { ...value, independent: value.tries > 0 && value.kinds.length === 0 });
  }
  return out;
}

const PROCTORING: Partial<Record<AttemptStep['kind'], ProctoringEvent['type']>> = {
  left_app: 'app-blur',
  returned: 'app-focus',
  time_up: 'timer-expired',
  retried: 'retry-attempted',
};

/** The marking inputs the journal implies, for `gradeQuiz`. */
export function gradeInputFromJournal(
  journal: Journal,
): Pick<GradeQuizInput, 'hintsUsed' | 'attemptsByField' | 'proctoringEvents' | 'timerExpired'> {
  const byPart = assistanceByPart(journal);
  const hintsUsed = [...byPart.values()].filter((p) => p.highestHintLevel > 0).map((p) => p.part);
  const attemptsByField = Object.fromEntries(
    [...byPart.values()].filter((p) => p.tries > 0).map((p) => [p.part, p.tries]),
  );
  const proctoringEvents: ProctoringEvent[] = [];
  for (const step of journal) {
    const type =
      step.kind === 'helped' && step.assistance === 'hint'
        ? 'hint-requested'
        : PROCTORING[step.kind];
    if (type === undefined) continue;
    proctoringEvents.push({
      type,
      timestamp: step.at,
      ...('part' in step ? { metadata: { part: step.part } } : {}),
    });
  }
  return {
    hintsUsed,
    attemptsByField,
    proctoringEvents,
    timerExpired: journal.some((s) => s.kind === 'time_up'),
  };
}
