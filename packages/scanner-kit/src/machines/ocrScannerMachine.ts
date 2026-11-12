import { buildPartitionedKey, storage } from '@repo/core/lib/storage.adapter';
import { type ParsedStudent, parseStudents } from '@repo/scanner-kit/ocr/parsers/StudentParser';
import type { OCRPipeline } from '@repo/scanner-kit/ocr/OCRPipeline';
import type { OCRProviderName } from '@repo/scanner-kit/ocr/types';
import { Cause, Effect, Exit } from 'effect';
import { type ActorRefFrom, createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const ParsedStudentRowSchema = z.object({
  name: z.string(),
  index_number: z.string(),
  notes: z.string().optional(),
  confidence: z.number(),
  uncertain: z.boolean(),
});

export const OCRScannerContextSchema = z.object({
  imageUri: z.string().nullable(),
  provider: z.enum(['mlkit', 'google_vision', 'openai_vision']),
  confidence: z.number().min(0).max(1),
  rawText: z.string(),
  parsedStudents: z.array(ParsedStudentRowSchema),
  error: z.string().nullable(),
  fallbackTriggered: z.boolean(),
});

export type OCRScannerContext = z.infer<typeof OCRScannerContextSchema>;

export const initialOCRScannerContext: OCRScannerContext = {
  imageUri: null,
  provider: 'mlkit',
  confidence: 0,
  rawText: '',
  parsedStudents: [],
  error: null,
  fallbackTriggered: false,
};

export const ocrScannerMachine = createMachine({
  id: 'ocrScanner',
  schemas: {
    context: OCRScannerContextSchema,
    events: {
      REQUEST_CAMERA: types<void>(),
      PERMISSIONS_GRANTED: types<void>(),
      PERMISSIONS_DENIED: types<{ reason: string }>(),
      CAPTURE_IMAGE: types<{ uri: string }>(),
      SELECT_IMAGE: types<{ uri: string }>(),
      PROCESSING_SUCCESS: types<{
        text: string;
        students: ParsedStudent[];
        confidence: number;
      }>(),
      PROCESSING_FAILED: types<{ error: string }>(),
      TRIGGER_FALLBACK_CLOUD: types<void>(),
      RETRY: types<void>(),
      CONFIRM_EXPORT: types<void>(),
    },
  },
  initial: 'idle',
  context: ({ input }: { input?: Partial<OCRScannerContext> }) => ({
    ...initialOCRScannerContext,
    ...input,
  }),
  states: {
    idle: {
      on: {
        REQUEST_CAMERA: ({ context }) => ({
          target: 'requesting_camera',
          context: {
            ...context,
            error: null,
          },
        }),
        SELECT_IMAGE: ({ event, context }) => ({
          target: 'processing_mlkit',
          context: {
            ...context,
            imageUri: event.uri,
            error: null,
          },
        }),
      },
    },
    requesting_camera: {
      on: {
        PERMISSIONS_GRANTED: () => ({
          target: 'camera_ready',
        }),
        PERMISSIONS_DENIED: ({ event, context }) => ({
          target: 'permissions_rejected',
          context: {
            ...context,
            error: event.reason,
          },
        }),
      },
    },
    camera_ready: {
      on: {
        CAPTURE_IMAGE: ({ event, context }) => ({
          target: 'processing_mlkit',
          context: {
            ...context,
            imageUri: event.uri,
            error: null,
          },
        }),
        RETRY: () => ({
          target: 'idle',
        }),
      },
    },
    processing_mlkit: {
      on: {
        PROCESSING_SUCCESS: ({ event, context }) => {
          // If overall confidence is low (< 0.60) and cloud fallback hasn't fired, trigger cloud
          const isLowConfidence = event.confidence < 0.6;
          if (isLowConfidence && !context.fallbackTriggered) {
            return {
              target: 'fallback_cloud',
              context: {
                ...context,
                rawText: event.text,
                parsedStudents: event.students,
                confidence: event.confidence,
                provider: 'google_vision' as const,
                fallbackTriggered: true,
              },
            };
          }
          return {
            target: 'review_roster',
            context: {
              ...context,
              rawText: event.text,
              parsedStudents: event.students,
              confidence: event.confidence,
            },
          };
        },
        PROCESSING_FAILED: ({ event, context }) => {
          if (!context.fallbackTriggered) {
            return {
              target: 'fallback_cloud',
              context: {
                ...context,
                provider: 'google_vision' as const,
                fallbackTriggered: true,
                error: event.error,
              },
            };
          }
          return {
            target: 'error',
            context: {
              ...context,
              error: event.error,
            },
          };
        },
        TRIGGER_FALLBACK_CLOUD: ({ context }) => ({
          target: 'fallback_cloud',
          context: {
            ...context,
            provider: 'google_vision' as const,
            fallbackTriggered: true,
          },
        }),
      },
    },
    fallback_cloud: {
      on: {
        PROCESSING_SUCCESS: ({ event, context }) => ({
          target: 'review_roster',
          context: {
            ...context,
            rawText: event.text,
            parsedStudents: event.students,
            confidence: event.confidence,
          },
        }),
        PROCESSING_FAILED: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.error,
          },
        }),
      },
    },
    review_roster: {
      on: {
        CONFIRM_EXPORT: () => ({
          target: 'exported',
        }),
        RETRY: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            imageUri: null,
            rawText: '',
            parsedStudents: [],
            error: null,
            fallbackTriggered: false,
          },
        }),
      },
    },
    exported: {
      type: 'final',
    },
    permissions_rejected: {
      on: {
        RETRY: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            error: null,
          },
        }),
        REQUEST_CAMERA: () => ({
          target: 'requesting_camera',
        }),
      },
    },
    error: {
      on: {
        RETRY: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            error: null,
            fallbackTriggered: false,
          },
        }),
      },
    },
  },
});

export type OCRScannerMachine = typeof ocrScannerMachine;
export type OCRScannerActor = ActorRefFrom<OCRScannerMachine>;

/**
 * Creates and starts an OCR Scanner actor instance.
 */
export function createOCRScannerActor(initialContext?: Partial<OCRScannerContext>): OCRScannerActor {
  const actor = createActor(ocrScannerMachine, { input: initialContext });
  actor.start();
  return actor;
}

/**
 * Effect-TS v4 pipeline runner for OCR Recognition.
 * Guaranteed double-ended actor liveness inspection to avoid ghost transitions.
 */
export function executeOCRRecognitionEffect(params: {
  uri: string;
  provider: OCRProviderName;
  pipeline: OCRPipeline;
  actor: OCRScannerActor;
}) {
  const { uri, provider, pipeline, actor } = params;

  // 1. Pre-flight liveness check
  if (actor.getSnapshot().status === 'stopped') {
    return Promise.resolve(Exit.void);
  }

  const program = Effect.gen(function* () {
    const rawResult = yield* Effect.tryPromise({
      try: () => pipeline.recognize(uri, { provider }),
      catch: (err) => (err instanceof Error ? err : new Error(String(err))),
    });

    if (!rawResult.text && rawResult.blocks.length === 0) {
      return yield* Effect.fail(new Error('No text detected in register image'));
    }

    const students = parseStudents(rawResult);
    if (students.length === 0) {
      return yield* Effect.fail(new Error('No student data could be parsed from register'));
    }

    const avgConfidence =
      students.reduce((acc, s) => acc + s.confidence, 0) / Math.max(1, students.length);

    return {
      text: rawResult.text,
      students,
      confidence: avgConfidence,
    };
  });

  return Effect.runPromiseExit(program).then((exit) => {
    // 2. Post-flight liveness check
    if (actor.getSnapshot().status === 'stopped') {
      return exit;
    }

    Exit.match(exit, {
      onFailure: (cause) => {
        const errOption = Cause.findErrorOption(cause);
        const errorMsg =
          errOption._tag === 'Some'
            ? errOption.value instanceof Error
              ? errOption.value.message
              : String(errOption.value)
            : 'OCR processing failed';
        actor.send({ type: 'PROCESSING_FAILED', error: errorMsg });
      },
      onSuccess: ({ text, students, confidence }) => {
        actor.send({
          type: 'PROCESSING_SUCCESS',
          text,
          students,
          confidence,
        });
      },
    });

    return exit;
  });
}

/**
 * Storage key resolver using partitioned standard.
 */
export function resolveOCRStorageKey(params: {
  tenantId?: string;
  userId?: string;
  entityId?: string;
}): string {
  return buildPartitionedKey({
    tenantId: params.tenantId,
    userId: params.userId,
    entityId: params.entityId,
    feature: 'ocr_roster_draft',
  });
}

/**
 * Saves draft parsed students snapshot to partitioned storage.
 */
export async function saveOCRDraftSnapshot(
  key: string,
  draft: { imageUri: string | null; students: ParsedStudent[] },
): Promise<void> {
  await storage.setAsync(key, JSON.stringify(draft));
}

/**
 * Restores draft parsed students from partitioned storage.
 */
export async function restoreOCRDraftSnapshot(
  key: string,
): Promise<{ imageUri: string | null; students: ParsedStudent[] } | null> {
  const raw = await storage.getStringAsync(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears draft parsed students from partitioned storage.
 */
export async function clearOCRDraftSnapshot(key: string): Promise<void> {
  await storage.deleteAsync(key);
}
