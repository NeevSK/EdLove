import type { TraverseContractProcedureCallbackOptions } from '@orpc/server';

type ORPCContractRoute = {
  method?: string;
};

/**
 * The OpenAPI compatibility transport deliberately exposes only declared GET
 * operations. Mutations remain available exclusively through the native RPC
 * transport, whose contract and idempotency semantics are maintained there.
 */
export function isReadOnlyOpenApiProcedure({
  contract,
}: TraverseContractProcedureCallbackOptions): boolean {
  const route = (contract as { ['~orpc']?: { route?: ORPCContractRoute } })['~orpc']?.route;
  return route?.method === 'GET';
}
