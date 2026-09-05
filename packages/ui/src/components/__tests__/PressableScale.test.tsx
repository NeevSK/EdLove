import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('../../utils/haptics', () => ({
  hapticImpact: jest.fn(),
}));

jest.mock('@repo/ui/hooks/useAccessibility', () => ({
  useAccessibility: jest.fn(() => ({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    announce: jest.fn(),
  })),
}));

import { hapticImpact } from '../../utils/haptics';
import { PressableScale } from '../PressableScale';

const mockedHapticImpact = hapticImpact as jest.MockedFunction<typeof hapticImpact>;

beforeEach(() => {
  mockedHapticImpact.mockClear();
});

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

  it('uses the requested haptic impact on press in', async () => {
    const { getByRole } = await render(
      <PressableScale accessibilityLabel="Test button" haptic="medium">
        <Text>Press me</Text>
      </PressableScale>,
    );

    fireEvent(getByRole('button'), 'pressIn');

    expect(mockedHapticImpact).toHaveBeenCalledWith('medium');
  });

  it('allows haptics to be disabled', async () => {
    const { getByRole } = await render(
      <PressableScale accessibilityLabel="Test button" haptic={false}>
        <Text>Press me</Text>
      </PressableScale>,
    );

    fireEvent(getByRole('button'), 'pressIn');

    expect(mockedHapticImpact).not.toHaveBeenCalled();
  });
});
