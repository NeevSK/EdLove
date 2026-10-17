import type { AnyProcedureContract } from '@orpc/contract';
import { getOpenAPIMeta } from '@orpc/openapi';
import type { AnyProcedure } from '@orpc/server';

/**
 * The OpenAPI compatibility transport deliberately exposes only declared GET
 * operations. Mutations remain available exclusively through the native RPC
 * transport, whose contract and idempotency semantics are maintained there.
 */
export function isReadOnlyOpenApiProcedure(
  contract: AnyProcedureContract | AnyProcedure,
): boolean {
  if (!contract) return false;
  const meta = getOpenAPIMeta(contract);
  return meta?.method === 'GET';
}
