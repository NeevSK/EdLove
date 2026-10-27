/**
 * Per-domain configuration for sandbox ghost seeding.
 *
 * Each API domain self-registers by calling `registerSandboxDomain()` at
 * module load time. The `resonantProxy` reads these configs instead of
 * maintaining a parallel if-forest in `processGhostData`.
 *
 * Minimal contract — each domain declares only what it needs:
 *  - which read methods can produce ghost results
 *  - how to detect an "empty" real result
 *  - how to produce the sample records
 */
export interface SandboxDomainConfig {
  /** e.g. 'classrooms', 'community', 'school' */
  readonly domain: string;
  /**
   * Method names on this domain's API object that support ghost injection.
   * Only read methods (getX / listX) make sense here.
   */
  readonly ghostMethods: ReadonlyArray<string>;
  /**
   * Returns true if realData is considered "empty" for this method, triggering
   * ghost injection. The `method` parameter allows per-method emptiness logic.
   */
  isEmpty(method: string, realData: unknown): boolean;
  /**
   * Returns the sample records for a given method + args.
   * Called only when isEmpty() returns true.
   */
  getSamples(method: string, args: unknown[]): unknown;
}

const _registry = new Map<string, SandboxDomainConfig>();

/**
 * Register a domain's sandbox config. Call this at module load time inside
 * each API module file (classrooms.ts, community.ts, etc.).
 *
 * Idempotent — re-registering the same domain replaces the previous entry.
 */
export function registerSandboxDomain(config: SandboxDomainConfig): void {
  _registry.set(config.domain, config);
}

/**
 * Look up the sandbox config for a given domain key.
 * Returns undefined if the domain has not been registered.
 */
export function getSandboxDomainConfig(domain: string): SandboxDomainConfig | undefined {
  return _registry.get(domain);
}

/** Visible for testing only — not part of the public API surface. */
export function _getSandboxRegistry(): ReadonlyMap<string, SandboxDomainConfig> {
  return _registry;
}

/**
 * Synchronous accessor for registered sandbox sample data.
 * Ideal for SSR floors, initial hook states, and synchronous fallbacks
 * without directly importing monolithic mock constants.
 */
export function getSandboxSamples<T = unknown>(
  domain: string,
  method: string,
  args: unknown[] = [],
  fallback?: T,
): T {
  const config = _registry.get(domain);
  if (!config) return fallback as T;
  const samples = config.getSamples(method, args);
  return (samples ?? fallback) as T;
}

// ---------------------------------------------------------------------------
// Shared emptiness helpers (reused across domain registrations below)
// ---------------------------------------------------------------------------

/** True when realData is an array with no elements. */
export function isEmptyArray(data: unknown): boolean {
  return Array.isArray(data) && data.length === 0;
}

/** True when realData is nullish or an empty array. */
export function isEmptyOrNull(data: unknown): boolean {
  return data == null || isEmptyArray(data);
}

// ---------------------------------------------------------------------------
// Decentralized Domain Registration Protocol
// ---------------------------------------------------------------------------
// Each API domain self-registers upon import by calling `registerSandboxDomain()`
// directly within its domain file (e.g., classrooms.ts, community.ts, library.ts,
// attendance.ts, resources.ts, echo.ts, etc.).
// ---------------------------------------------------------------------------

