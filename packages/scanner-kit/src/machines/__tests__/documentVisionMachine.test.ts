import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearDocumentVisionDraft,
  createDocumentVisionActor,
  documentVisionMachine,
  executeDocumentVisionEffect,
  resolveDocumentVisionKey,
  restoreDocumentVisionDraft,
  saveDocumentVisionDraft,
} from '../documentVisionMachine';

vi.mock('@repo/core/lib/storage', () => {
  const store = new Map<string, string>();
  return {
    storage: {
      getStringAsync: vi.fn(async (key: string) => store.get(key) ?? null),
      setAsync: vi.fn(async (key: string, val: string) => store.set(key, val)),
      deleteAsync: vi.fn(async (key: string) => store.delete(key)),
      clearAllAsync: vi.fn(async () => store.clear()),
    },
    buildPartitionedKey: vi.fn(
      (opts: any) => `${opts.tenantId || 'global'}:${opts.userId || 'guest'}:${opts.entityId || 'root'}:${opts.feature}`,
    ),
  };
});

describe('documentVisionMachine (XState v6 + Effect v4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in idle and executes complete camera capture and review flow', () => {
    const actor = createDocumentVisionActor();
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');

    actor.send({ type: 'REQUEST_CAMERA' });
    expect(actor.getSnapshot().value).toBe('requesting_camera');

    actor.send({ type: 'PERMISSIONS_GRANTED' });
    expect(actor.getSnapshot().value).toBe('camera_ready');

    actor.send({ type: 'CAPTURE_IMAGE', uri: 'file:///photo.jpg' });
    expect(actor.getSnapshot().value).toBe('extracting');
    expect(actor.getSnapshot().context.imageUri).toBe('file:///photo.jpg');

    actor.send({
      type: 'EXTRACTION_SUCCESS',
      text: 'Grade 5 Attendance Register',
      students: [
        {
          name: 'Anura Kumara',
          index_number: '5001',
          confidence: 0.95,
          uncertain: false,
        },
      ],
      confidence: 0.95,
      detectedType: 'student_roster',
      documentTitle: 'Grade 5 Attendance Register',
      suggestedActions: ['import_students'],
    });

    expect(actor.getSnapshot().value).toBe('review_document');
    expect(actor.getSnapshot().context.detectedType).toBe('student_roster');
    expect(actor.getSnapshot().context.parsedStudents).toHaveLength(1);
    expect(actor.getSnapshot().context.suggestedActions).toContain('import_students');

    actor.send({ type: 'CONFIRM_DOCUMENT' });
    expect(actor.getSnapshot().value).toBe('confirmed');

    actor.stop();
  });

  it('transitions to error on extraction failure and allows retry', () => {
    const actor = createDocumentVisionActor();
    actor.start();

    actor.send({ type: 'SELECT_IMAGE', uri: 'file:///scan.jpg' });
    expect(actor.getSnapshot().value).toBe('extracting');

    actor.send({ type: 'EXTRACTION_FAILED', error: 'Network timeout' });
    expect(actor.getSnapshot().value).toBe('error');
    expect(actor.getSnapshot().context.error).toBe('Network timeout');

    actor.send({ type: 'RETRY' });
    expect(actor.getSnapshot().value).toBe('camera_ready');

    actor.stop();
  });

  it('handles permission rejection gracefully', () => {
    const actor = createDocumentVisionActor();
    actor.start();

    actor.send({ type: 'REQUEST_CAMERA' });
    actor.send({ type: 'PERMISSIONS_DENIED', reason: 'User denied camera access' });

    expect(actor.getSnapshot().value).toBe('permissions_rejected');
    expect(actor.getSnapshot().context.error).toBe('User denied camera access');

    actor.stop();
  });

  it('executes executeDocumentVisionEffect successfully with mock pipeline', async () => {
    const actor = createDocumentVisionActor();
    actor.start();

    actor.send({ type: 'SELECT_IMAGE', uri: 'file:///sample.jpg' });

    const mockPipeline = {
      recognize: vi.fn().mockResolvedValue({
        text: 'Classroom Roster',
        blocks: [],
        confidence: 0.92,
        students: [
          {
            name: 'Sunil Shantha',
            index_number: '101',
            notes: 'Present',
            confidence: 0.95,
            uncertain: false,
          },
        ],
        envelope: {
          classification: {
            detectedType: 'student_roster',
            confidence: 0.92,
            documentTitle: 'Grade 10 Roster',
          },
          suggestedActions: ['import_students'],
        },
      }),
    };

    await executeDocumentVisionEffect(actor, mockPipeline as any, 'file:///sample.jpg', 'student_roster');

    expect(actor.getSnapshot().value).toBe('review_document');
    expect(actor.getSnapshot().context.parsedStudents).toHaveLength(1);
    expect(actor.getSnapshot().context.detectedType).toBe('student_roster');

    actor.stop();
  });

  it('persists and restores partitioned document vision drafts', async () => {
    const key = resolveDocumentVisionKey({ userId: 'user-456', entityId: 'grade-5' });
    expect(key).toBe('global:user-456:grade-5:document_vision_draft');

    const draft = {
      imageUri: 'file:///draft.jpg',
      intentHint: 'student_roster',
      provider: 'sanctuary_vision',
      confidence: 0.88,
      rawText: 'Draft text',
      detectedType: 'student_roster',
      documentTitle: 'Draft Roster',
      parsedStudents: [],
      suggestedActions: ['import_students'],
      error: null,
    };

    await saveDocumentVisionDraft(key, draft);
    const restored = await restoreDocumentVisionDraft(key);
    expect(restored).not.toBeNull();
    expect(restored?.detectedType).toBe('student_roster');

    await clearDocumentVisionDraft(key);
    const cleared = await restoreDocumentVisionDraft(key);
    expect(cleared).toBeNull();
  });
});
