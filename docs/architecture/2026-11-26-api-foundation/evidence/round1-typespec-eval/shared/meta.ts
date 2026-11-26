// Finds a procedure's metadata in an oRPC contract tree by its operationId.
type Node = Record<string, unknown>;
export function findOperationMeta(tree: unknown, operationId: string): Record<string, unknown> | undefined {
  if (!tree || typeof tree !== 'object') return undefined;
  const orpc = (tree as Node)['~orpc'] as { meta?: Record<string, unknown> } | undefined;
  if (orpc?.meta) {
    const oa = orpc.meta['~openapi'] as { operationId?: string } | undefined;
    return oa?.operationId === operationId ? orpc.meta : undefined;
  }
  for (const value of Object.values(tree as Node)) {
    const found = findOperationMeta(value, operationId);
    if (found) return found;
  }
  return undefined;
}
