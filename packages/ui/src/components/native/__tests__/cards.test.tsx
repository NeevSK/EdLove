import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { KitIconProps } from '../../../theme/contracts';
import { WorldScope } from '../../../theme/native';
import { resolveWorld } from '../../../theme/resolve';
import { WORLD_IDS } from '../../../theme/worlds';
import { columnsFor, gridMin, iconSize, WIDE_CARD_STACKS_BELOW } from '../../../tokens/sizes';
import { gapFor } from '../../../tokens/space';
import { haptic } from '../../../utils/haptics';
import { Card } from '../Card/Card';
import { Carousel } from '../Carousel/Carousel';
import { Icon } from '../Icon/Icon';
import { Grid } from '../Layout/Grid';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));

// The test engine's FlashList cannot measure or scroll; this stand-in renders
// every item and accepts scrollToIndex, so paging logic is what is tested.
vi.mock('@shopify/flash-list', async () => {
  const { useImperativeHandle } = await import('react');
  const { View: Host } = await import('react-native');
  type Props = {
    data: readonly unknown[];
    keyExtractor: (item: unknown) => string;
    renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
    ref?: React.Ref<{ scrollToIndex: () => Promise<void> }>;
  };
  function FlashList({ data, keyExtractor, renderItem, ref }: Props) {
    useImperativeHandle(ref, () => ({ scrollToIndex: async () => undefined }));
    return (
      <Host>
        {data.map((item, index) => (
          <Host key={keyExtractor(item)}>{renderItem({ item, index })}</Host>
        ))}
      </Host>
    );
  }
  return { FlashList };
});
beforeEach(() => vi.mocked(haptic).mockClear());

const flat = (style: unknown) => StyleSheet.flatten(style as never) ?? {};

function Glyph({ size, color }: KitIconProps) {
  return <View testID="glyph" style={{ width: size, height: size, backgroundColor: color }} />;
}

const layout = (width: number) => ({ nativeEvent: { layout: { width, height: 100, x: 0, y: 0 } } });

describe('sizes', { tags: ['unit'] }, () => {
  it('a grid adds a column only when another fits', () => {
    expect(columnsFor(0, 200, 12)).toBe(1);
    expect(columnsFor(399, 200, 12)).toBe(1);
    expect(columnsFor(412, 200, 12)).toBe(2);
    expect(columnsFor(2000, 140, 12, 4)).toBe(4);
  });
});

describe('Icon', { tags: ['a11y', 'unit'] }, () => {
  it('is hidden unless it has a label, and takes its tone from the world', async () => {
    const t = resolveWorld('wewa', 'morning', 'light').tokens;
    await render(
      <WorldScope world="wewa" phase="morning" mode="light">
        <Icon icon={Glyph} tone="lamp" size="lg" />
        <Icon icon={Glyph} label="Offline" />
      </WorldScope>,
    );
    expect(screen.getByRole('img', { name: 'Offline' })).toBeTruthy();
    expect(screen.queryAllByRole('img')).toHaveLength(1);
    const [first] = screen.getAllByTestId('glyph', { includeHiddenElements: true });
    expect(flat(first?.props.style)).toMatchObject({
      width: iconSize.lg,
      backgroundColor: t.lampDeep,
    });
  });
});

describe('Grid', { tags: ['unit'] }, () => {
  it('lays out as many equal columns as its own width allows', async () => {
    await render(
      <Grid testID="g" min="md">
        <View testID="a" />
        <View testID="b" />
        <View testID="c" />
      </Grid>,
    );
    await act(() => screen.getByTestId('g').props.onLayout(layout(640)));
    const g = gapFor('between');
    const cols = columnsFor(640, gridMin.md, g);
    const cell = screen.getByTestId('a').parent;
    expect(flat(cell?.props.style).width).toBeCloseTo((640 - g * (cols - 1)) / cols);
    await act(() => screen.getByTestId('g').props.onLayout(layout(300)));
    expect(flat(screen.getByTestId('a').parent?.props.style).width).toBe(300);
  });
});

describe('Card', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('a pressable card is a named button with its meta as the hint, and presses like one', async () => {
    const onPress = vi.fn();
    await render(<Card title="Fractions" meta="Grade 6, 12 slides" onPress={onPress} selected />);
    const card = screen.getByRole('button', { name: 'Fractions' });
    expect(card.props.accessibilityHint).toBe('Grade 6, 12 slides');
    expect(card.props.accessibilityState).toMatchObject({ selected: true, disabled: false });
    await fireEvent(card, 'pressIn');
    expect(haptic).toHaveBeenCalled();
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('a disabled card does not fire', async () => {
    const onPress = vi.fn();
    await render(<Card title="Locked" disabled onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Locked' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('a card without onPress is not a button', async () => {
    await render(<Card title="Note" meta="Today" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Note')).toBeTruthy();
  });

  it('a pill is fully round in every world and shows no meta', async () => {
    for (const id of WORLD_IDS) {
      const { unmount } = await render(
        <WorldScope world={id} phase="morning" mode="light">
          <Card shape="pill" title="Maths" meta="hidden" icon={Glyph} onPress={() => {}} />
        </WorldScope>,
      );
      expect(flat(screen.getByRole('button', { name: 'Maths' }).props.style).borderRadius).toBe(
        999,
      );
      expect(screen.queryByText('hidden')).toBeNull();
      await unmount();
    }
  });

  it('a wide card puts media beside the words, and stacks it above when narrow', async () => {
    await render(
      <Card
        shape="wide"
        title="Leaves"
        media={<View testID="m" />}
        onPress={() => {}}
        testID="w"
      />,
    );
    const host = screen.getByRole('button', { name: 'Leaves' }).parent;
    await act(() => host?.props.onLayout(layout(WIDE_CARD_STACKS_BELOW + 40)));
    const besideBox = flat(screen.getByTestId('m').parent?.props.style);
    expect(besideBox.width).toBe(88);
    await act(() => host?.props.onLayout(layout(WIDE_CARD_STACKS_BELOW - 40)));
    expect(flat(screen.getByTestId('m').parent?.props.style).aspectRatio).toBeCloseTo(4 / 3);
  });
});

describe('Carousel', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('pages with buttons, announces the position, and stops at the ends', async () => {
    const onPageChange = vi.fn();
    await render(
      <Carousel
        label="Today"
        items={['a', 'b', 'c']}
        keyOf={(x) => x}
        renderItem={(x) => <View testID={`p-${x}`} />}
        onPageChange={onPageChange}
      />,
    );
    const previous = screen.getByRole('button', { name: 'Previous' });
    expect(previous.props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.getByText('1 of 3').props.accessibilityLiveRegion).toBe('polite');
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('3 of 3')).toBeTruthy();
    expect(onPageChange.mock.calls).toEqual([[1], [2]]);
    expect(screen.getByRole('button', { name: 'Next' }).props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });
});
