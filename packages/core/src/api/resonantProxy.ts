import { interceptApiCall } from '@repo/core/api/demoProvider';

/**
 * createResonantProxy
 *
 * A high-powered Proxy kernel that intercepts API calls and diverts them
 * to the Demo/Mocking layer if the system is in Resonance (Demo Mode).
 *
 * Following the Upstream Logic Rule (docs/TAIL_FIN.md), this allows
 * consumers to stay "thin" while the core manages the mocking ecosystem.
 */
export function createResonantProxy<T extends object>(moduleName: string, target: T): T {
  return new Proxy(target, {
    get(obj: any, prop: string) {
      const originalMethod = obj[prop];
      if (typeof originalMethod === 'function') {
        return async (...args: any[]) => {
          // 1. Check the local interceptor (Demo Mode check)
          const intercepted = interceptApiCall(moduleName, prop, args);
          if (intercepted) return intercepted;

          // 2. Execute the real method
          const result = await originalMethod.apply(obj, args);

          // 3. Optional: Post-process results (Ghost Seeding)
          // if (processGhostData) {
          //     result = processGhostData(moduleName, prop, result);
          // }

          return result;
        };
      }
      return originalMethod;
    },
  });
}
