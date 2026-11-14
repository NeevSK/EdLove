import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';

const drawDistances: (number | undefined)[] = [];
const scrollHandlers: { onScrollBeginDrag?: (e: unknown) => void; onMomentumScrollEnd?: (e: unknown) => void }[] = [];
vi.mock('@shopify/flash-list', () => ({
  FlashList: (props: { drawDistance?: number; onScrollBeginDrag?: (e: unknown) => void; onMomentumScrollEnd?: (e: unknown) => void }) => {
    drawDistances.push(props.drawDistance);
    scrollHandlers.push(props);
    return null;
  },
}));
const mockUseVisualCapabilities = vi.fn();
vi.mock('../../context/VisualCapabilities', () => ({
  useVisualCapabilities: () => mockUseVisualCapabilities(),
}));

const { SovereignVirtualList } = await import('../SovereignVirtualList');

describe("SovereignVirtualList and verger's list-window lever", () => {
  const list = (drawDistance?: number) => (
    <SovereignVirtualList<{ id: string }>
      name="lever"
      data={[{ id: '1' }]}
      renderItem={({ item }) => <Text>{item.id}</Text>}
      drawDistance={drawDistance}
    />
  );

  it('passes the lever’s draw distance to FlashList; a caller’s own value wins', async () => {
    mockUseVisualCapabilities.mockReturnValue({ listDrawDistance: 125 });
    await render(list());
    expect(drawDistances.at(-1)).toBe(125);
    await render(list(400));
    expect(drawDistances.at(-1)).toBe(400);
    mockUseVisualCapabilities.mockReturnValue({ listDrawDistance: undefined });
    await render(list());
    expect(drawDistances.at(-1)).toBeUndefined();
  });

  it('tells verger a fling began and settled, after the caller’s own handler', async () => {
    const { createVerger, defineHost, UNKNOWN_CAPACITY } = await import('@repo/core/verger');
    const { bindVerger } = await import('@repo/verger-react');
    const verger = createVerger({
      host: defineHost({ name: 'scroll', levers: [] }),
      platform: () => ({ readCapacity: () => UNKNOWN_CAPACITY, memorySensing: false, createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }) }),
      requested: 'active',
      release: '1',
    });
    const dispatched: unknown[] = [];
    const dispatch = verger.dispatch;
    verger.dispatch = (event) => {
      dispatched.push(event);
      dispatch(event);
    };
    const unbind = bindVerger(verger);
    mockUseVisualCapabilities.mockReturnValue({ listDrawDistance: undefined });
    const order: string[] = [];
    await render(
      <SovereignVirtualList<{ id: string }>
        name="fling"
        data={[{ id: '1' }]}
        renderItem={({ item }) => <Text>{item.id}</Text>}
        onScrollBeginDrag={() => order.push('own')}
      />,
    );
    const handlers = scrollHandlers.at(-1);
    handlers?.onScrollBeginDrag?.({});
    handlers?.onMomentumScrollEnd?.({});
    expect(order).toEqual(['own']);
    expect(dispatched).toEqual([
      expect.objectContaining({ type: 'scroll', active: true }),
      expect.objectContaining({ type: 'scroll', active: false }),
    ]);
    unbind?.();
  });
});
