import { useCallback, useEffect, useRef } from 'react';
import { haptic } from '../../utils/haptics';
import { type FeedbackEvent, hapticFor } from '../feedback';
import { useShake } from './motion';
import { useWorld } from './WorldContext';

/**
 * Feel an event in the active world's character (see `theme/feedback.ts`).
 * Haptics follow the person's haptics setting; visual motion is separate
 * (`usePressMotion`, `useShake`) and follows the world's motion level.
 */
export function useFeedback(): (event: FeedbackEvent) => void {
  const character = useWorld().definition.motion.haptic;
  return useCallback((event: FeedbackEvent) => haptic(hapticFor(event, character)), [character]);
}

/**
 * When an error appears (not while it stays), feel it and shake the field once.
 * Returns the animated style for the element that should shake.
 */
export function useErrorFeedback(error: string | undefined) {
  const feedback = useFeedback();
  const { style, shake } = useShake();
  const previous = useRef(error);
  useEffect(() => {
    if (error && !previous.current) {
      feedback('error');
      shake();
    }
    previous.current = error;
  }, [error, feedback, shake]);
  return style;
}
