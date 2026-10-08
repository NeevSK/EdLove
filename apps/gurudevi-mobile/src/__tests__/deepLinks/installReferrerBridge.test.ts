import { pendingIntentStore } from '@repo/core/logic/deeplink/pendingIntentStore';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-application', () => ({
  getInstallReferrerAsync: vi.fn(),
}));

vi.mock('expo-clipboard', () => ({
  hasStringAsync: vi.fn(),
  getStringAsync: vi.fn(),
  setStringAsync: vi.fn(),
}));

import { resolveDeferredInstallIntent } from '@/lib/deepLinks/installReferrerBridge';

describe('installReferrerBridge (G1 Native Cold-Start Deferred Bridge)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pendingIntentStore.getState().clearPendingIntent();
  });

  it('captures Android Google Play Install Referrer and seeds pendingIntentStore', async () => {
    Platform.OS = 'android';
    vi.mocked(Application.getInstallReferrerAsync).mockResolvedValue(
      'utm_source=invite&inviteCode=TEACHER42&utm_campaign=fall26',
    );

    const handled = await resolveDeferredInstallIntent();

    expect(handled).toBe(true);
    const pending = pendingIntentStore.getState().getPendingIntent();
    expect(pending).not.toBeNull();
    expect(pending?.intentKind).toBe('classroomInvite');
    expect(pending?.params.inviteCode).toBe('TEACHER42');
    expect(pending?.targetPath).toBe('/community?inviteCode=TEACHER42');
  });

  it('rejects malicious or invalid Android install referrer strings without seeding store', async () => {
    Platform.OS = 'android';
    vi.mocked(Application.getInstallReferrerAsync).mockResolvedValue(
      'utm_source=attack&inviteCode=%2e%2e%2fadmin',
    );

    const handled = await resolveDeferredInstallIntent();

    expect(handled).toBe(false);
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });

  it('captures iOS clipboard deferred invite link and clears clipboard', async () => {
    Platform.OS = 'ios';
    vi.mocked(Clipboard.hasStringAsync).mockResolvedValue(true);
    vi.mocked(Clipboard.getStringAsync).mockResolvedValue('https://gurudevi.app/c/IOSINVITE10');

    const handled = await resolveDeferredInstallIntent();

    expect(handled).toBe(true);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('');
    const pending = pendingIntentStore.getState().getPendingIntent();
    expect(pending?.params.inviteCode).toBe('IOSINVITE10');
  });

  it('skips deferred inspection if pendingIntentStore is already active from +native-intent', async () => {
    Platform.OS = 'android';
    pendingIntentStore.getState().setPendingIntent({
      targetPath: '/community?inviteCode=EXISTING',
      intentKind: 'classroomInvite',
      params: { inviteCode: 'EXISTING' },
    });

    vi.mocked(Application.getInstallReferrerAsync).mockResolvedValue('inviteCode=NEW');

    const handled = await resolveDeferredInstallIntent();

    expect(handled).toBe(false);
    expect(Application.getInstallReferrerAsync).not.toHaveBeenCalled();
    expect(pendingIntentStore.getState().getPendingIntent()?.params.inviteCode).toBe('EXISTING');
  });
});
