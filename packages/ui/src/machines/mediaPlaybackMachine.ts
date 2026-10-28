import { buildPartitionedKey, storage } from '@repo/core/lib/storage';
import { Effect, Exit } from 'effect';
import { type ActorRefFrom, createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const MediaPlaybackContextSchema = z.object({
  isPlaying: z.boolean(),
  positionMillis: z.number().nonnegative(),
  durationMillis: z.number().nonnegative(),
  showControls: z.boolean(),
  hasError: z.boolean(),
  errorMessage: z.string().nullable(),
  isBuffering: z.boolean(),
  volume: z.number().min(0).max(1),
  rate: z.number().min(0.25).max(3.0),
  mediaId: z.string().optional(),
});

export type MediaPlaybackContext = z.infer<typeof MediaPlaybackContextSchema>;

export const initialMediaPlaybackContext: MediaPlaybackContext = {
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  showControls: true,
  hasError: false,
  errorMessage: null,
  isBuffering: false,
  volume: 1.0,
  rate: 1.0,
};

export const mediaPlaybackMachine = createMachine({
  id: 'mediaPlayback',
  schemas: {
    context: MediaPlaybackContextSchema,
    events: {
      PLAY: types<void>(),
      PAUSE: types<void>(),
      TOGGLE_PLAY: types<void>(),
      BUFFER_START: types<void>(),
      BUFFER_END: types<void>(),
      PROGRESS_UPDATE: types<{ position: number; duration: number }>(),
      SEEK: types<{ positionMillis: number }>(),
      SEEK_COMPLETE: types<{ positionMillis: number }>(),
      SET_CONTROLS_VISIBLE: types<{ visible: boolean }>(),
      TOGGLE_CONTROLS: types<void>(),
      SET_RATE: types<{ rate: number }>(),
      SET_VOLUME: types<{ volume: number }>(),
      PLAYBACK_ENDED: types<void>(),
      PLAYBACK_ERROR: types<{ error: string }>(),
      RESET: types<void>(),
    },
  },
  initial: 'idle',
  context: ({ input }: { input?: Partial<MediaPlaybackContext> }) => ({
    ...initialMediaPlaybackContext,
    ...input,
  }),
  states: {
    idle: {
      on: {
        PLAY: ({ context }) => ({
          target: 'playing',
          context: {
            ...context,
            isPlaying: true,
            hasError: false,
            errorMessage: null,
          },
        }),
        PROGRESS_UPDATE: ({ event, context }) => ({
          target: 'idle',
          context: {
            ...context,
            positionMillis: event.position,
            durationMillis: event.duration,
          },
        }),
        SEEK: ({ event, context }) => ({
          target: 'seeking',
          context: {
            ...context,
            positionMillis: event.positionMillis,
          },
        }),
      },
    },
    playing: {
      on: {
        PAUSE: ({ context }) => ({
          target: 'paused',
          context: {
            ...context,
            isPlaying: false,
          },
        }),
        TOGGLE_PLAY: ({ context }) => ({
          target: 'paused',
          context: {
            ...context,
            isPlaying: false,
          },
        }),
        BUFFER_START: ({ context }) => ({
          target: 'buffering',
          context: {
            ...context,
            isBuffering: true,
          },
        }),
        PROGRESS_UPDATE: ({ event, context }) => ({
          target: 'playing',
          context: {
            ...context,
            positionMillis: event.position,
            durationMillis: event.duration,
          },
        }),
        SEEK: ({ event, context }) => ({
          target: 'seeking',
          context: {
            ...context,
            positionMillis: event.positionMillis,
          },
        }),
        PLAYBACK_ENDED: ({ context }) => ({
          target: 'ended',
          context: {
            ...context,
            isPlaying: false,
            positionMillis: context.durationMillis,
          },
        }),
        PLAYBACK_ERROR: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            isPlaying: false,
            hasError: true,
            errorMessage: event.error,
          },
        }),
        SET_CONTROLS_VISIBLE: ({ event, context }) => ({
          target: 'playing',
          context: {
            ...context,
            showControls: event.visible,
          },
        }),
        TOGGLE_CONTROLS: ({ context }) => ({
          target: 'playing',
          context: {
            ...context,
            showControls: !context.showControls,
          },
        }),
        SET_RATE: ({ event, context }) => ({
          target: 'playing',
          context: {
            ...context,
            rate: event.rate,
          },
        }),
        SET_VOLUME: ({ event, context }) => ({
          target: 'playing',
          context: {
            ...context,
            volume: event.volume,
          },
        }),
      },
    },
    paused: {
      on: {
        PLAY: ({ context }) => ({
          target: 'playing',
          context: {
            ...context,
            isPlaying: true,
          },
        }),
        TOGGLE_PLAY: ({ context }) => ({
          target: 'playing',
          context: {
            ...context,
            isPlaying: true,
          },
        }),
        PROGRESS_UPDATE: ({ event, context }) => ({
          target: 'paused',
          context: {
            ...context,
            positionMillis: event.position,
            durationMillis: event.duration,
          },
        }),
        SEEK: ({ event, context }) => ({
          target: 'seeking',
          context: {
            ...context,
            positionMillis: event.positionMillis,
          },
        }),
        PLAYBACK_ERROR: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            isPlaying: false,
            hasError: true,
            errorMessage: event.error,
          },
        }),
        SET_CONTROLS_VISIBLE: ({ event, context }) => ({
          target: 'paused',
          context: {
            ...context,
            showControls: event.visible,
          },
        }),
        TOGGLE_CONTROLS: ({ context }) => ({
          target: 'paused',
          context: {
            ...context,
            showControls: !context.showControls,
          },
        }),
      },
    },
    buffering: {
      on: {
        BUFFER_END: ({ context }) => ({
          target: context.isPlaying ? 'playing' : 'paused',
          context: {
            ...context,
            isBuffering: false,
          },
        }),
        PAUSE: ({ context }) => ({
          target: 'buffering',
          context: {
            ...context,
            isPlaying: false,
          },
        }),
        PLAYBACK_ERROR: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            isPlaying: false,
            isBuffering: false,
            hasError: true,
            errorMessage: event.error,
          },
        }),
      },
    },
    seeking: {
      on: {
        SEEK_COMPLETE: ({ event, context }) => ({
          target: context.isPlaying ? 'playing' : 'paused',
          context: {
            ...context,
            positionMillis: event.positionMillis,
          },
        }),
        PROGRESS_UPDATE: ({ event, context }) => ({
          target: 'seeking',
          context: {
            ...context,
            durationMillis: event.duration,
          },
        }),
        PLAYBACK_ERROR: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            hasError: true,
            errorMessage: event.error,
          },
        }),
      },
    },
    ended: {
      on: {
        PLAY: ({ context }) => ({
          target: 'playing',
          context: {
            ...context,
            isPlaying: true,
            positionMillis: 0,
          },
        }),
        SEEK: ({ event, context }) => ({
          target: 'seeking',
          context: {
            ...context,
            positionMillis: event.positionMillis,
          },
        }),
        RESET: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            isPlaying: false,
            positionMillis: 0,
            hasError: false,
            errorMessage: null,
          },
        }),
      },
    },
    error: {
      on: {
        RESET: ({ context }) => ({
          target: 'idle',
          context: {
            ...context,
            isPlaying: false,
            hasError: false,
            errorMessage: null,
          },
        }),
        PLAY: ({ context }) => ({
          target: 'playing',
          context: {
            ...context,
            isPlaying: true,
            hasError: false,
            errorMessage: null,
          },
        }),
      },
    },
  },
});

export type MediaPlaybackMachine = typeof mediaPlaybackMachine;
export type MediaPlaybackActor = ActorRefFrom<MediaPlaybackMachine>;

/**
 * Creates and starts a Media Playback Actor.
 */
export function createMediaPlaybackActor(
  initialContext?: Partial<MediaPlaybackContext>,
): MediaPlaybackActor {
  const actor = createActor(mediaPlaybackMachine, { input: initialContext });
  actor.start();
  return actor;
}

/**
 * Effect-TS v4 runner for position persistence.
 * Dispatches asynchronously with double-ended actor liveness guards.
 */
export function executePersistMediaPositionEffect(params: {
  userId?: string;
  mediaId: string;
  positionMillis: number;
  actor: MediaPlaybackActor;
}) {
  const { userId, mediaId, positionMillis, actor } = params;

  if (actor.getSnapshot().status === 'stopped') {
    return Promise.resolve(Exit.void);
  }

  const storageKey = resolveMediaPositionKey({ userId, mediaId });

  const program = Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () => storage.setAsync(storageKey, JSON.stringify({ positionMillis, savedAt: Date.now() })),
      catch: (err) => (err instanceof Error ? err : new Error(String(err))),
    });
    return positionMillis;
  });

  return Effect.runPromiseExit(program).then((exit) => {
    if (actor.getSnapshot().status === 'stopped') {
      return exit;
    }
    return exit;
  });
}

/**
 * Storage key resolver using partitioned standard.
 */
export function resolveMediaPositionKey(params: {
  userId?: string;
  mediaId: string;
}): string {
  return buildPartitionedKey({
    userId: params.userId,
    entityId: params.mediaId,
    feature: 'playback_progress',
  });
}

/**
 * Restores saved playback position from partitioned storage.
 */
export async function restoreMediaPosition(
  storageKey: string,
): Promise<{ positionMillis: number; savedAt: number } | null> {
  const raw = await storage.getStringAsync(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
