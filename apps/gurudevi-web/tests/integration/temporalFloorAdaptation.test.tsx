import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SelfOverview } from '../../app/(sanctuary)/self/components/SelfOverview';
import { MoodLotusModal } from '../../app/(sanctuary)/self/components/MoodLotusModal';
import { resolveSelfFeatureManifest } from '@repo/self/features/catalog';
import { BROWSER_SELF_FEATURES } from '../../app/(sanctuary)/self/browserFeatureRegistry';

const TEST_USER = {
  userId: 'learner',
  capabilities: ['read:SelfReflection', 'read:InnerPulse'],
  capacities: ['student'],
  citizenshipLevel: 3,
  roles: ['student' as const],
};

const TEST_MANIFEST = resolveSelfFeatureManifest(
  TEST_USER,
  { customOrder: [], hiddenIds: [], selectedIds: [] },
  'browser',
  { deliveredFeatureIds: Object.keys(BROWSER_SELF_FEATURES) },
);

describe('Temporal Floor Adaptation (G1)', () => {
  const groupOrder = ['wellbeing', 'practice', 'growth', 'identity', 'professional'] as const;
  const pinnedFeatures = [TEST_MANIFEST.all.find((f) => f.id === 'fire_journal')!];

  describe('SelfOverview dynamic temporal posture', () => {
    it('renders Live Practice posture for Today', () => {
      render(
        <SelfOverview
          displayName="Naveen"
          groupOrder={groupOrder}
          manifestAll={TEST_MANIFEST.all}
          onOpenFeature={vi.fn()}
          onOpenFireJournal={vi.fn()}
          pinnedFeatures={pinnedFeatures}
          temporalIntent="current"
          selectedDate="2026-10-18"
        />,
      );

      expect(screen.getByText('Self · Overview')).toBeDefined();
      expect(screen.getByText('A place to notice what is asking for your care.')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Open Fire Journal' })).toBeDefined();
      expect(screen.getAllByText('Open practice').length).toBeGreaterThan(0);
    });

    it('renders Archival Record posture for past date', () => {
      render(
        <SelfOverview
          displayName="Naveen"
          groupOrder={groupOrder}
          manifestAll={TEST_MANIFEST.all}
          onOpenFeature={vi.fn()}
          onOpenFireJournal={vi.fn()}
          pinnedFeatures={pinnedFeatures}
          temporalIntent="review"
          selectedDate="2026-10-15"
        />,
      );

      expect(screen.getByText('Self · Archival Horizon')).toBeDefined();
      expect(screen.getByText(/Reflections from Thursday, October 15, 2026/)).toBeDefined();
      expect(screen.getByRole('button', { name: 'Review Fire Journal' })).toBeDefined();
      expect(screen.getAllByText('Review practice').length).toBeGreaterThan(0);
    });

    it('renders Future Horizon posture for future date', () => {
      render(
        <SelfOverview
          displayName="Naveen"
          groupOrder={groupOrder}
          manifestAll={TEST_MANIFEST.all}
          onOpenFeature={vi.fn()}
          onOpenFireJournal={vi.fn()}
          pinnedFeatures={pinnedFeatures}
          temporalIntent="plan"
          selectedDate="2026-10-25"
        />,
      );

      expect(screen.getByText('Self · Future Horizon')).toBeDefined();
      expect(screen.getByText(/Looking toward Sunday, October 25, 2026/)).toBeDefined();
      expect(screen.getByRole('button', { name: 'Prepare Fire Journal' })).toBeDefined();
      expect(screen.getAllByText('Plan ahead').length).toBeGreaterThan(0);
    });
  });

  describe('MoodLotusModal dynamic temporal posture', () => {
    it('renders live check-in form when in current mode', () => {
      render(
        <MoodLotusModal
          onClose={vi.fn()}
          temporalIntent="current"
          selectedDate="2026-10-18"
        />,
      );

      expect(screen.getByText('How are you arriving?')).toBeDefined();
      expect(screen.getByText('Choose what feels closest')).toBeDefined();
    });

    it('renders archival view with notice when in review mode on past date', async () => {
      render(
        <MoodLotusModal
          onClose={vi.fn()}
          temporalIntent="review"
          selectedDate="2026-10-15"
        />,
      );

      expect(screen.getByText('Mood on 2026-10-15')).toBeDefined();
      expect(screen.getByText('No mood was recorded on 2026-10-15')).toBeDefined();
      expect(screen.getByRole('button', { name: '+ Add retroactive note' })).toBeDefined();

      // Clicking retroactive note unlocks composition
      fireEvent.click(screen.getByRole('button', { name: '+ Add retroactive note' }));
      expect(screen.getByText('What was your state on 2026-10-15?')).toBeDefined();
    });

    it('renders holding space intention view when in plan mode on future date', () => {
      render(
        <MoodLotusModal
          onClose={vi.fn()}
          temporalIntent="plan"
          selectedDate="2026-10-25"
        />,
      );

      expect(screen.getByText('Horizon for 2026-10-25')).toBeDefined();
      expect(screen.getByText('Holding space for 2026-10-25')).toBeDefined();
      expect(screen.getByRole('button', { name: /Practice Breath Resonance/i })).toBeDefined();
    });
  });
});
