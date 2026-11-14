import { render, screen } from '@testing-library/react-native';
import { ShimmerBlock } from '../Skeleton';

const mockUseVisualCapabilities = vi.fn();
vi.mock('@repo/ui/context/VisualCapabilities', () => ({
  useVisualCapabilities: () => mockUseVisualCapabilities(),
}));

// The world's lamp shimmer is drawn only when the block animates.
const animated = () =>
  screen.queryByTestId('world-skeleton-shimmer', { includeHiddenElements: true }) !== null;
const RICH = { motion: 'rich' };

describe("ShimmerBlock and verger's loading-shimmer lever", () => {
  it('animates at rest and holds still when the lever is lowered', async () => {
    mockUseVisualCapabilities.mockReturnValue({ allowShimmer: true, experience: RICH });
    await render(<ShimmerBlock height={12} />);
    expect(animated()).toBe(true);
    mockUseVisualCapabilities.mockReturnValue({ allowShimmer: false, experience: RICH });
    await render(<ShimmerBlock height={12} />);
    expect(animated()).toBe(false);
  });
});
