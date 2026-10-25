import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';

const drawDistances: (number | undefined)[] = [];
vi.mock('@shopify/flash-list', () => ({
  FlashList: ({ drawDistance }: { drawDistance?: number }) => {
    drawDistances.push(drawDistance);
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
});
