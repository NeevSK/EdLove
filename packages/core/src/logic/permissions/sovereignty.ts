import { type Capacity } from '@repo/core/logic/schemas/capacity.schema';

/**
 * Sovereign Ecosystem Stewardship Capacities.
 * Holds holistic multi-tenant platform stewardship, global ecosystem pulse,
 * chartering sanctuaries, and downward inspection/shadowing into any role.
 */
export const SOVEREIGN_STEWARD_CAPACITIES = new Set<string>(['founder', 'coFounder', 'director']);

/**
 * Technical Platform Operator Capacities.
 * Dedicated to diagnostics, profiling, sync metrics, logs, and developer tooling.
 * Has NO sovereign educational or strategic stewardship levers.
 */
export const TECHNICAL_OPERATOR_CAPACITIES = new Set<string>(['developer', 'systemEngineer']);

/**
 * Checks if a given capacity belongs to the Sovereign Stewardship tier.
 */
export const isSovereignSteward = (capacity?: string | null): boolean => {
  if (!capacity) return false;
  return SOVEREIGN_STEWARD_CAPACITIES.has(capacity);
};

/**
 * Checks if a given capacity belongs to Technical Platform Operators.
 */
export const isTechnicalOperator = (capacity?: string | null): boolean => {
  if (!capacity) return false;
  return TECHNICAL_OPERATOR_CAPACITIES.has(capacity);
};
