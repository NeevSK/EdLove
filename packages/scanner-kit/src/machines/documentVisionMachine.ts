import { buildPartitionedKey, storage } from '@repo/core/lib/storage.adapter';
import { type ParsedStudent, parseStudents } from '@repo/scanner-kit/ocr/parsers/StudentParser';
import type { OCRPipeline } from '@repo/scanner-kit/ocr/OCRPipeline';
import { defaultOCRPipeline } from '@repo/scanner-kit/ocr/OCRPipeline';
import { Cause, Effect, Exit } from 'effect';
import { createActor, createMachine, types } from 'xstate';
import { z } from 'zod';
import { ParsedStudentRowSchema } from './ocrScannerMachine';

export const DocumentVisionContextSchema = z.object({
  imageUri: z.string().nullable(),
  intentHint: z.string().optional(),
  provider: z.string().default('sanctuary_vision'),
  confidence: z.number().min(0).max(1),
  rawText: z.string(),
  detectedType: z.string().nullable(),
  documentTitle: z.string().nullable(),
  parsedStudents: z.array(ParsedStudentRowSchema),
  suggestedActions: z.array(z.string()),
  error: z.string().nullable(),
});

export type DocumentVisionContext = z.infer<typeof DocumentVisionContextSchema>;

export const initialDocumentVisionContext: DocumentVisionContext = {
  imageUri: null,
  intentHint: undefined,
  provider: 'sanctuary_vision',
  confidence: 0,
  rawText: '',
  detectedType: null,
  documentTitle: null,
  parsedStudents: [],
  suggestedActions: [],
  error: null,
};

export const documentVisionMachine = createMachine({
  id: 'documentVision',
  schemas: {
    context: DocumentVisionContextSchema,
    events: {
      REQUEST_CAMERA: types<void>(),
      PERMISSIONS_GRANTED: types<void>(),
      PERMISSIONS_DENIED: types<{ reason: string }>(),
      CAPTURE_IMAGE: types<{ uri: string }>(),
      SELECT_IMAGE: types<{ uri: string }>(),
      EXTRACTION_SUCCESS: types<{
        text: string;
        students: ParsedStudent[];
        confidence: number;
        detectedType?: string;
        documentTitle?: string;
        suggestedActions?: string[];
      }>(),
      EXTRACTION_FAILED: types<{ error: string }>(),
      RETRY: types<void>(),
      CONFIRM_DOCUMENT: types<void>(),
    },
  },
  initial: 'idle',
  context: ({ input }: { input?: Partial<DocumentVisionContext> }) => ({
    ...initialDocumentVisionContext,
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
          target: 'extracting',
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
          target: 'extracting',
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
    extracting: {
      on: {
        EXTRACTION_SUCCESS: ({ event, context }) => ({
          target: 'review_document',
          context: {
            ...context,
            rawText: event.text,
            parsedStudents: event.students,
            confidence: event.confidence,
            detectedType: event.detectedType ?? null,
            documentTitle: event.documentTitle ?? null,
            suggestedActions: event.suggestedActions ?? [],
          },
        }),
        EXTRACTION_FAILED: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.error,
          },
        }),
      },
    },
    review_document: {
      on: {
        CONFIRM_DOCUMENT: () => ({
          target: 'confirmed',
        }),
        RETRY: () => ({
          target: 'camera_ready',
        }),
      },
    },
    confirmed: {
      type: 'final',
    },
    permissions_rejected: {
      on: {
        RETRY: () => ({
          target: 'requesting_camera',
        }),
      },
    },
    error: {
      on: {
        RETRY: () => ({
          target: 'camera_ready',
        }),
      },
    },
  },
});

export function createDocumentVisionActor(input?: Partial<DocumentVisionContext>) {
  return createActor(documentVisionMachine, { input });
}

export type DocumentVisionActor = ReturnType<typeof createDocumentVisionActor>;

// Effect-TS v4 Multimodal Document Extraction Runner
export function executeDocumentVisionEffect(
  actor: DocumentVisionActor,
  pipeline: OCRPipeline = defaultOCRPipeline,
  imageUri: string,
  intentHint?: string,
) {
  const effect = Effect.gen(function* () {
    // 1. Initial liveness guard
    if (actor.getSnapshot().status === 'stopped') {
      return yield* Effect.void;
    }

    // 2. Multimodal extraction
    const ocrResult = yield* Effect.tryPromise({
      try: () => pipeline.recognize(imageUri, { intentHint }),
      catch: (err) => (err instanceof Error ? err : new Error(String(err))),
    });

    // 3. Structured parsing
    const students = parseStudents(ocrResult);
    const envelope = ocrResult.envelope as any;

    // 4. Double-ended liveness check
    if (actor.getSnapshot().status === 'stopped') {
      return yield* Effect.void;
    }

    actor.send({
      type: 'EXTRACTION_SUCCESS',
      text: ocrResult.text || envelope?.rawTranscription || '',
      students,
      confidence: ocrResult.confidence ?? envelope?.classification?.confidence ?? 0.9,
      detectedType: envelope?.classification?.detectedType,
      documentTitle: envelope?.classification?.documentTitle,
      suggestedActions: envelope?.suggestedActions,
    });
  });

  return Effect.runPromiseExit(effect).then((exit) => {
    if (Exit.isFailure(exit)) {
      if (actor.getSnapshot().status !== 'stopped') {
        const errorOption = Cause.findErrorOption(exit.cause);
        const errorMsg = errorOption._tag === 'Some' ? errorOption.value.message : 'Document extraction failed';
        actor.send({
          type: 'EXTRACTION_FAILED',
          error: errorMsg,
        });
      }
    }
  });
}

// Partitioned draft snapshot helpers
export function resolveDocumentVisionKey(params: {
  tenantId?: string;
  userId?: string;
  entityId?: string;
}): string {
  return buildPartitionedKey({
    tenantId: params.tenantId,
    userId: params.userId,
    entityId: params.entityId,
    feature: 'document_vision_draft',
  });
}

export async function saveDocumentVisionDraft(
  key: string,
  context: DocumentVisionContext,
): Promise<void> {
  await storage.setAsync(key, JSON.stringify(context));
}

export async function restoreDocumentVisionDraft(
  key: string,
): Promise<DocumentVisionContext | null> {
  const raw = await storage.getStringAsync(key);
  if (!raw) return null;
  try {
    return DocumentVisionContextSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function clearDocumentVisionDraft(key: string): Promise<void> {
  await storage.deleteAsync(key);
}
