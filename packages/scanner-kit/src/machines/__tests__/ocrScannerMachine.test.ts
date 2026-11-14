import {
  clearOCRDraftSnapshot,
  createOCRScannerActor,
  executeOCRRecognitionEffect,
  ocrScannerMachine,
  resolveOCRStorageKey,
  restoreOCRDraftSnapshot,
  saveOCRDraftSnapshot,
} from '@repo/scanner-kit/machines/ocrScannerMachine';
import type { OCRPipeline } from '@repo/scanner-kit/ocr/OCRPipeline';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

vi.mock('@repo/core/lib/storage.adapter', () => {
  const store = new Map<string, string>();
  return {
    buildPartitionedKey: vi.fn(
      ({ tenantId, userId, entityId, feature }) =>
        `sanctuary:${tenantId || 'global'}:${userId || 'anon'}:${entityId || 'root'}:${feature}`,
    ),
    storage: {
      getStringAsync: vi.fn(async (key: string) => store.get(key) ?? null),
      setAsync: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      deleteAsync: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      clear: () => store.clear(),
    },
  };
});

describe('OCRScannerMachine v6 (XState v6 + Effect-TS v4)', () => {
  it('starts in idle with clean initial context', () => {
    const actor = createOCRScannerActor();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.imageUri).toBeNull();
    expect(snapshot.context.parsedStudents).toEqual([]);
    expect(snapshot.context.fallbackTriggered).toBe(false);
  });

  it('navigates camera permission flow to camera_ready', () => {
    const actor = createOCRScannerActor();
    actor.send({ type: 'REQUEST_CAMERA' });
    expect(actor.getSnapshot().value).toBe('requesting_camera');

    actor.send({ type: 'PERMISSIONS_GRANTED' });
    expect(actor.getSnapshot().value).toBe('camera_ready');
  });

  it('handles camera permission rejection and transitions to permissions_rejected', () => {
    const actor = createOCRScannerActor();
    actor.send({ type: 'REQUEST_CAMERA' });
    actor.send({ type: 'PERMISSIONS_DENIED', reason: 'Camera permission denied by user' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('permissions_rejected');
    expect(snapshot.context.error).toBe('Camera permission denied by user');
  });

  it('transitions to processing_mlkit on CAPTURE_IMAGE and reaches review_roster on high confidence', () => {
    const actor = createOCRScannerActor();
    actor.send({ type: 'REQUEST_CAMERA' });
    actor.send({ type: 'PERMISSIONS_GRANTED' });
    actor.send({ type: 'CAPTURE_IMAGE', uri: 'file:///data/photo.jpg' });

    expect(actor.getSnapshot().value).toBe('processing_mlkit');
    expect(actor.getSnapshot().context.imageUri).toBe('file:///data/photo.jpg');

    actor.send({
      type: 'PROCESSING_SUCCESS',
      text: '1. Kasun Perera\n2. Nimal Silva',
      students: [
        { name: 'Kasun Perera', index_number: '1', confidence: 0.95, uncertain: false },
        { name: 'Nimal Silva', index_number: '2', confidence: 0.92, uncertain: false },
      ],
      confidence: 0.935,
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('review_roster');
    expect(snapshot.context.parsedStudents).toHaveLength(2);
    expect(snapshot.context.fallbackTriggered).toBe(false);
  });

  it('triggers fallback_cloud when MLKit confidence is below threshold (< 0.60)', () => {
    const actor = createOCRScannerActor();
    actor.send({ type: 'SELECT_IMAGE', uri: 'file:///gallery/roster.png' });

    expect(actor.getSnapshot().value).toBe('processing_mlkit');

    actor.send({
      type: 'PROCESSING_SUCCESS',
      text: 'Smudged handwritten sinhala text',
      students: [{ name: 'Unknown', index_number: '1', confidence: 0.45, uncertain: true }],
      confidence: 0.45,
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('fallback_cloud');
    expect(snapshot.context.fallbackTriggered).toBe(true);
    expect(snapshot.context.provider).toBe('google_vision');

    // Cloud returns high confidence
    actor.send({
      type: 'PROCESSING_SUCCESS',
      text: 'කසුන් පෙරේරා',
      students: [{ name: 'කසුන් පෙරේරා', index_number: '1', confidence: 0.94, uncertain: false }],
      confidence: 0.94,
    });

    expect(actor.getSnapshot().value).toBe('review_roster');
  });

  it('completes the flow to exported terminal state on CONFIRM_EXPORT', () => {
    const actor = createOCRScannerActor();
    actor.send({ type: 'SELECT_IMAGE', uri: 'file:///test.jpg' });
    actor.send({
      type: 'PROCESSING_SUCCESS',
      text: 'Amara Fernando',
      students: [{ name: 'Amara Fernando', index_number: '1', confidence: 0.9, uncertain: false }],
      confidence: 0.9,
    });
    expect(actor.getSnapshot().value).toBe('review_roster');

    actor.send({ type: 'CONFIRM_EXPORT' });
    expect(actor.getSnapshot().value).toBe('exported');
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('aborts Effect runner execution when actor is stopped (Zero Ghost Dispatches)', async () => {
    const actor = createOCRScannerActor();
    (actor as any).stop?.();

    const mockPipeline: OCRPipeline = {
      recognize: vi.fn(),
    } as unknown as OCRPipeline;

    const result = await executeOCRRecognitionEffect({
      uri: 'file:///test.jpg',
      provider: 'mlkit',
      pipeline: mockPipeline,
      actor,
    });

    expect(mockPipeline.recognize).not.toHaveBeenCalled();
    expect(result._tag).toBe('Success');
  });

  it('persists and restores draft scan snapshots with partitioned key standard', async () => {
    const storageKey = resolveOCRStorageKey({
      tenantId: 'school-123',
      userId: 'teacher-456',
      entityId: 'class-789',
    });

    expect(storageKey).toBe('sanctuary:school-123:teacher-456:class-789:ocr_roster_draft');

    const draft = {
      imageUri: 'file:///roster.jpg',
      students: [{ name: 'Dilshan Silva', index_number: '1', confidence: 0.88, uncertain: false }],
    };

    await saveOCRDraftSnapshot(storageKey, draft);
    const restored = await restoreOCRDraftSnapshot(storageKey);

    expect(restored).toEqual(draft);

    await clearOCRDraftSnapshot(storageKey);
    const afterClear = await restoreOCRDraftSnapshot(storageKey);
    expect(afterClear).toBeNull();
  });
});
