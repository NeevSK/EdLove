import { AuthorityInterceptor } from '../logic/permissions/AuthorityInterceptor';
import { composeUserAbilities } from '../logic/permissions/composer';
import type { Role } from '../logic/schemas/role.schema';
import { type TenantKind, UserContextSchema } from '../logic/schemas/user.schema';
import { useStore } from '../store/useStore';

/**
 * createPOAProxy
 *
 * The Single Source of Truth for Authority Enforcement.
 * This proxy wraps API modules and automatically validates the 'metadata.authority'
 * defined in ts-rest contracts against the user's current CASL ability.
 */
export function createPOAProxy<T extends object>(
  moduleName: string,
  target: T,
  contract?: Record<string, any>,
  methodMapping: Record<string, string> = {},
  options: { strictUnmappedMethods?: boolean } = {},
): T {
  return new Proxy(target, {
    get(obj: T, prop: string | symbol) {
      const originalMethod = (obj as Record<string | symbol, unknown>)[prop];

      if (typeof originalMethod === 'function' && typeof prop === 'string') {
        return async (...args: unknown[]) => {
          // 1. Resolve User Context from Store
          const state = useStore.getState();
          const user = state.user;
          const schoolType = state.schoolType;

          const roles = (user?.roles || []) as Role[];
          const hasGlobalAccess = roles.some((r) => ['founder', 'developer', 'admin'].includes(r));

          const context = UserContextSchema.parse({
            userId: user?.id || null,
            email: user?.email || null,
            schoolId: user?.school_id || null,
            tenancyName: user?.organization_name || null,
            tenancy: {
              kind: (user?.tenant_kind || 'customer') as TenantKind,
              isPersonal: schoolType === 'personal_workspace',
            },
            tenantKind: (user?.tenant_kind || 'customer') as TenantKind,
            roles,
            authority: (user?.authority as Role) || roles[0] || null,
            isAnonymous: !user || !!user?.is_anonymous,
            hasGlobalAccess,
            isPersonal: schoolType === 'personal_workspace',
          });

          // 2. Compose Ability
          const ability = composeUserAbilities(context);

          // 3. Resolve Authority Metadata from Contract
          // Try mapping, then exact match, or fallback to the method name itself in the contract router
          const contractKey = methodMapping[prop] || prop;
          const contractEntry = contract?.[contractKey] as Record<string, unknown> | undefined;
          const metadata = contractEntry?.metadata;

          if (metadata && typeof metadata === 'object' && 'authority' in metadata) {
            if (__DEV__) {
              console.log(`[POA Interceptor] Verifying authority for ${moduleName}.${prop}...`);
            }
            await AuthorityInterceptor.enforce(ability, metadata);
          } else {
            if (options.strictUnmappedMethods) {
              throw new Error(
                `POA contract coverage missing for ${moduleName}.${prop} (expected contract route "${contractKey}")`,
              );
            }
          }

          // 4. Execute original method
          return originalMethod.apply(obj, args);
        };
      }

      return originalMethod;
    },
  });
}
