import { fireEvent, render } from '@testing-library/react-native';
import { styled } from 'nativewind';
import type { ComponentType } from 'react';
import { Pressable, type PressableProps, Text, View } from 'react-native';

// NativeWind v5 preview currently expands these generics beyond TypeScript's
// representable union size. Keep the expected error visible in this harness;
// do not copy this suppression into production component code.
const StyledBox = styled(View);
const StyledText = styled(Text);
// @ts-expect-error TS2590 is the result under test for the NativeWind v5 preview API.
styled(Pressable);

// Narrowing the component boundary avoids expanding Pressable's full
// conditional style/children union through react-native-css's DotNotation type.
const StyledPressable = styled(Pressable as ComponentType<PressableProps>);

describe('Tier-1 NativeWind v5 styled() experiment', () => {
  it('renders a styled View and preserves explicit style input', async () => {
    const explicitStyle = { opacity: 0.8 };
    const { getByTestId } = await render(
      <StyledBox
        testID="styled-box"
        className="items-center bg-phase-surface"
        style={explicitStyle}
      />,
    );

    const box = getByTestId('styled-box');
    expect(box).toBeTruthy();
    expect(box.props.style).toEqual(expect.objectContaining(explicitStyle));
  });

  it('renders a styled Text with className', async () => {
    const { getByText } = await render(
      <StyledText testID="styled-text" className="text-phase-text-primary text-lg">
        Styled tier 1
      </StyledText>,
    );

    expect(getByText('Styled tier 1')).toBeTruthy();
  });

  it('keeps Pressable interaction through styled()', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <StyledPressable testID="styled-pressable" className="rounded-lg" onPress={onPress} />,
    );

    fireEvent.press(getByTestId('styled-pressable'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
