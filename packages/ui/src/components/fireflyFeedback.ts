import type { MascotFeedbackState } from './mascotStateMachine';

export type FireflyFeedbackState = MascotFeedbackState;

export type FireflyFeedbackPresentation = {
  mascotMode: 'glowing' | 'resting' | 'offline';
  pathState: 'active' | 'quiet' | 'interrupted' | 'complete';
  accessibilityLabel: string;
};

const presentations: Record<FireflyFeedbackState, FireflyFeedbackPresentation> = {
  loading: {
    mascotMode: 'glowing',
    pathState: 'active',
    accessibilityLabel: 'Firefly guide is active while this loads',
  },
  empty: {
    mascotMode: 'resting',
    pathState: 'quiet',
    accessibilityLabel: 'Firefly guide marks an available next step',
  },
  offline: {
    mascotMode: 'offline',
    pathState: 'interrupted',
    accessibilityLabel: 'Firefly guide marks a paused connection',
  },
  error: {
    mascotMode: 'offline',
    pathState: 'interrupted',
    accessibilityLabel: 'Firefly guide marks a paused task',
  },
  success: {
    mascotMode: 'glowing',
    pathState: 'complete',
    accessibilityLabel: 'Firefly guide marks a completed step',
  },
};

export function getFireflyFeedbackPresentation(
  state: FireflyFeedbackState | string,
): FireflyFeedbackPresentation {
  return presentations[state as FireflyFeedbackState] ?? presentations.error;
}
