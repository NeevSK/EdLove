import { StorageKeys } from '@repo/core/lib/storage';
import { storage } from '@repo/core/logic/managers/StorageManager';
import { deriveReframeOutcome } from '@repo/core/logic/reflection';
import type {
  ReframeOutcome,
  ReframeStepId,
  ThoughtEmotion,
  ThoughtRecord,
} from '@repo/self/types';
import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const ThoughtEmotionEnum = z.enum([
  'happy',
  'relaxed',
  'calm',
  'focused',
  'anxious',
  'frustrated',
  'overwhelmed',
  'sad',
  'guilty',
  'angry',
]);

export const ReframeStepIdEnum = z.enum([
  'checkup',
  'thought',
  'feeling',
  'traps',
  'evidence',
  'reframe',
  'recheck',
]);

export const CognitiveReframeContextSchema = z.object({
  userId: z.string().default(''),
  preMood: z.number().int().min(1).max(5).default(3),
  preNote: z.string().default(''),
  automaticThought: z.string().default(''),
  emotion: ThoughtEmotionEnum.default('anxious'),
  intensity: z.number().int().min(1).max(10).default(6),
  trapIds: z.array(z.string()).default([]),
  customTrap: z.string().default(''),
  forThought: z.string().default(''),
  againstThought: z.string().default(''),
  reframedThought: z.string().default(''),
  postMood: z.number().int().min(1).max(5).default(3),
  scheduledHours: z.number().int().positive().default(24),
  error: z.string().nullable().default(null),
  isSaving: z.boolean().default(false),
  savedRecord: z.custom<ThoughtRecord | null>().default(null),
});

export type CognitiveReframeContext = z.infer<typeof CognitiveReframeContextSchema>;

export type CognitiveReframeEvents =
  | { type: 'SET_USER_ID'; userId: string }
  | { type: 'SET_PRE_MOOD'; mood: number }
  | { type: 'SET_PRE_NOTE'; note: string }
  | { type: 'SET_AUTOMATIC_THOUGHT'; text: string }
  | { type: 'SET_EMOTION'; emotion: ThoughtEmotion }
  | { type: 'SET_INTENSITY'; intensity: number }
  | { type: 'TOGGLE_TRAP'; trapId: string }
  | { type: 'SET_CUSTOM_TRAP'; text: string }
  | { type: 'SET_FOR_THOUGHT'; text: string }
  | { type: 'SET_AGAINST_THOUGHT'; text: string }
  | { type: 'SET_REFRAMED_THOUGHT'; text: string }
  | { type: 'SET_POST_MOOD'; mood: number }
  | { type: 'SET_SCHEDULED_HOURS'; hours: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'JUMP_TO_STEP'; step: ReframeStepId }
  | { type: 'START_SAVE' }
  | { type: 'SAVE_SUCCESS'; record: ThoughtRecord }
  | { type: 'SAVE_FAILURE'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_DRAFT'; draft: Partial<CognitiveReframeContext> }
  | { type: 'RESET' };

export const initialCognitiveReframeContext: CognitiveReframeContext = {
  userId: '',
  preMood: 3,
  preNote: '',
  automaticThought: '',
  emotion: 'anxious',
  intensity: 6,
  trapIds: [],
  customTrap: '',
  forThought: '',
  againstThought: '',
  reframedThought: '',
  postMood: 3,
  scheduledHours: 24,
  error: null,
  isSaving: false,
  savedRecord: null,
};

export const cognitiveReframeMachine = createMachine({
  id: 'cognitiveReframe',
  initial: 'checkup',
  schemas: {
    context: CognitiveReframeContextSchema,
    events: {
      SET_USER_ID: types<{ userId: string }>(),
      SET_PRE_MOOD: types<{ mood: number }>(),
      SET_PRE_NOTE: types<{ note: string }>(),
      SET_AUTOMATIC_THOUGHT: types<{ text: string }>(),
      SET_EMOTION: types<{ emotion: ThoughtEmotion }>(),
      SET_INTENSITY: types<{ intensity: number }>(),
      TOGGLE_TRAP: types<{ trapId: string }>(),
      SET_CUSTOM_TRAP: types<{ text: string }>(),
      SET_FOR_THOUGHT: types<{ text: string }>(),
      SET_AGAINST_THOUGHT: types<{ text: string }>(),
      SET_REFRAMED_THOUGHT: types<{ text: string }>(),
      SET_POST_MOOD: types<{ mood: number }>(),
      SET_SCHEDULED_HOURS: types<{ hours: number }>(),
      NEXT: types<void>(),
      PREV: types<void>(),
      JUMP_TO_STEP: types<{ step: ReframeStepId }>(),
      START_SAVE: types<void>(),
      SAVE_SUCCESS: types<{ record: ThoughtRecord }>(),
      SAVE_FAILURE: types<{ error: string }>(),
      CLEAR_ERROR: types<void>(),
      RESTORE_DRAFT: types<{ draft: Partial<CognitiveReframeContext> }>(),
      RESET: types<void>(),
    },
  },
  context: ({ input }: { input?: Partial<CognitiveReframeContext> }) => ({
    ...initialCognitiveReframeContext,
    ...input,
  }),
  states: {
    checkup: {
      on: {
        NEXT: {
          target: 'thought',
        },
      },
    },
    thought: {
      on: {
        NEXT: ({ context }) => {
          if (!context.automaticThought.trim()) {
            return {
              target: 'thought',
              context: { ...context, error: 'Please enter the thought that prompted this feeling.' },
            };
          }
          return {
            target: 'feeling',
            context: { ...context, error: null },
          };
        },
        PREV: {
          target: 'checkup',
        },
      },
    },
    feeling: {
      on: {
        NEXT: {
          target: 'traps',
        },
        PREV: {
          target: 'thought',
        },
      },
    },
    traps: {
      on: {
        NEXT: ({ context }) => {
          const hasTrap = context.trapIds.length > 0 || context.customTrap.trim().length > 0;
          if (!hasTrap) {
            return {
              target: 'traps',
              context: { ...context, error: 'Please select at least one thinking trap or enter a custom one.' },
            };
          }
          return {
            target: 'evidence',
            context: { ...context, error: null },
          };
        },
        PREV: {
          target: 'feeling',
        },
      },
    },
    evidence: {
      on: {
        NEXT: ({ context }) => {
          if (!context.forThought.trim() || !context.againstThought.trim()) {
            return {
              target: 'evidence',
              context: {
                ...context,
                error: 'Please provide both evidence supporting and evidence questioning the thought.',
              },
            };
          }
          return {
            target: 'reframe',
            context: { ...context, error: null },
          };
        },
        PREV: {
          target: 'traps',
        },
      },
    },
    reframe: {
      on: {
        NEXT: ({ context }) => {
          if (!context.reframedThought.trim()) {
            return {
              target: 'reframe',
              context: { ...context, error: 'Please write a balanced, compassionate reframe.' },
            };
          }
          return {
            target: 'recheck',
            context: { ...context, error: null },
          };
        },
        PREV: {
          target: 'evidence',
        },
      },
    },
    recheck: {
      on: {
        START_SAVE: {
          target: 'saving',
          context: ({ context }) => ({ ...context, isSaving: true, error: null }),
        },
        PREV: {
          target: 'reframe',
        },
      },
    },
    saving: {
      on: {
        SAVE_SUCCESS: ({ context, event }) => ({
          target: 'completed',
          context: {
            ...context,
            isSaving: false,
            savedRecord: event.record,
            error: null,
          },
        }),
        SAVE_FAILURE: ({ context, event }) => ({
          target: 'recheck',
          context: {
            ...context,
            isSaving: false,
            error: event.error,
          },
        }),
      },
    },
    completed: {
      on: {
        RESET: () => ({
          target: 'checkup',
          context: initialCognitiveReframeContext,
        }),
      },
    },
  },
  on: {
    SET_USER_ID: ({ context, event }) => ({
      target: undefined,
      context: { ...context, userId: event.userId },
    }),
    SET_PRE_MOOD: ({ context, event }) => ({
      target: undefined,
      context: { ...context, preMood: event.mood },
    }),
    SET_PRE_NOTE: ({ context, event }) => ({
      target: undefined,
      context: { ...context, preNote: event.note },
    }),
    SET_AUTOMATIC_THOUGHT: ({ context, event }) => ({
      target: undefined,
      context: { ...context, automaticThought: event.text, error: null },
    }),
    SET_EMOTION: ({ context, event }) => ({
      target: undefined,
      context: { ...context, emotion: event.emotion },
    }),
    SET_INTENSITY: ({ context, event }) => ({
      target: undefined,
      context: { ...context, intensity: event.intensity },
    }),
    TOGGLE_TRAP: ({ context, event }) => {
      const exists = context.trapIds.includes(event.trapId);
      const nextIds = exists
        ? context.trapIds.filter((id) => id !== event.trapId)
        : [...context.trapIds, event.trapId];
      return {
        target: undefined,
        context: { ...context, trapIds: nextIds, error: null },
      };
    },
    SET_CUSTOM_TRAP: ({ context, event }) => ({
      target: undefined,
      context: { ...context, customTrap: event.text, error: null },
    }),
    SET_FOR_THOUGHT: ({ context, event }) => ({
      target: undefined,
      context: { ...context, forThought: event.text, error: null },
    }),
    SET_AGAINST_THOUGHT: ({ context, event }) => ({
      target: undefined,
      context: { ...context, againstThought: event.text, error: null },
    }),
    SET_REFRAMED_THOUGHT: ({ context, event }) => ({
      target: undefined,
      context: { ...context, reframedThought: event.text, error: null },
    }),
    SET_POST_MOOD: ({ context, event }) => ({
      target: undefined,
      context: { ...context, postMood: event.mood },
    }),
    SET_SCHEDULED_HOURS: ({ context, event }) => ({
      target: undefined,
      context: { ...context, scheduledHours: event.hours },
    }),
    CLEAR_ERROR: ({ context }) => ({
      target: undefined,
      context: { ...context, error: null },
    }),
    RESTORE_DRAFT: ({ context, event }) => ({
      target: undefined,
      context: { ...context, ...event.draft },
    }),
    JUMP_TO_STEP: ({ context, event }) => ({
      target: `.${event.step}`,
      context,
    }),
    RESET: () => ({
      target: '.checkup',
      context: initialCognitiveReframeContext,
    }),
  },
});

export type CognitiveReframeMachine = typeof cognitiveReframeMachine;
export type CognitiveReframeActor = ReturnType<typeof createCognitiveReframeActor>;

/**
 * Creates and starts a CognitiveReframe actor.
 */
export function createCognitiveReframeActor(initial?: Partial<CognitiveReframeContext>) {
  const actor = createActor(cognitiveReframeMachine, {
    input: initial,
  });
  actor.start();
  return actor;
}

/**
 * Storage key generator for drafting thought records.
 */
export function getReframeSnapshotKey(userId: string | null | undefined): string {
  return `${StorageKeys.DRAFT_THOUGHT_RECORD ?? 'reframe:v6:draft'}:${userId || 'anonymous'}`;
}

/**
 * Saves current draft to StorageManager.
 */
export function saveReframeDraftSnapshot(
  actor: CognitiveReframeActor,
  userId?: string | null,
): void {
  try {
    const snapshot = actor.getSnapshot();
    if (snapshot.value === 'completed') return;
    const key = getReframeSnapshotKey(userId);
    storage.set(
      key,
      JSON.stringify({
        context: snapshot.context,
        step: snapshot.value,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // Graceful noop on storage failure
  }
}

/**
 * Restores draft from StorageManager.
 */
export function restoreReframeDraftSnapshot(
  actor: CognitiveReframeActor,
  userId?: string | null,
): boolean {
  try {
    const key = getReframeSnapshotKey(userId);
    const raw = storage.getString(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed?.context) {
      actor.send({ type: 'RESTORE_DRAFT', draft: parsed.context });
      if (parsed.step && parsed.step !== 'completed' && parsed.step !== 'saving') {
        actor.send({ type: 'JUMP_TO_STEP', step: parsed.step as ReframeStepId });
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Clears draft from StorageManager.
 */
export function clearReframeDraftSnapshot(userId?: string | null): void {
  try {
    const key = getReframeSnapshotKey(userId);
    storage.delete(key);
  } catch {
    // Graceful noop
  }
}

function newRecordId(): string {
  return `thought_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function addHours(hours: number): string {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

/**
 * Effect-TS v4 runner for creating and persisting a complete ThoughtRecord.
 */
export async function executeSaveThoughtRecordEffect(
  actor: CognitiveReframeActor,
  addFn: (record: ThoughtRecord) => Promise<ThoughtRecord>,
  onSuccessPurge?: () => void,
): Promise<{ success: boolean; record?: ThoughtRecord; error?: string }> {
  actor.send({ type: 'START_SAVE' });

  const ctx = actor.getSnapshot().context;

  const program = Effect.gen(function* () {
    const postOutcome: ReframeOutcome = deriveReframeOutcome(ctx.preMood, ctx.postMood);

    const record: ThoughtRecord = {
      id: newRecordId(),
      userId: ctx.userId || '',
      preMood: ctx.preMood,
      preNote: ctx.preNote.trim() || undefined,
      automaticThought: ctx.automaticThought.trim(),
      emotion: ctx.emotion,
      intensity: ctx.intensity,
      trapIds: ctx.trapIds,
      customTrap: ctx.customTrap.trim() || undefined,
      evidence: {
        forThought: ctx.forThought.trim(),
        againstThought: ctx.againstThought.trim(),
      },
      reframedThought: ctx.reframedThought.trim(),
      postMood: ctx.postMood,
      postOutcome,
      followUp: { dueAt: addHours(ctx.scheduledHours) },
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const saved = yield* Effect.tryPromise({
      try: () => addFn(record),
      catch: (err: unknown) => (err instanceof Error ? err.message : String(err)),
    });

    return saved;
  });

  const exit = await Effect.runPromiseExit(program);

  return Exit.match(exit, {
    onSuccess: (saved) => {
      actor.send({ type: 'SAVE_SUCCESS', record: saved });
      onSuccessPurge?.();
      return { success: true, record: saved };
    },
    onFailure: (cause) => {
      const errOption = Cause.findErrorOption(cause);
      const errorMessage =
        errOption._tag === 'Some' ? errOption.value : 'Failed to save thought record.';
      actor.send({ type: 'SAVE_FAILURE', error: errorMessage });
      return { success: false, error: errorMessage };
    },
  });
}
