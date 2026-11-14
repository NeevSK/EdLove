import {
  FeedbackProvider,
  useSensoryPreferencesOptional,
  useVisualCapabilities,
} from '@repo/ui/context';
import { type FeedbackEvent, type SoundCue } from '@repo/ui/utils';
import { type AudioPlayer, type AudioSource, createAudioPlayer } from 'expo-audio';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

export type SoundCueSources = Partial<Record<SoundCue, AudioSource>>;
const EMPTY_SOUND_SOURCES: SoundCueSources = {};

interface SoundFeedbackContextValue {
  play: (cue: SoundCue) => void;
}

const SoundFeedbackContext = createContext<SoundFeedbackContextValue | undefined>(undefined);

function createSoundPlayer(sources: SoundCueSources, maxConcurrentSounds: number) {
  const players = new Map<AudioPlayer, () => void>();

  function play(cue: SoundCue) {
    const source = sources[cue];
    if (source === undefined || maxConcurrentSounds === 0) {
      return;
    }

    if (players.size >= maxConcurrentSounds) {
      const oldest = players.values().next().value;
      if (oldest) {
        oldest();
      }
    }

    let release: (() => void) | undefined;
    try {
      const player = createAudioPlayer(source, {
        updateInterval: 250,
        keepAudioSessionActive: true,
      });
      let unsubscribe: (() => void) | undefined;
      release = () => {
        if (!players.delete(player)) return;
        try {
          unsubscribe?.();
        } finally {
          player.remove();
        }
      };
      const releasePlayer = release;
      players.set(player, releasePlayer);
      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (!status.didJustFinish) {
          return;
        }
        releasePlayer();
      });
      unsubscribe = () => subscription.remove();
      player.play();
    } catch (error: unknown) {
      release?.();
      console.warn('[SoundFeedback] Playback unavailable; continuing silently', error);
    }
  }

  function dispose() {
    for (const release of players.values()) {
      release();
    }
    players.clear();
  }

  return { play, dispose };
}

export function SoundFeedbackProvider({
  children,
  sources = EMPTY_SOUND_SOURCES,
}: {
  children: ReactNode;
  sources?: SoundCueSources;
}) {
  const { experience } = useVisualCapabilities();
  const { soundEnabled, quietMode } = useSensoryPreferencesOptional();
  const soundPlayerRef = useRef<ReturnType<typeof createSoundPlayer> | null>(null);

  useEffect(() => {
    const player = createSoundPlayer(sources, experience.maxConcurrentSounds);
    soundPlayerRef.current = player;
    return () => {
      if (soundPlayerRef.current === player) soundPlayerRef.current = null;
      player.dispose();
    };
  }, [sources, experience.maxConcurrentSounds]);

  const play = useCallback(
    (cue: SoundCue) => {
      if (!soundEnabled || quietMode) {
        return;
      }
      soundPlayerRef.current?.play(cue);
    },
    [quietMode, soundEnabled],
  );

  const value = useMemo(() => ({ play }), [play]);

  return (
    <SoundFeedbackContext value={value}>
      <FeedbackProvider playSound={play}>{children}</FeedbackProvider>
    </SoundFeedbackContext>
  );
}

export function useSoundFeedback(): SoundFeedbackContextValue {
  const context = useContext(SoundFeedbackContext);
  if (!context) {
    throw new Error('useSoundFeedback must be used within a SoundFeedbackProvider');
  }
  return context;
}

export type { FeedbackEvent };
