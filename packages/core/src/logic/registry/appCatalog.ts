import type { DomainEntry, TabDomain } from '@/logic/registry/domainEntry';

/**
 * AppCatalog — the single assembled registry of all domains.
 *
 * Rules:
 * - registerDomains() is called exactly once at app boot.
 * - All reads go through getAppCatalog() or getDomainEntry().
 * - Throws loudly if accessed before registration.
 * - Throws loudly if a requested domain does not exist.
 * - No silent failures.
 */

export type AppCatalog = Record<string, DomainEntry>;

let _catalog: AppCatalog | null = null;

export function registerDomains(entries: AppCatalog): void {
  if (_catalog !== null) {
    throw new Error(
      'AppCatalog: registerDomains() called more than once. ' +
      'Call it exactly once during boot before any screen renders.'
    );
  }
  _catalog = entries;
}

export function getAppCatalog(): AppCatalog {
  if (_catalog === null) {
    throw new Error(
      'AppCatalog: getAppCatalog() called before registerDomains(). ' +
      'Ensure registerAppCatalog() runs during boot hydration step.'
    );
  }
  return _catalog;
}

export function getDomainEntry(id: string): DomainEntry {
  const catalog = getAppCatalog();
  const entry = catalog[id];
  if (!entry) {
    throw new Error(
      `AppCatalog: domain entry not found: "${id}". ` +
      `Registered domains: ${Object.keys(catalog).join(', ')}`
    );
  }
  return entry;
}

export function getDomainsByTab(tab: TabDomain): DomainEntry[] {
  return Object.values(getAppCatalog())
    .filter((entry) => entry.tabDomain === tab)
    .sort((a, b) => a.defaultOrder - b.defaultOrder);
}

export function getAllDomains(): DomainEntry[] {
  return Object.values(getAppCatalog())
    .sort((a, b) => a.defaultOrder - b.defaultOrder);
}

// Reset for testing only — never call in app code
export function _resetCatalogForTesting(): void {
  _catalog = null;
}
