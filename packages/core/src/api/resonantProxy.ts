import { getSandboxDomainConfig } from '@repo/core/api/sandboxDataset';
import { resolveSandboxMode } from '@repo/core/api/sandboxMode';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { useUIStore } from '@repo/core/store/useUIStore';

const WRITE_METHOD_PREFIXES = [
  'create',
  'update',
  'delete',
  'add',
  'send',
  'submit',
  'batch',
  'upsert',
  'mark',
  'record',
] as const;

function isWriteMethod(name: string): boolean {
  return WRITE_METHOD_PREFIXES.some((prefix) => name.startsWith(prefix));
}

/**
 * createResonantProxy
 *
 * Canonical Proxy kernel that intercepts API calls and routes them through the
 * sandbox/demo layer before (and after) the real implementation.
 *
 * Intercept order:
 *   1. Demo mode write simulation & logging for SandboxBridge replay
 *   2. Demo mode read resolution via self-registered SandboxDomainConfig
 *   3. Sample-entity targeting (args matching 'sample-*' or 'mock-*')
 *   4. Real method execution
 *   5. Ghost seeding via typed SandboxDomainConfig for empty collections
 *
 * Zero dependencies on deprecated demoProvider or monolithic mockData.
 */
export function createResonantProxy<T extends object>(moduleName: string, target: T): T {
  return new Proxy(target, {
    get(obj: any, prop: string) {
      const originalMethod = obj[prop];
      if (typeof originalMethod !== 'function') return originalMethod;

      return async (...args: any[]) => {
        const mode = resolveSandboxMode();
        const state = useExperienceState.getState();

        // 1. In demo mode: resolve writes to simulation logs & reads via domainConfig
        if (mode === 'demo' && !state.isBridging) {
          if (isWriteMethod(prop)) {
            state.addDemoLog({
              module: moduleName,
              method: prop,
              payload: args[0],
            });
            return {
              success: true,
              message: 'Sandbox mode: Operation simulated successfully',
              data: null,
            };
          }

          const domainConfig = getSandboxDomainConfig(moduleName);
          if (
            domainConfig &&
            (domainConfig.ghostMethods.includes(prop) ||
              prop.startsWith('get') ||
              prop.startsWith('list') ||
              prop === 'getAll')
          ) {
            const samples = domainConfig.getSamples(prop, args);
            if (Array.isArray(samples)) {
              return samples.map((item: any) => ({ ...item, is_sample: true }));
            }
            return samples;
          }
        }

        // 2. Sample-entity direct targeting (e.g. query by 'sample-c1' or 'mock-school')
        const targetId = args[0];
        const isTargetingSampleEntity =
          typeof targetId === 'string' &&
          (targetId.startsWith('sample-') || targetId.startsWith('mock-'));
        if (isTargetingSampleEntity && !state.isBridging) {
          const domainConfig = getSandboxDomainConfig(moduleName);
          if (domainConfig) {
            const samples = domainConfig.getSamples(prop, args);
            if (samples !== undefined) {
              return Array.isArray(samples)
                ? samples.map((item: any) => ({ ...item, is_sample: true }))
                : samples;
            }
          }
        }

        // 3. Execute the real method
        const result = await originalMethod.apply(obj, args);

        // 4. Ghost seeding via typed domain registry
        const domainConfig = getSandboxDomainConfig(moduleName);
        if (
          domainConfig &&
          (mode === 'ghost' || mode === 'demo') &&
          domainConfig.ghostMethods.includes(prop) &&
          domainConfig.isEmpty(prop, result)
        ) {
          const dismissed = useUIStore.getState().dismissedSampleIds;
          const samples = domainConfig.getSamples(prop, args);
          if (Array.isArray(samples)) {
            return samples
              .filter((item: any) => !dismissed.includes(item.id))
              .map((item: any) => ({ ...item, is_sample: true }));
          }
          if (samples && typeof samples === 'object') {
            return { ...samples, is_sample: true };
          }
          return samples;
        }

        return result;
      };
    },
  });
}

