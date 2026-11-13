import { useCallback, useEffect, useRef } from 'react';
import { sensoryFeedback } from '../../sensory/SensoryFeedbackService';
import type { FeedbackEvent } from '../feedback';
import { useShake } from './motion';
import { useWorld } from './WorldContext';

/**
 * Feel an event in the active world's character (see `theme/feedback.ts`).
 * Goes through the one feedback engine, so the person's vibration, sound and
 * quiet-hours switches and verger's level apply to every kit component. Visual
 * motion is separate (`usePressMotion`, `useShake`) and follows the world's
 * motion level.
 */
export function useFeedback(): (event: FeedbackEvent) => void {
  const character = useWorld().definition.motion.haptic;
  return useCallback(
    (event: FeedbackEvent) => {
      sensoryFeedback.configure({ character });
      sensoryFeedback.emit(event);
    },
    [character],
  );
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
