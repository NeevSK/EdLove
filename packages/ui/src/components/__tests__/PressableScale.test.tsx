import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('../../utils/haptics', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('@repo/ui/hooks/useAccessibility', () => ({
  useAccessibility: jest.fn(() => ({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    announce: jest.fn(),
  })),
}));

import { PressableScale } from '../PressableScale';

describe('PressableScale', () => {
  it('renders children', async () => {
    const { getByText } = await render(
      <PressableScale accessibilityLabel="Test button">
        <Text>Press me</Text>
      </PressableScale>,
    );
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <PressableScale accessibilityLabel="Test button" onPress={onPress}>
        <Text>Press me</Text>
      </PressableScale>,
    );
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('sets accessibilityRole to button', async () => {
    const { getByRole } = await render(
      <PressableScale accessibilityLabel="Test button">
        <Text>Press me</Text>
      </PressableScale>,
    );
    expect(getByRole('button')).toBeTruthy();
  });

  it('applies disabled state', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <PressableScale accessibilityLabel="Test button" onPress={onPress} disabled>
        <Text>Press me</Text>
      </PressableScale>,
    );
    fireEvent.press(getByText('Press me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('accepts custom activeScale', async () => {
    const { getByText } = await render(
      <PressableScale accessibilityLabel="Test button" activeScale={0.9}>
        <Text>Press me</Text>
      </PressableScale>,
    );
    expect(getByText('Press me')).toBeTruthy();
  });
});
