import { AuthorityInterceptor } from '../logic/permissions/AuthorityInterceptor';
import { type TenantKind, UserContextSchema } from '../logic/schemas/user.schema';
import { useStore } from '../store/useStore';
import { ErrorCategory, SovereignError } from '../types/Errors';
import { interceptApiCall } from './demoProvider';

/**
 * createPOAProxy
 *
 * The Single Source of Truth for policy enforcement.
 * This proxy wraps API modules and automatically validates route policy
 * metadata defined in Hono routes against the user's current checkLocalPermission engine.
 */
export function createPOAProxy(
  moduleName: string,
  target: any,
  contract?: Record<string, any>,
  methodMapping: Record<string, string> = {},
  options: { strictUnmappedMethods?: boolean; ignoredMethods?: string[] } = {},
): any {
  const isWeb = typeof window !== 'undefined';
  const browserBootstrapModules = new Set(['identity', 'profile', 'auth', 'onboarding']);

  // Create an inverse mapping for efficient lookup during 'get'
  const contractToInternal: Record<string, string> = {};
  for (const [internal, contract] of Object.entries(methodMapping)) {
    contractToInternal[contract] = internal;
  }

  return new Proxy(target, {
    get(obj: any, prop: string | symbol) {
      if (typeof prop !== 'string') return obj[prop];

      // If ignored, return original
      if (options.ignoredMethods?.includes(prop)) return obj[prop];

      // Determine the internal method name and the contract key
      const internalName = contractToInternal[prop] || prop;
      const contractKey = methodMapping[internalName] || internalName;

      const originalMethod = obj[internalName];
      const route = contract?.[contractKey] as any;

      if (typeof originalMethod === 'function') {
        return async (...args: unknown[]) => {
          const state = useStore.getState();
          const context = UserContextSchema.parse({
            userId: state.user?.id || null,
            email: state.user?.email || null,
            schoolId: state.user?.school_id || null,
            activeBond: state.activeBond,
            tenancyName: state.user?.organization_name || null,
            tenancy: {
              kind: (state.user?.tenant_kind || 'customer') as TenantKind,
              isPersonal: state.schoolType === 'personal_workspace',
            },
            tenantKind: (state.user?.tenant_kind || 'customer') as TenantKind,
            isAnonymous: !state.user || !!state.user?.is_anonymous,
            hasGlobalAccess:
              !!state.activeBond &&
              ['founder', 'developer', 'admin'].includes(state.activeBond.capacity),
            isPersonal: state.schoolType === 'personal_workspace',
          });

          const metadata = route?.metadata;

          const shouldBypassBootstrapEnforcement =
            isWeb && browserBootstrapModules.has(moduleName);

          if (metadata && typeof metadata === 'object' && 'policy' in metadata) {
            if (!shouldBypassBootstrapEnforcement) {
              if (__DEV__) console.log(`[POA] Dispatching ${moduleName}.${prop} -> ${internalName}`);
              await AuthorityInterceptor.enforce(context, metadata);
            }
          } else if (options.strictUnmappedMethods !== false && !shouldBypassBootstrapEnforcement) {
            throw new SovereignError({
              title: 'Contract Violation',
              detail: `POA contract coverage missing for ${moduleName}.${prop} (contract key "${contractKey}")`,
              status: 500,
              category: ErrorCategory.AUTHORIZATION,
              code: 'MISSING_CONTRACT_COVERAGE',
            });
          }

          const intercepted = interceptApiCall(moduleName, internalName, args);
          if (intercepted) return intercepted;

          return originalMethod.apply(obj, args);
        };
      }

      return originalMethod;
    },
  });
}
