import { AuthorityInterceptor } from '../logic/permissions/AuthorityInterceptor';
import { composeUserAbilities } from '../logic/permissions/composer';
import { type TenantKind, UserContextSchema } from '../logic/schemas/user.schema';
import { useStore } from '../store/useStore';
import { interceptApiCall } from './demoProvider';
import { SovereignError, ErrorCategory } from '../types/Errors';

/**
 * createPOAProxy
 *
 * The Single Source of Truth for Authority Enforcement.
 * This proxy wraps API modules and automatically validates the 'metadata.authority'
 * defined in Hono routes against the user's current CASL ability.
 */
export function createPOAProxy<T extends object>(
  moduleName: string,
  target: T,
  contract?: Record<string, any>,
  methodMapping: Record<string, string> = {},
  options: { strictUnmappedMethods?: boolean; ignoredMethods?: string[] } = {},
): T {
  return new Proxy(target, {
    get(obj: T, prop: string | symbol) {
      const originalMethod = (obj as Record<string | symbol, unknown>)[prop];

      if (typeof originalMethod === 'function' && typeof prop === 'string') {
        return async (...args: unknown[]) => {
          if (options.ignoredMethods?.includes(prop)) {
            return originalMethod.apply(obj, args);
          }

          // 1. Resolve User Context from Store
          const state = useStore.getState();
          const user = state.user;
          const active_bond = state.active_bond;
          const schoolType = state.schoolType;

          const context = UserContextSchema.parse({
            user_id: user?.id || null,
            email: user?.email || null,
            school_id: user?.school_id || null,
            active_bond: active_bond,
            tenancy_name: user?.organization_name || null,
            tenancy: {
              kind: (user?.tenant_kind || 'customer') as TenantKind,
              is_personal: schoolType === 'personal_workspace',
            },
            tenant_kind: (user?.tenant_kind || 'customer') as TenantKind,
            is_anonymous: !user || !!user?.is_anonymous,
            has_global_access: !!active_bond && ['founder', 'developer', 'admin'].includes(active_bond.capacity),
            is_personal: schoolType === 'personal_workspace',
          });

          // 2. Compose Ability
          const ability = composeUserAbilities(context);

          // 3. Resolve Authority Metadata from Sovereign Port
          const contractKey = methodMapping[prop] || prop;
          const route = contract?.[contractKey] as any;
          const metadata = route?.metadata;

          if (metadata && typeof metadata === 'object' && 'authority' in metadata) {
            if (__DEV__) {
              console.log(`[POA] Dispatching ${moduleName}.${prop}`);
            }
            // POA validation
            await AuthorityInterceptor.enforce(ability, metadata);
          } else {
            if (options.strictUnmappedMethods) {
              throw new SovereignError({
                title: 'Contract Violation',
                detail: `POA contract coverage missing for ${moduleName}.${prop} (expected contract route "${contractKey}")`,
                status: 500,
                category: ErrorCategory.AUTHORIZATION,
                code: 'MISSING_CONTRACT_COVERAGE',
              });
            }
          }

          // 4. Check for Demo Interception
          const intercepted = interceptApiCall(moduleName, prop, args as any[]);
          if (intercepted) return intercepted;

          // 5. Execute original method
          return originalMethod.apply(obj, args);
        };
      }

      return originalMethod;
    },
  });
}
