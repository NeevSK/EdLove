import { render, screen } from '@testing-library/react-native';
import { ShimmerBlock } from '../Skeleton';

const mockUseVisualCapabilities = vi.fn();
vi.mock('@repo/ui/context/VisualCapabilities', () => ({
  useVisualCapabilities: () => mockUseVisualCapabilities(),
}));

// The rendered tree carries the CSS animation keyframes only when the block animates.
const animated = () => JSON.stringify(screen.toJSON()).includes('animation');

describe("ShimmerBlock and verger's loading-shimmer lever", () => {
  it('animates at rest and holds still when the lever is lowered', async () => {
    mockUseVisualCapabilities.mockReturnValue({ allowShimmer: true });
    await render(<ShimmerBlock height={12} />);
    expect(animated()).toBe(true);
    mockUseVisualCapabilities.mockReturnValue({ allowShimmer: false });
    await render(<ShimmerBlock height={12} />);
    expect(animated()).toBe(false);
  });
});
