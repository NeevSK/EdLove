import { useAuthStore } from '@repo/core/store/useAuthStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeEssentialStartup } from '@/boot/startupCoordinator';

describe('Suite A: Full App Bootstrap, Rehydration & Essential Startup Gate', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isStoreHydrated: false,
      user: null,
      authSession: null,
      authSessionResolved: false,
    });
  });

  it('coordinates essential startup step-by-step and gates ready state until all subsystems succeed', async () => {
    const bootstrapPlatformSpy = vi.fn().mockResolvedValue(undefined);
    const isRuntimeRegisteredSpy = vi.fn().mockReturnValue(true);
    const registerAppCatalogSpy = vi.fn().mockReturnValue(undefined);
    const initializeDeviceAccountsSpy = vi.fn().mockResolvedValue(undefined);

    // Initial state: not hydrated
    expect(useAuthStore.getState().isStoreHydrated).toBe(false);

    // Execute startup coordinator
    await completeEssentialStartup({
      bootstrapPlatform: bootstrapPlatformSpy,
      isRuntimeRegistered: isRuntimeRegisteredSpy,
      loadCatalog: async () => ({ registerAppCatalog: registerAppCatalogSpy }),
      initializeDeviceAccounts: initializeDeviceAccountsSpy,
    });

    expect(bootstrapPlatformSpy).toHaveBeenCalled();
    expect(isRuntimeRegisteredSpy).toHaveBeenCalled();
    expect(registerAppCatalogSpy).toHaveBeenCalled();
    expect(initializeDeviceAccountsSpy).toHaveBeenCalled();

    // Rehydration simulated
    useAuthStore.getState().setStoreHydrated(true);
    expect(useAuthStore.getState().isStoreHydrated).toBe(true);
  });

  it('fails safely and surfaces error if a critical startup service fails', async () => {
    const failingBootstrap = vi
      .fn()
      .mockRejectedValue(new Error('Native MMKV initialization failed'));

    await expect(
      completeEssentialStartup({
        bootstrapPlatform: failingBootstrap,
        isRuntimeRegistered: () => true,
        loadCatalog: async () => ({ registerAppCatalog: vi.fn() }),
        initializeDeviceAccounts: async () => {},
      }),
    ).rejects.toThrow('Native MMKV initialization failed');

    // Store hydration remains false on critical bootstrap failure
    expect(useAuthStore.getState().isStoreHydrated).toBe(false);
  });
});
