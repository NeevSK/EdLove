import {
  canTransitionMascotFeedback,
  mascotStateForFeedback,
  transitionMascotFeedback,
} from '../mascotStateMachine';

describe('mascot feedback state machine', () => {
  it.each([
    ['loading', 'guiding'],
    ['empty', 'curious'],
    ['offline', 'resting'],
    ['error', 'interrupted'],
    ['success', 'complete'],
  ] as const)('maps %s to %s', (feedback, expected) => {
    expect(mascotStateForFeedback(feedback)).toBe(expected);
  });

  it.each([
    ['loading', 'success'],
    ['loading', 'error'],
    ['loading', 'offline'],
    ['empty', 'loading'],
    ['offline', 'loading'],
    ['error', 'loading'],
    ['success', 'loading'],
  ] as const)('allows %s → %s', (from, to) => {
    expect(canTransitionMascotFeedback(from, to)).toBe(true);
    expect(transitionMascotFeedback(from, to)).toBe(to);
  });

  it.each([
    ['empty', 'success'],
    ['empty', 'error'],
    ['offline', 'success'],
    ['error', 'success'],
    ['success', 'error'],
  ] as const)('rejects impossible %s → %s', (from, to) => {
    expect(canTransitionMascotFeedback(from, to)).toBe(false);
    expect(transitionMascotFeedback(from, to)).toBe(from);
  });
});
