import { render, screen } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';
import { describe, expect, it } from 'vitest';
import { useSharedValue, FadeIn } from 'react-native-reanimated';
import { Text } from '../Text/Text';
import { SharedTransitionBoundary } from '../Transition/SharedTransitionBoundary';
import { WorldScope } from '../../../theme/native/WorldContext';

describe('Reanimated 4.8.0 Capabilities & Invariants', () => {
  it('SharedTransitionBoundary renders children and exposes isActive contract', async () => {
    await render(
      <SharedTransitionBoundary isActive={true}>
        <RNText>Active Screen Content</RNText>
      </SharedTransitionBoundary>,
    );
    expect(screen.getByText('Active Screen Content')).toBeTruthy();
  });

  it('Text component allows SharedValue as direct children on Reanimated 4.8+', async () => {
    function LiveScoreComponent() {
      const count = useSharedValue(42);
      return (
        <WorldScope world="wewa">
          <Text>{count}</Text>
        </WorldScope>
      );
    }

    await render(<LiveScoreComponent />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('FadeIn animation builder supports withTargetValues layout overrides', () => {
    expect(typeof FadeIn.withTargetValues).toBe('function');
    const customFade = FadeIn.duration(400).withTargetValues({ opacity: 0.85 });
    expect(customFade).toBeTruthy();
  });
});
