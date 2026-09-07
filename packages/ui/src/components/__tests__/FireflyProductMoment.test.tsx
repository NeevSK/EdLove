vi.mock('../FireflyFeedbackScene', () => ({
  FireflyFeedbackScene: ({ state }: { state: string }) => {
    const React = require('react');
    return React.createElement('FireflyFeedbackScene', { testID: `scene-${state}` });
  },
}));

import { fireEvent, render } from '@testing-library/react-native';
import { FireflyProductMoment } from '../FireflyProductMoment';

describe('FireflyProductMoment', () => {
  it.each(['coming-soon', 'pro', 'onboarding', 'explore'] as const)(
    'keeps %s as a meaningful, actionable product state',
    async (kind) => {
      const onAction = vi.fn();
      const onSecondaryAction = vi.fn();
      const { getByLabelText, getByText } = await render(
        <FireflyProductMoment
          actionLabel="Continue"
          kind={kind}
          message="A clear next step is waiting."
          onAction={onAction}
          onSecondaryAction={onSecondaryAction}
          secondaryActionLabel="Not now"
          title="A gentle next step"
          {...(kind === 'onboarding' ? { step: 2, totalSteps: 4 } : {})}
        />,
      );

      expect(getByText('A gentle next step')).toBeTruthy();
      await fireEvent.press(getByLabelText('Continue'));
      await fireEvent.press(getByLabelText('Not now'));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onSecondaryAction).toHaveBeenCalledTimes(1);
    },
  );

  it('exposes onboarding progress without making it part of the artwork', async () => {
    const { getByLabelText, getByText } = await render(
      <FireflyProductMoment
        kind="onboarding"
        message="Choose what you want to make space for."
        step={2}
        title="Begin where you are"
        totalSteps={4}
      />,
    );

    expect(getByText('2 of 4')).toBeTruthy();
    expect(getByLabelText('Onboarding step 2 of 4')).toBeTruthy();
  });
});
