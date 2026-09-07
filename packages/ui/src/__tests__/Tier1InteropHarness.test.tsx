import { fireEvent, render } from '@testing-library/react-native';
import { Box } from '../components/ui/box';
import { Pressable } from '../components/ui/pressable';
import { Text } from '../components/ui/text';

describe('Tier-1 facade contract harness', () => {
  it('keeps Box explicit style channels and does not leak className to native props', async () => {
    const explicitStyle = { opacity: 0.8 };
    const { getByTestId } = await render(
      <Box
        testID="tier1-box"
        className="items-center bg-phase-surface"
        sx={{ padding: 12 }}
        style={explicitStyle}
      />,
    );

    const box = getByTestId('tier1-box');
    expect(box.props.style).toEqual([{ padding: 12 }, explicitStyle]);
    // styled() consumes className for the styling engine. Its absence here is
    // expected and is not evidence that the runtime style was applied.
    expect(box.props.className).toBeUndefined();
  });

  it('keeps Text content and facade props while styling remains a runtime concern', async () => {
    const { getByText } = await render(
      <Text testID="tier1-text" className="text-center" size="lg">
        Tier 1
      </Text>,
    );

    const text = getByText('Tier 1');
    expect(text.props.children).toBe('Tier 1');
    expect(text.props.className).toBeUndefined();
  });

  it('keeps Pressable interaction and state props while styling consumes className', async () => {
    const onPress = vi.fn();
    const { getByTestId } = await render(
      <Pressable
        testID="tier1-pressable"
        accessibilityRole="button"
        className="rounded-lg bg-phase-primary"
        onPress={onPress}
      />,
    );

    const pressable = getByTestId('tier1-pressable');
    expect(pressable.props.className).toBeUndefined();
    expect(pressable.props.accessibilityRole).toBe('button');

    fireEvent.press(pressable);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
