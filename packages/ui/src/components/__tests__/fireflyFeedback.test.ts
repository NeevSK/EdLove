import { getFireflyFeedbackPresentation } from '../fireflyFeedback';

describe('firefly feedback resilience', () => {
  it('falls back to an actionable interruption for an unknown runtime state', () => {
    expect(getFireflyFeedbackPresentation('unexpected-state').pathState).toBe('interrupted');
    expect(getFireflyFeedbackPresentation('unexpected-state').accessibilityLabel).toContain(
      'paused',
    );
  });
});
