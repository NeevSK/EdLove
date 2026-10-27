const mockCaps = vi.fn();
vi.mock('../../context/VisualCapabilities', () => ({
  useVisualCapabilities: () => mockCaps(),
}));

import { render, screen } from '@testing-library/react-native';
import { WorldLoading, WorldSkeleton } from '../native/Waiting';
import { SIGNS, WaitingSign } from '../native/WaitingSign';
import { WorldScope } from '../native/WorldContext';
import { resolveWorld } from '../resolve';
import { WORLD_IDS } from '../worlds';

const caps = (motion: string, allowShimmer = true) => ({ allowShimmer, experience: { motion } });
const hidden = { includeHiddenElements: true };

describe('world states', () => {
  beforeEach(() => mockCaps.mockReturnValue(caps('rich')));

  it.each(WORLD_IDS)('%s draws its own waiting sign', async (id) => {
    await render(
      <WorldScope world={id}>
        <WaitingSign />
      </WorldScope>,
    );
    expect(screen.getByTestId(`waiting-sign-${SIGNS[id]}`, hidden)).toBeTruthy();
  });

  it('gives every world a different sign', () => {
    expect(new Set(Object.values(SIGNS)).size).toBe(WORLD_IDS.length);
  });

  it('says what is loading, aloud and on screen', async () => {
    await render(<WorldLoading label="Loading lessons" />);
    expect(screen.getByLabelText('Loading lessons')).toBeTruthy();
    expect(screen.getByText('Loading lessons')).toBeTruthy();
  });

  it('keeps the words for screen readers when they are hidden', async () => {
    await render(<WorldLoading label="Loading lessons" quiet />);
    expect(screen.getByLabelText('Loading lessons')).toBeTruthy();
    expect(screen.queryByText('Loading lessons')).toBeNull();
  });

  it('holds the skeleton still when verger lowers the shimmer or stops motion', async () => {
    await render(<WorldSkeleton height={12} />);
    expect(screen.queryByTestId('world-skeleton-shimmer', hidden)).not.toBeNull();
    mockCaps.mockReturnValue(caps('rich', false));
    await render(<WorldSkeleton height={12} />);
    expect(screen.queryByTestId('world-skeleton-shimmer', hidden)).toBeNull();
    mockCaps.mockReturnValue(caps('off'));
    await render(<WorldSkeleton height={12} />);
    expect(screen.queryByTestId('world-skeleton-shimmer', hidden)).toBeNull();
  });

  it('draws the skeleton in the world sunken colour', async () => {
    await render(
      <WorldScope world="spark" mode="dark">
        <WorldSkeleton height={12} />
      </WorldScope>,
    );
    expect(JSON.stringify(screen.toJSON())).toContain(
      resolveWorld('spark', 'morning', 'dark').tokens.sunken,
    );
  });
});
