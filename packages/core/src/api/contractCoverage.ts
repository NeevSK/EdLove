export type ContractEntry = {
  metadata?: unknown;
};

export type ContractShape = Record<string, ContractEntry>;

export interface ContractCoverageDefinition<T extends object = object> {
  moduleName: string;
  contract: ContractShape;
  methodMapping?: Record<string, string>;
  internalMethods?: Array<keyof T | string>;
}

const contractCoverageRegistry = new Map<string, ContractCoverageDefinition<any>>();

export const defineContractCoverage = <T extends object>(
  definition: ContractCoverageDefinition<T>,
): ContractCoverageDefinition<T> => {
  contractCoverageRegistry.set(
    definition.moduleName,
    definition as ContractCoverageDefinition<any>,
  );
  return definition;
};

export const getContractCoverage = (moduleName: string): ContractCoverageDefinition | undefined =>
  contractCoverageRegistry.get(moduleName) as ContractCoverageDefinition | undefined;

export const listContractCoverage = (): ContractCoverageDefinition[] =>
  Array.from(contractCoverageRegistry.values()) as ContractCoverageDefinition[];

export const assertContractCoverage = <T extends object>(
  target: T,
  definition: ContractCoverageDefinition<T>,
): ContractCoverageDefinition<T> => {
  const methodMapping = definition.methodMapping ?? {};
  const internalMethods = new Set((definition.internalMethods ?? []).map(String));
  const missingCoverage = Object.keys(target as Record<string, unknown>).filter((key) => {
    const candidate = (target as Record<string, unknown>)[key];
    if (typeof candidate !== 'function') return false;
    if (internalMethods.has(key)) return false;

    const contractKey = methodMapping[key] || key;
    return !definition.contract[contractKey];
  });

  if (missingCoverage.length > 0) {
    throw new Error(
      `Contract coverage missing for module "${definition.moduleName}": ${missingCoverage.join(', ')}`,
    );
  }

  return definition;
};
