import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileFloor } from '@/app/(sanctuary)/profile/ProfileFloor';
import { CommunityFeedFloor } from '@/app/(sanctuary)/community/CommunityFeedFloor';
import { LibraryFloor } from '@/app/(sanctuary)/library/LibraryFloor';
import type { CommunityGroupsResult } from '@/lib/community/groups-contract';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/community',
  useSearchParams: () => new URLSearchParams(),
}));

const mockCommunityResult: CommunityGroupsResult = {
  kind: 'ready',
  groups: [
    {
      id: 'general',
      name: 'General Sanctuary',
      description: 'Universal discussions and fellowship',
      memberCount: 42,
      role: 'member',
    },
    {
      id: 'practice',
      name: 'Practice Circle',
      description: 'Daily rhythm and mindfulness',
      memberCount: 15,
      role: 'member',
    },
  ],
  hasMore: false,
};

describe('Responsive Floors Master-Detail & Stage Switching (G1 boundary / jsdom)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('ProfileFloor responsive sections', () => {
    it('renders master-detail sections rail and switches stages interactively', async () => {
      const user = userEvent.setup();
      render(
        <ProfileFloor
          accountId="account-profile-test"
          displayName="Aria Star"
          primaryScopeRole="Learner"
        />,
      );

      // Verify header and initial identity section
      expect(screen.getByRole('heading', { level: 1, name: /your sanctuary persona/i })).toBeTruthy();
      expect(screen.getByText('Aria Star')).toBeTruthy();
      expect(screen.getByText('Learner')).toBeTruthy();

      // Check sections rail
      const rail = screen.getByRole('complementary', { name: /profile navigation rail/i });
      expect(rail).toBeTruthy();

      // Switch to Atmosphere & Motion
      const atmosphereTab = screen.getByRole('button', { name: /atmosphere & motion/i });
      await user.click(atmosphereTab);

      // Verify Atmosphere controls appear
      expect(screen.getByRole('heading', { level: 2, name: /workspace atmosphere/i })).toBeTruthy();
      const nightPreset = screen.getByRole('button', { name: /night/i });
      expect(nightPreset).toBeTruthy();
      await user.click(nightPreset);

      // Toggle motion
      const motionBtn = screen.getByRole('button', { name: /motion: (on|off)/i });
      expect(motionBtn).toBeTruthy();
      await user.click(motionBtn);

      // Switch to Security section
      const securityTab = screen.getByRole('button', { name: /security & data/i });
      await user.click(securityTab);
      expect(screen.getByRole('heading', { level: 2, name: /account safety & data/i })).toBeTruthy();
    });
  });

  describe('CommunityFeedFloor master-detail layout', () => {
    it('renders circles rail and switches active circle stage', async () => {
      const user = userEvent.setup();
      render(<CommunityFeedFloor mode="explore" result={mockCommunityResult} />);

      // Verify overview circle cards exist
      expect(screen.getByText('General Sanctuary')).toBeTruthy();
      expect(screen.getByText('Practice Circle')).toBeTruthy();

      // Enter master-detail stage by selecting the first circle
      const enterButtons = screen.getAllByRole('button', { name: /enter circle/i });
      expect(enterButtons.length).toBe(2);
      await user.click(enterButtons[0]!);

      // Verify circles rail exists in master-detail mode
      const rail = screen.getByRole('complementary', { name: /community circles/i });
      expect(rail).toBeTruthy();
      expect(screen.getByRole('button', { name: /all circles/i })).toBeTruthy();

      // Switch to Practice Circle via the rail button
      const practiceCircleRailItem = screen.getByRole('button', { name: 'Practice Circle' });
      await user.click(practiceCircleRailItem);

      // Verify active circle stage reflects the newly selected circle
      expect(screen.getByRole('heading', { level: 2, name: 'Practice Circle' })).toBeTruthy();
      expect(screen.getByText(/15 members · Shared circle/i)).toBeTruthy();

      // Return to overview using the back button
      const backButton = screen.getByRole('button', { name: /← back to circles/i });
      await user.click(backButton);

      // Verify return to initial circles overview
      expect(screen.getAllByRole('button', { name: /enter circle/i }).length).toBe(2);
    });
  });

  describe('LibraryFloor master-detail layout', () => {
    it('renders shelves rail and switches active shelf catalog', async () => {
      const user = userEvent.setup();
      render(<LibraryFloor accountId="test-account" displayName="Test User" />);

      // In initial overview mode, verify greeting and prompt
      expect(screen.getByRole('heading', { level: 1, name: /a place to find what helps you grow/i })).toBeTruthy();

      // Open catalog/master-detail stage
      const browseButton = screen.getByRole('button', { name: /browse resources/i });
      await user.click(browseButton);

      // Verify Library Collections rail exists
      const rail = screen.getByRole('complementary', { name: /library collections/i });
      expect(rail).toBeTruthy();
      expect(screen.getByRole('heading', { level: 4, name: /collections/i })).toBeTruthy();

      // Switch collection in the rail
      const curatedCollection = screen.getByRole('button', { name: 'Curated Collections' });
      await user.click(curatedCollection);

      // Verify stage heading for the catalog
      expect(screen.getByRole('heading', { level: 2, name: /resource catalog/i })).toBeTruthy();

      // Return to overview
      const overviewButton = screen.getByRole('button', { name: /← back to overview/i });
      await user.click(overviewButton);

      // Verify back to overview
      expect(screen.getByRole('button', { name: /browse resources/i })).toBeTruthy();
    });
  });
});
