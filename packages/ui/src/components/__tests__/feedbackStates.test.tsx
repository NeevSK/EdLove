vi.mock('@repo/core/monitoring', () => ({
  __esModule: true,
  trackEvent: vi.fn(),
}));
vi.mock('@repo/ui/context/VisualCapabilities', () => ({
  useVisualCapabilities: () => ({
    deviceTier: 'medium',
    effectiveFidelity: 'high',
    quality: 'full',
    allowAmbientEffects: true,
    allowBlur: true,
    allowRichAnimation: true,
    allowSubtleAnimation: true,
    imageCachePolicy: 'memory-disk',
    imageDecodeFormat: 'argb',
    shouldPrefetchAssets: true,
    maxCelebrationParticles: 200,
  }),
}));
vi.mock('expo-image', () => {
  const React = require('react');
  return { Image: (props: Record<string, unknown>) => React.createElement('Image', props) };
});
vi.mock('react-native-svg', () => {
  const React = require('react');
  const Shape = (props: Record<string, unknown>) => React.createElement('Shape', props);
  return {
    __esModule: true,
    default: Shape,
    Circle: Shape,
    Defs: Shape,
    Ellipse: Shape,
    LinearGradient: Shape,
    Path: Shape,
    RadialGradient: Shape,
    Stop: Shape,
    Line: Shape,
  };
});

import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BrandedEmptyState } from '../BrandedEmptyState';
import { ErrorState } from '../ErrorState';
import { FireflyFeedbackScene } from '../FireflyFeedbackScene';

describe('branded feedback states', () => {
  it('keeps an error actionable and identifies it as an interruption', async () => {
    const { getByText, getByTestId } = await render(
      <ErrorState title="Library unavailable" message="Reconnect, then try again.">
        <Text>Try again</Text>
      </ErrorState>,
    );

    expect(getByText('Library unavailable')).toBeTruthy();
    expect(getByText('Try again')).toBeTruthy();
    expect(getByTestId('firefly-feedback-firefly-error')).toBeTruthy();
  });

  it('keeps an empty state an invitation rather than an error', async () => {
    const { getByText, getByTestId, queryByText } = await render(
      <BrandedEmptyState title="No reflections yet" message="Start with today's question.">
        <Text>Start a reflection</Text>
      </BrandedEmptyState>,
    );

    expect(getByText('A CLEAR PLACE TO BEGIN')).toBeTruthy();
    expect(getByText('Start a reflection')).toBeTruthy();
    expect(getByTestId('firefly-feedback-firefly-empty')).toBeTruthy();
    expect(queryByText('Library unavailable')).toBeNull();
  });

  it('does not turn an animated empty state into a loading state', async () => {
    const { getByTestId } = await render(<BrandedEmptyState subtle title="No reflections yet" />);

    expect(getByTestId('firefly-feedback-firefly-empty')).toBeTruthy();
  });

  it.each(['loading', 'empty', 'offline', 'error', 'success'] as const)(
    'renders the semantic scene for %s',
    async (state) => {
      const { getByTestId } = await render(<FireflyFeedbackScene state={state} />);
      expect(getByTestId(`firefly-feedback-firefly-${state}`).props.accessibilityLabel).toEqual(
        expect.any(String),
      );
    },
  );
});
