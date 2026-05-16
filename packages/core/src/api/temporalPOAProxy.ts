import type { ContractShape } from './contractCoverage';
import { createPOAProxy } from './poaProxy';
import { createTemporalProxy } from './temporalProxy';

export interface TemporalPOAProxyOptions {
  strictUnmappedMethods?: boolean;
}

/**
 * Composes temporal runtime behavior with contract-backed POA enforcement.
 *
 * Order matters:
 * - POA remains the outermost guard, preserving the SSOT flow.
 * - Temporal behavior runs only after API-surface policy is approved.
 */
export function createTemporalPOAProxy(
  moduleName: string,
  target: any,
  contract?: ContractShape,
  methodMapping: Record<string, string> = {},
  options: TemporalPOAProxyOptions = {},
): any {
  return createPOAProxy(
    moduleName,
    createTemporalProxy(moduleName, target),
    contract,
    methodMapping,
    options,
  );
}
