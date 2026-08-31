import {
  FeedbackProvider,
  useSensoryPreferencesOptional,
  useVisualCapabilities,
} from '@repo/ui/context';
import { type FeedbackEvent, type SoundCue } from '@repo/ui/utils';
import { type AudioPlayer, type AudioSource, createAudioPlayer } from 'expo-audio';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';

export type SoundCueSources = Partial<Record<SoundCue, AudioSource>>;

interface SoundFeedbackContextValue {
  play: (cue: SoundCue) => void;
}

const SoundFeedbackContext = createContext<SoundFeedbackContextValue | undefined>(undefined);

function createSoundPlayer(sources: SoundCueSources, maxConcurrentSounds: number) {
  const players = new Set<AudioPlayer>();

  function play(cue: SoundCue) {
    const source = sources[cue];
    if (source === undefined || maxConcurrentSounds === 0) return;

    if (players.size >= maxConcurrentSounds) {
      const oldest = players.values().next().value;
      if (oldest) {
        oldest.remove();
        players.delete(oldest);
      }
    }

    try {
      const player = createAudioPlayer(source, {
        updateInterval: 250,
        keepAudioSessionActive: true,
      });
      players.add(player);
      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (!status.didJustFinish) return;
        subscription.remove();
        players.delete(player);
        player.remove();
      });
      player.play();
    } catch (error: unknown) {
      console.warn('[SoundFeedback] Playback unavailable; continuing silently', error);
    }
  }

  function dispose() {
    for (const player of players) player.remove();
    players.clear();
  }

  return { play, dispose };
}

export function SoundFeedbackProvider({
  children,
  sources = {},
}: {
  children: ReactNode;
  sources?: SoundCueSources;
}) {
  const { experience } = useVisualCapabilities();
  const { soundEnabled, quietMode } = useSensoryPreferencesOptional();
  const soundPlayer = useMemo(
    () => createSoundPlayer(sources, experience.maxConcurrentSounds),
    [sources, experience.maxConcurrentSounds],
  );

  useEffect(() => {
    return () => soundPlayer.dispose();
  }, [soundPlayer]);

  const play = useCallback(
    (cue: SoundCue) => {
      if (!soundEnabled || quietMode) return;
      soundPlayer.play(cue);
    },
    [quietMode, soundEnabled, soundPlayer],
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
  if (!context) throw new Error('useSoundFeedback must be used within a SoundFeedbackProvider');
  return context;
}

export type { FeedbackEvent };
