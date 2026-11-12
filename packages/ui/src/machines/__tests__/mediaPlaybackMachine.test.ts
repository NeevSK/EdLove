import {
  createMediaPlaybackActor,
  executePersistMediaPositionEffect,
  mediaPlaybackMachine,
  resolveMediaPositionKey,
  restoreMediaPosition,
} from '@repo/ui/machines/mediaPlaybackMachine';
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

describe('MediaPlaybackMachine v6 (XState v6 + Effect-TS v4)', () => {
  it('starts in idle with controls visible and playback stopped', () => {
    const actor = createMediaPlaybackActor();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.isPlaying).toBe(false);
    expect(snapshot.context.showControls).toBe(true);
    expect(snapshot.context.positionMillis).toBe(0);
    expect(snapshot.context.rate).toBe(1.0);
  });

  it('transitions to playing on PLAY and updates progress', () => {
    const actor = createMediaPlaybackActor();
    actor.send({ type: 'PLAY' });

    expect(actor.getSnapshot().value).toBe('playing');
    expect(actor.getSnapshot().context.isPlaying).toBe(true);

    actor.send({ type: 'PROGRESS_UPDATE', position: 5400, duration: 60000 });
    expect(actor.getSnapshot().context.positionMillis).toBe(5400);
    expect(actor.getSnapshot().context.durationMillis).toBe(60000);
  });

  it('toggles between playing and paused', () => {
    const actor = createMediaPlaybackActor();
    actor.send({ type: 'PLAY' });
    expect(actor.getSnapshot().value).toBe('playing');

    actor.send({ type: 'TOGGLE_PLAY' });
    expect(actor.getSnapshot().value).toBe('paused');
    expect(actor.getSnapshot().context.isPlaying).toBe(false);

    actor.send({ type: 'TOGGLE_PLAY' });
    expect(actor.getSnapshot().value).toBe('playing');
    expect(actor.getSnapshot().context.isPlaying).toBe(true);
  });

  it('manages buffering lifecycle and returns to previous playing state', () => {
    const actor = createMediaPlaybackActor();
    actor.send({ type: 'PLAY' });
    expect(actor.getSnapshot().value).toBe('playing');

    actor.send({ type: 'BUFFER_START' });
    expect(actor.getSnapshot().value).toBe('buffering');
    expect(actor.getSnapshot().context.isBuffering).toBe(true);

    actor.send({ type: 'BUFFER_END' });
    expect(actor.getSnapshot().value).toBe('playing');
    expect(actor.getSnapshot().context.isBuffering).toBe(false);
  });

  it('manages seeking and seek completion', () => {
    const actor = createMediaPlaybackActor();
    actor.send({ type: 'PLAY' });
    actor.send({ type: 'SEEK', positionMillis: 15000 });

    expect(actor.getSnapshot().value).toBe('seeking');
    expect(actor.getSnapshot().context.positionMillis).toBe(15000);

    actor.send({ type: 'SEEK_COMPLETE', positionMillis: 15000 });
    expect(actor.getSnapshot().value).toBe('playing');
  });

  it('handles playback end and restarts on PLAY from 0', () => {
    const actor = createMediaPlaybackActor();
    actor.send({ type: 'PLAY' });
    actor.send({ type: 'PROGRESS_UPDATE', position: 30000, duration: 30000 });
    actor.send({ type: 'PLAYBACK_ENDED' });

    expect(actor.getSnapshot().value).toBe('ended');
    expect(actor.getSnapshot().context.isPlaying).toBe(false);

    actor.send({ type: 'PLAY' });
    expect(actor.getSnapshot().value).toBe('playing');
    expect(actor.getSnapshot().context.positionMillis).toBe(0);
  });

  it('transitions to error on PLAYBACK_ERROR and recovers on RESET', () => {
    const actor = createMediaPlaybackActor();
    actor.send({ type: 'PLAY' });
    actor.send({ type: 'PLAYBACK_ERROR', error: 'Network timeout loading video chunk' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('error');
    expect(snapshot.context.hasError).toBe(true);
    expect(snapshot.context.errorMessage).toBe('Network timeout loading video chunk');

    actor.send({ type: 'RESET' });
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.hasError).toBe(false);
    expect(actor.getSnapshot().context.errorMessage).toBeNull();
  });

  it('guards against ghost dispatches in executePersistMediaPositionEffect', async () => {
    const actor = createMediaPlaybackActor();
    (actor as any).stop?.();

    const result = await executePersistMediaPositionEffect({
      userId: 'user-456',
      mediaId: 'video-789',
      positionMillis: 12000,
      actor,
    });

    expect(result._tag).toBe('Success');
  });

  it('persists and restores media playback progress with partitioned key standard', async () => {
    const storageKey = resolveMediaPositionKey({
      userId: 'learner-999',
      mediaId: 'lesson-biology-1',
    });

    expect(storageKey).toBe('sanctuary:global:learner-999:lesson-biology-1:playback_progress');

    const actor = createMediaPlaybackActor();
    await executePersistMediaPositionEffect({
      userId: 'learner-999',
      mediaId: 'lesson-biology-1',
      positionMillis: 42500,
      actor,
    });

    const restored = await restoreMediaPosition(storageKey);
    expect(restored).not.toBeNull();
    expect(restored?.positionMillis).toBe(42500);
  });
});
