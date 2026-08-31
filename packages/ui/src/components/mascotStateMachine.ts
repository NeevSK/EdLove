import type { MascotState } from './mascotTypes';

export type MascotFeedbackState = 'loading' | 'empty' | 'offline' | 'error' | 'success';

const stateForFeedback: Record<MascotFeedbackState, MascotState> = {
  loading: 'guiding',
  empty: 'curious',
  offline: 'resting',
  error: 'interrupted',
  success: 'complete',
};

const transitions: Record<MascotFeedbackState, readonly MascotFeedbackState[]> = {
  loading: ['success', 'error', 'offline'],
  empty: ['loading'],
  offline: ['loading'],
  error: ['loading'],
  success: ['loading'],
};

export function mascotStateForFeedback(state: MascotFeedbackState): MascotState {
  return stateForFeedback[state];
}

export function canTransitionMascotFeedback(
  from: MascotFeedbackState,
  to: MascotFeedbackState,
): boolean {
  return transitions[from].includes(to);
}

export function transitionMascotFeedback(
  from: MascotFeedbackState,
  to: MascotFeedbackState,
): MascotFeedbackState {
  return canTransitionMascotFeedback(from, to) ? to : from;
}
