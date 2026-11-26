import { TIERS, tierOf } from '../tooling/architecture-tiers.mjs';

/**
 * Tier classification for the architecture audits, from the standard in
 * tooling/architecture-tiers.mjs. Kept as the module the audits import.
 */
export const ARCHETYPES = Object.fromEntries(
  Object.values(TIERS).map(({ key, rank, name, icon }) => [key, { rank, name, icon }]),
);

export function classifyArchetype(path) {
  return TIERS[tierOf(path)].key;
}
