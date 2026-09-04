import {
  type DomainEntry,
  DomainEntrySchema,
  type TabDomain,
} from '@repo/core/logic/registry/domainEntry';
import {
  FEATURE_FLAG_MANIFEST,
  validateFeatureFlagManifest,
} from '@repo/core/logic/registry/featureLifecycleManifest';

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

function validateCatalogEntry(key: string, entry: DomainEntry): void {
  DomainEntrySchema.parse(entry);

  if (key !== entry.id) {
    throw new Error(`AppCatalog: registry key "${key}" must match entry id "${entry.id}".`);
  }

  if (entry.state === 'beta' && !entry.flagKey) {
    throw new Error(`AppCatalog: beta entry "${entry.id}" requires a GrowthBook flagKey.`);
  }

  if (entry.flagKey && !entry.lifecycle.flagClass) {
    throw new Error(`AppCatalog: flagged entry "${entry.id}" requires a lifecycle flagClass.`);
  }

  if (entry.flagKey && entry.lifecycle.flagClass) {
    const manifestMetadata =
      FEATURE_FLAG_MANIFEST[entry.flagKey as keyof typeof FEATURE_FLAG_MANIFEST];
    if (!manifestMetadata) {
      throw new Error(
        `AppCatalog: flagged entry "${entry.id}" is missing lifecycle manifest metadata for "${entry.flagKey}".`,
      );
    }
    if (manifestMetadata.class !== entry.lifecycle.flagClass) {
      throw new Error(
        `AppCatalog: flag class mismatch for "${entry.id}": registry=${entry.lifecycle.flagClass}, manifest=${manifestMetadata.class}.`,
      );
    }
  }

  if (
    entry.flagKey &&
    entry.lifecycle.flagClass !== 'operational' &&
    !entry.lifecycle.removalTarget
  ) {
    throw new Error(`AppCatalog: temporary flag "${entry.id}" requires a removalTarget.`);
  }

  if (
    entry.flagKey &&
    entry.lifecycle.flagClass === 'operational' &&
    !entry.lifecycle.permanentJustification
  ) {
    throw new Error(
      `AppCatalog: operational flag "${entry.id}" requires a permanentJustification.`,
    );
  }
}

export function registerDomains(entries: AppCatalog): void {
  if (_catalog !== null) {
    throw new Error(
      'AppCatalog: registerDomains() called more than once. ' +
        'Call it exactly once during boot before any screen renders.',
    );
  }
  validateFeatureFlagManifest();
  Object.entries(entries).forEach(([key, entry]) => validateCatalogEntry(key, entry));
  _catalog = entries;
}

export function getAppCatalog(): AppCatalog {
  if (_catalog === null) {
    throw new Error(
      'AppCatalog: getAppCatalog() called before registerDomains(). ' +
        'Ensure registerAppCatalog() runs during boot hydration step.',
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
        `Registered domains: ${Object.keys(catalog).join(', ')}`,
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
  return Object.values(getAppCatalog()).sort((a, b) => a.defaultOrder - b.defaultOrder);
}

// Reset for testing only — never call in app code
export function _resetCatalogForTesting(): void {
  _catalog = null;
}
