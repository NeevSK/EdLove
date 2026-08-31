import { useVisualCapabilities } from './VisualCapabilities';
import {
  createFeedbackController,
  type FeedbackEvent,
  type SoundCue,
} from '../utils/feedbackPolicy';
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react';

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
  const { experience } = useVisualCapabilities();
  const emit = useMemo(
    () => createFeedbackController(experience, playSound).emit,
    [experience, playSound],
  );
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
