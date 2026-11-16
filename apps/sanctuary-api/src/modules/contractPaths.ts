// Dotted capability names read from a contract or router, for the catalog fitness tests and
// the capability conformance report. Plan: docs/implementation/2026-11-08-capability-conformance-plan.md
import type { RouterContract } from '@orpc/contract';
import { type AnyRouter, getRouter, Procedure, walkProcedureContractsSync } from '@orpc/server';

export function procedurePaths(contract: RouterContract | AnyRouter): string[] {
  const paths: string[] = [];
  const lazy = walkProcedureContractsSync(contract, (_procedure, path) => {
    paths.push(path.join('.'));
  });
  // A lazy branch is only known after loading it; counting it as absent would hide capabilities.
  if (lazy.length > 0)
    throw new Error(`Lazy routers are not walked: ${lazy.map((l) => l.path.join('.')).join(', ')}`);
  return paths.sort();
}

// Walking an implemented router yields its contract, not its handlers, so each contract path
// is looked up in the router and counted only when a handler sits there.
export function implementedPaths(router: AnyRouter, contract: RouterContract): string[] {
  return procedurePaths(contract).filter(
    (path) => getRouter(router, path.split('.')) instanceof Procedure,
  );
}
