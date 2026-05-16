import { AuthorityInterceptor } from '../logic/permissions/AuthorityInterceptor';
import { composeUserAbilities } from '../logic/permissions/composer';
import { type TenantKind, UserContextSchema } from '../logic/schemas/user.schema';
import { useStore } from '../store/useStore';
import { interceptApiCall } from './demoProvider';
import { SovereignError, ErrorCategory } from '../types/Errors';

/**
 * createPOAProxy
 *
 * The Single Source of Truth for policy enforcement.
 * This proxy wraps API modules and automatically validates route policy
 * metadata defined in Hono routes against the user's current CASL ability.
 */
export function createPOAProxy(
  moduleName: string,
  target: any,
  contract?: Record<string, any>,
  methodMapping: Record<string, string> = {},
  options: { strictUnmappedMethods?: boolean; ignoredMethods?: string[] } = {},
): any {
  // Create an inverse mapping for efficient lookup during 'get'
  // Internal Name -> Contract Name is in methodMapping
  // We need Contract Name -> Internal Name for the proxy
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
            user_id: state.user?.id || null,
            email: state.user?.email || null,
            school_id: state.user?.school_id || null,
            active_bond: state.active_bond,
            tenancy_name: state.user?.organization_name || null,
            tenancy: {
              kind: (state.user?.tenant_kind || 'customer') as TenantKind,
              is_personal: state.schoolType === 'personal_workspace',
            },
            tenant_kind: (state.user?.tenant_kind || 'customer') as TenantKind,
            is_anonymous: !state.user || !!state.user?.is_anonymous,
            has_global_access: !!state.active_bond && ['founder', 'developer', 'admin'].includes(state.active_bond.capacity),
            is_personal: state.schoolType === 'personal_workspace',
          });

          const ability = composeUserAbilities(context);
          const metadata = route?.metadata;

          if (metadata && typeof metadata === 'object' && 'policy' in metadata) {
            if (__DEV__) console.log(`[POA] Dispatching ${moduleName}.${prop} -> ${internalName}`);
            await AuthorityInterceptor.enforce(ability, metadata);
          } else if (options.strictUnmappedMethods) {
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
