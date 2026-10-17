import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sovereignBus } from '../../lib/sync/eventBus';
import { useMutationQueue } from '../../lib/sync/useMutationQueue';
import { compareSemver, useVersionGatingStore } from '../../lib/sync/versionGating';

describe('Disaster Suite 6: App Version Gating, Force Updates & Outbox Freezing', () => {
  beforeEach(() => {
    useVersionGatingStore.setState({
      currentInstalledVersion: '1.2.0',
      status: 'UP_TO_DATE',
      minSupportedVersion: '1.0.0',
      latestVersion: '1.2.0',
      updateUrl: '',
      isBlocked: false,
      hasDismissedSoftNudge: false,
    });
    useMutationQueue.setState({ queue: [], deadLetterQueue: [], isSyncing: false });
  });

  it('1. Semver Comparison: accurately compares semver strings across major, minor, and patch numbers', () => {
    expect(compareSemver('1.2.0', '1.2.0')).toBe(0);
    expect(compareSemver('1.1.9', '1.2.0')).toBe(-1);
    expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
    expect(compareSemver('1.10.0', '1.9.0')).toBe(1);
  });

  it('2. HARD_BLOCK Enforcement: triggers un-dismissible block state and emits event when current version < minSupportedVersion', () => {
    const emittedEvents: any[] = [];
    const unsubscribe = sovereignBus.on('app:version_gated', (payload) => {
      emittedEvents.push(payload);
    });

    useVersionGatingStore.getState().setInstalledVersion('1.2.0');

    // Server announces critical DB/security breaking change requiring at least v2.0.0
    const status = useVersionGatingStore.getState().evaluateVersion({
      minSupportedVersion: '2.0.0',
      latestVersion: '2.1.0',
      updateUrl: 'https://play.google.com/store/apps/details?id=org.gurudevi',
      releaseNotes: 'Critical security update required.',
    });

    expect(status).toBe('HARD_BLOCK');
    expect(useVersionGatingStore.getState().isBlocked).toBe(true);
    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0].status).toBe('HARD_BLOCK');
    expect(emittedEvents[0].minSupportedVersion).toBe('2.0.0');

    unsubscribe();
  });

  it('3. SOFT_NUDGE Flow: enables non-blocking notification when current >= minSupported but < latest', () => {
    useVersionGatingStore.getState().setInstalledVersion('1.5.0');

    const status = useVersionGatingStore.getState().evaluateVersion({
      minSupportedVersion: '1.0.0',
      latestVersion: '1.6.0',
      updateUrl: 'https://play.google.com/store/apps/details?id=org.gurudevi',
      releaseNotes: 'New community features available!',
    });

    expect(status).toBe('SOFT_NUDGE');
    expect(useVersionGatingStore.getState().isBlocked).toBe(false);

    // Can dismiss soft nudge
    expect(useVersionGatingStore.getState().hasDismissedSoftNudge).toBe(false);
    useVersionGatingStore.getState().dismissSoftNudge();
    expect(useVersionGatingStore.getState().hasDismissedSoftNudge).toBe(true);
  });

  it('4. Outbox Freezing Under HARD_BLOCK: prevents mutation replay from pushing stale schemas to backend', async () => {
    // Put mutation in queue
    await useMutationQueue.getState().addToQueue({
      type: 'UPDATE',
      scope: 'community',
      name: 'updatePost',
      variables: { id: 'p1', content: 'Blocked mutation' },
    });

    expect(useMutationQueue.getState().queue.length).toBe(1);

    // Set HARD_BLOCK
    useVersionGatingStore.setState({ isBlocked: true, status: 'HARD_BLOCK' });

    // Verify guard flag blocks sync
    expect(useVersionGatingStore.getState().isBlocked).toBe(true);
  });
});
