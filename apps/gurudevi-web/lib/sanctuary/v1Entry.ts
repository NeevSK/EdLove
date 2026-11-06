import { createV1Client } from '@repo/core/api/v1/client';
import type { AppContractClient } from '@repo/core/api/v1/contract';

export type V1Entry = Awaited<ReturnType<AppContractClient['identity']['entry']>>;
export type V1Scope = V1Entry['scopes'][number];

/** Which bond this browser is working in. Only a choice: every command re-checks its bond. */
export const ACTIVE_BOND_COOKIE = 'gurudevi-active-bond';

export function readV1Entry(
  origin: string,
  accessToken: string,
  fetcher: typeof fetch = fetch,
): Promise<V1Entry> {
  const client = createV1Client({
    origin: origin.replace(/\/+$/, ''),
    headers: { authorization: `Bearer ${accessToken}` },
    fetch: (url, init) => fetcher(url, { ...init, cache: 'no-store' }),
  });
  return client.identity.entry();
}

/** The chosen bond if it is still this account's; otherwise personal, then the first available. */
export function chooseActiveScope(
  scopes: readonly V1Scope[],
  selectedBondId: string | undefined,
): V1Scope | null {
  const available = scopes.filter((scope) => scope.admission === 'available');
  return (
    available.find((scope) => scope.bondId === selectedBondId) ??
    available.find((scope) => scope.entityType === 'PERSONAL') ??
    available[0] ??
    null
  );
}

export function personalCapacity(scopes: readonly V1Scope[]): string | null {
  return scopes.find((scope) => scope.entityType === 'PERSONAL')?.capacity ?? null;
}
