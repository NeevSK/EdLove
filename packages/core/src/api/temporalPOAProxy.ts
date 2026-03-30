import { createTemporalProxy } from './temporalProxy';
import { createPOAProxy } from './poaProxy';
import type { ContractShape } from './contractCoverage';

export interface TemporalPOAProxyOptions {
    strictUnmappedMethods?: boolean;
}

/**
 * Composes temporal runtime behavior with contract-backed POA enforcement.
 *
 * Order matters:
 * - POA remains the outermost guard, preserving the SSOT flow.
 * - Temporal behavior runs only after API-surface authority is approved.
 */
export function createTemporalPOAProxy<T extends object>(
    moduleName: string,
    target: T,
    contract?: ContractShape,
    methodMapping: Record<string, string> = {},
    options: TemporalPOAProxyOptions = {}
): T {
    return createPOAProxy(
        moduleName,
        createTemporalProxy(moduleName, target),
        contract,
        methodMapping,
        options
    );
}
