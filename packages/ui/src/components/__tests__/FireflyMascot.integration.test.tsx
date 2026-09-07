import { act, fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { FireflyMascot } from '../FireflyMascot';
import type { MascotArtworkSource } from '../Mascot';

const mockUseVisualCapabilities = vi.fn();

vi.mock('@repo/core/monitoring', () => ({
  __esModule: true,
  trackEvent: vi.fn(),
}));
vi.mock('@repo/ui/context/VisualCapabilities', () => ({
  useVisualCapabilities: () => mockUseVisualCapabilities(),
}));
vi.mock('expo-image', () => {
  const React = require('react');
  return {
    Image: React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
      React.createElement('Image', { ...props, ref, testID: props.testID ?? 'expo-image' }),
    ),
  };
});
vi.mock('react-native-svg', () => {
  const React = require('react');
  const Svg = (props: Record<string, unknown>) => React.createElement('Svg', props);
  const Shape = (props: Record<string, unknown>) => React.createElement('Shape', props);
  const Image = (props: Record<string, unknown>) =>
    React.createElement('Image', { ...props, testID: props.testID ?? 'expo-image' });
  return {
    __esModule: true,
    default: Svg,
    Image,
    Circle: Shape,
    Defs: Shape,
    Ellipse: Shape,
    LinearGradient: Shape,
    Path: Shape,
    RadialGradient: Shape,
    Stop: Shape,
  };
});

const fullCapabilities = {
  deviceTier: 'high' as const,
  effectiveFidelity: 'high' as const,
  quality: 'full' as const,
  allowAmbientEffects: true,
  allowBlur: true,
  allowRichAnimation: true,
  allowSubtleAnimation: true,
  imageCachePolicy: 'memory-disk' as const,
  imageDecodeFormat: 'argb' as const,
  shouldPrefetchAssets: true,
  maxCelebrationParticles: 200,
};

const artwork: MascotArtworkSource = {
  source: 101,
  accessibilityLabel: 'Firefly guide welcoming the learner',
};

const mockTrackEvent = vi.mocked((await import('@repo/core/monitoring')).trackEvent);

describe('FireflyMascot integration boundary', () => {
  beforeEach(() => {
    mockUseVisualCapabilities.mockReturnValue(fullCapabilities);
    mockTrackEvent.mockClear();
  });

  it('passes resolved delivery policy to expo-image', async () => {
    const { getByTestId } = await render(
      <FireflyMascot artwork={artwork} state="guiding" size={96} />,
    );
    const image = getByTestId('expo-image');

    expect(image.props.cachePolicy).toBe('memory-disk');
    expect(image.props.decodeFormat).toBe(Platform.OS === 'android' ? 'argb' : undefined);
    expect(image.props.allowDownscaling).toBe(true);
    expect(image.props.accessibilityLabel).toBe(artwork.accessibilityLabel);
  });

  it('renders the procedural fallback and records the failure when decoding fails', async () => {
    const { getByTestId, queryByTestId } = await render(
      <FireflyMascot artwork={artwork} state="interrupted" size={96} />,
    );

    await act(async () => {
      fireEvent(getByTestId('expo-image'), 'error');
    });

    expect(queryByTestId('expo-image')).toBeNull();
    expect(getByTestId('firefly-mascot-svg-fallback')).toBeTruthy();
    expect(mockTrackEvent).toHaveBeenCalledWith('mascot_asset_decode_failed', {
      mascot_id: 'firefly',
      state: 'interrupted',
    });
  });

  it('recovers from a failed source when the artwork source changes', async () => {
    const { getByTestId, queryByTestId, rerender } = await render(
      <FireflyMascot artwork={artwork} state="guiding" size={96} />,
    );
    await act(async () => {
      fireEvent(getByTestId('expo-image'), 'error');
    });

    await act(async () => {
      rerender(<FireflyMascot artwork={{ ...artwork, source: 202 }} state="guiding" size={96} />);
    });

    expect(queryByTestId('firefly-mascot-svg-fallback')).toBeNull();
    expect(getByTestId('expo-image').props.source).toBe(202);
  });

  it('keeps the SVG fallback free of the ambient halo when capabilities reduce effects', async () => {
    mockUseVisualCapabilities.mockReturnValue({
      ...fullCapabilities,
      allowAmbientEffects: false,
      allowBlur: false,
      allowRichAnimation: false,
    });

    const { getByTestId, queryByTestId } = await render(
      <FireflyMascot state="resting" size={96} />,
    );
    expect(getByTestId('firefly-mascot-svg-fallback')).toBeTruthy();
    expect(queryByTestId('firefly-mascot-halo')).toBeNull();
  });
});
