import { useStore } from '../../store/useStore';
import { ErrorCategory, SovereignError } from '../../types/Errors';
import type { CapabilityToken } from '../../logic/ports/authz.port';

let _permissionValidator: ((params: any) => Promise<boolean>) | null = null;
let _activeToken: CapabilityToken | null = null;
let _currentPolicyHash: string | null = null;
let _currentOperationContext: string | null = null;

export function registerPermissionValidator(validator: ((params: any) => Promise<boolean>) | null): void {
  _permissionValidator = validator;
}

export function setActiveCapabilityToken(token: CapabilityToken | null): void {
  _activeToken = token;
}

export function registerPolicyVersionHash(hash: string | null): void {
  _currentPolicyHash = hash;
}

export function registerOperationContext(context: string | null): void {
  _currentOperationContext = context;
}

export function resetSecureDrizzleState(): void {
  _permissionValidator = null;
  _activeToken = null;
  _currentPolicyHash = null;
  _currentOperationContext = null;
}

function isTokenValid(token: CapabilityToken): { valid: boolean; reason?: string } {
  if (Date.now() > token.expiresAt) {
    return { valid: false, reason: 'Token expired' };
  }
  if (_currentPolicyHash && token.policyVersionHash !== _currentPolicyHash) {
    return { valid: false, reason: 'Policy version changed since token issuance' };
  }
  if (_currentOperationContext && token.operationContext !== _currentOperationContext) {
    return { valid: false, reason: 'Operation context mismatch' };
  }
  return { valid: true };
}

function extractResourceId(builder: any, action: string): string {
  try {
    const sqlInfo = builder.toSQL?.();
    if (!sqlInfo?.params?.length) return 'local-drizzle-write-interceptor';

    if (action === 'create') {
      return String(sqlInfo.params[0]);
    }

    if (action === 'update' || action === 'delete') {
      const match = sqlInfo.sql?.match(/"id"\s*=\s*(\?|\$\d+)/);
      if (match) {
        const placeholder = match[1];
        if (placeholder === '?') {
          const idx = sqlInfo.sql.indexOf(match[0]);
          const before = sqlInfo.sql.slice(0, idx);
          const qCount = (before.match(/\?/g) || []).length;
          return String(sqlInfo.params[qCount]);
        }
        const paramIdx = parseInt(placeholder.slice(1), 10) - 1;
        return String(sqlInfo.params[paramIdx]);
      }
      return String(sqlInfo.params[sqlInfo.params.length - 1]);
    }
  } catch {
    // fall through
  }
  return 'local-drizzle-write-interceptor';
}

export function createSecureDrizzleProxy(db: any): any {
  if (!db) return db;
  return new Proxy(db, {
    get(target, prop, receiver) {
      const originalValue = Reflect.get(target, prop, receiver);

      if (prop === 'insert' || prop === 'update' || prop === 'delete') {
        return (tableObj: any) => {
          const tableName = tableObj?._?.name || tableObj?.name || 'unknown_table';
          const action = prop === 'insert' ? 'create' : prop === 'update' ? 'update' : 'delete';
          const builder = originalValue.apply(target, [tableObj]);

          return new Proxy(builder, {
            get(builderTarget, builderProp, builderReceiver) {
              const originalBuilderValue = Reflect.get(builderTarget, builderProp, builderReceiver);

              if (builderProp === 'execute' || builderProp === 'then') {
                return (...args: any[]) => {
                  // Priority 1: capability token validation (per ADR-012)
                  if (_activeToken) {
                    const validation = isTokenValid(_activeToken);
                    if (!validation.valid) {
                      // Token expired or invalid — fall back to per-write validation
                      _activeToken = null;
                    } else {
                      // Token valid — skip per-write WASM evaluation
                      if (builderProp === 'then') {
                        const promise = originalBuilderValue.apply(builderTarget, []);
                        return promise.then(...args);
                      }
                      return originalBuilderValue.apply(builderTarget, args);
                    }
                  }

                  // Priority 2: per-write permission validator (fallback)
                  if (!_permissionValidator) {
                    if (builderProp === 'then') {
                      const promise = originalBuilderValue.apply(builderTarget, []);
                      return promise.then(...args);
                    }
                    return originalBuilderValue.apply(builderTarget, args);
                  }

                  const state = useStore.getState();
                  const userContext = {
                    userId: state.user?.id || null,
                    email: state.user?.email || null,
                    schoolId: state.user?.school_id || null,
                    activeBond: state.activeBond as any,
                    isAnonymous: !state.user || !!state.user?.is_anonymous,
                  };

                  const resourceType =
                    tableName.charAt(0).toUpperCase() +
                    tableName
                      .slice(1)
                      .replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());

                  return _permissionValidator({
                    action: action as any,
                    resourceType: resourceType as any,
                    resourceId: extractResourceId(builderTarget, action),
                    userContext,
                  }).then((isAllowed) => {
                    if (!isAllowed) {
                      throw new SovereignError({
                        title: 'Unauthorized Local Mutation',
                        detail: `Access denied. Direct local database write to table "${tableName}" is blocked for action "${action}".`,
                        status: 403,
                        category: ErrorCategory.AUTHORIZATION,
                        code: 'LOCAL_WRITE_VIOLATION',
                      });
                    }
                    if (builderProp === 'then') {
                      const promise = originalBuilderValue.apply(builderTarget, []);
                      return promise.then(...args);
                    }
                    return originalBuilderValue.apply(builderTarget, args);
                  });
                };
              }
              return typeof originalBuilderValue === 'function'
                ? originalBuilderValue.bind(builderTarget)
                : originalBuilderValue;
            },
          });
        };
      }

      if (prop === 'transaction') {
        return (callback: any, config: any) => {
          const secureCallback = async (tx: any) => {
            const secureTx = createSecureDrizzleProxy(tx);
            return callback(secureTx);
          };
          return originalValue.apply(target, [secureCallback, config]);
        };
      }

      return typeof originalValue === 'function' ? originalValue.bind(target) : originalValue;
    },
  });
}
