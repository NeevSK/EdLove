import { describe, expect, it, vi } from 'vitest';
import { completeEssentialStartup } from '@/boot/startupCoordinator';

describe('essential startup coordinator', () => {
  it('enforces runtime → catalog → workflow bridge ordering', async () => {
    const steps: string[] = [];

    await completeEssentialStartup({
      bootstrapPlatform: async () => {
        steps.push('runtime');
      },
      isRuntimeRegistered: () => true,
      loadCatalog: async () => ({
        registerAppCatalog: () => steps.push('catalog'),
      }),
      installWorkflowBridge: () => steps.push('workflow'),
    });

    expect(steps).toEqual(['runtime', 'catalog', 'workflow']);
  });

  it('does not mount catalog-dependent work when runtime registration fails', async () => {
    const loadCatalog = vi.fn();
    const installWorkflowBridge = vi.fn();

    await expect(
      completeEssentialStartup({
        bootstrapPlatform: async () => undefined,
        isRuntimeRegistered: () => false,
        loadCatalog,
        installWorkflowBridge,
      }),
    ).rejects.toThrow('Core runtime registration did not complete.');

    expect(loadCatalog).not.toHaveBeenCalled();
    expect(installWorkflowBridge).not.toHaveBeenCalled();
  });

  it('permits a clean retry after a failed runtime attempt', async () => {
    const bootstrapPlatform = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('native adapter unavailable'))
      .mockResolvedValueOnce(undefined);
    const registerAppCatalog = vi.fn();
    const installWorkflowBridge = vi.fn();

    const dependencies = {
      bootstrapPlatform,
      isRuntimeRegistered: () => true,
      loadCatalog: async () => ({ registerAppCatalog }),
      installWorkflowBridge,
    };

    await expect(completeEssentialStartup(dependencies)).rejects.toThrow(
      'native adapter unavailable',
    );
    await expect(completeEssentialStartup(dependencies)).resolves.toBeUndefined();

    expect(registerAppCatalog).toHaveBeenCalledTimes(1);
    expect(installWorkflowBridge).toHaveBeenCalledTimes(1);
  });
});
