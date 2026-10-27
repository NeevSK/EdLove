import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import type { FeedbackEvent, SoundCue } from '../utils/feedbackPolicy';
import { sensoryFeedback } from '../sensory/SensoryFeedbackService';

interface FeedbackContextValue {
  emit: (event: FeedbackEvent) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export function FeedbackProvider({
  children,
  playSound,
}: {
  children: ReactNode;
  playSound?: (cue: SoundCue) => void;
}) {
  useEffect(() => {
    if (playSound) return sensoryFeedback.registerNativeSoundPlayer(playSound);
  }, [playSound]);
  const emit = useCallback((event: FeedbackEvent) => sensoryFeedback.emit(event), []);
  const value = useMemo(() => ({ emit }), [emit]);

  return <FeedbackContext value={value}>{children}</FeedbackContext>;
}

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within a FeedbackProvider');
  return context;
}

export function useFeedbackOptional(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  const fallbackEmit = useCallback(() => undefined, []);
  return context ?? { emit: fallbackEmit };
}
