import { isSovereignSteward } from '@repo/core/logic/permissions/sovereignty';

/** The part of a session a capacity rule reads: the capacity in use and the selected bond's roles. */
export interface CapacityHolder {
  readonly capacity: string;
  readonly activeScope?: Readonly<{ roles: readonly string[] }>;
}

/** A named rule over who may open a floor: capacities that qualify, or bond roles that do. */
export type CapacityRule = (holder: CapacityHolder) => boolean;

/**
 * Accounts carry capacities as `CapacitySchema` names (`principal`, `assistantPrincipal`); development
 * previews and Explore personas name them in capitals (`PRINCIPAL`). No two capacities differ only
 * by case, so comparing without it reads both.
 */
function rule(capacities: readonly string[], roles: readonly string[]): CapacityRule {
  const allowed = new Set(capacities.map((capacity) => capacity.toLowerCase()));
  const allowedRoles = new Set(roles.map((role) => role.toLowerCase()));
  return (holder) =>
    allowed.has(holder.capacity.toLowerCase()) ||
    (holder.activeScope?.roles.some((role) => allowedRoles.has(role.toLowerCase())) ?? false);
}

/** School leadership and platform operators. */
export const leadership = rule(
  ['principal', 'assistantPrincipal', 'admin', 'founder', 'developer'],
  ['principal', 'admin', 'founder'],
);

/** Leadership including section and grade heads, who lead part of a school. */
export const schoolLeadership = rule(
  [
    'principal',
    'assistantPrincipal',
    'sectionHead',
    'section_head',
    'gradeHead',
    'founder',
    'developer',
    'admin',
  ],
  ['principal', 'admin', 'founder'],
);

/** Faculty and leadership. */
export const staff = rule(
  [
    'teacher',
    'principal',
    'assistantPrincipal',
    'gradeHead',
    'sectionHead',
    'admin',
    'founder',
    'developer',
  ],
  ['teacher', 'principal', 'admin', 'founder'],
);

/** Leadership and verified guardians. */
export const leadershipOrGuardian = rule(
  ['principal', 'assistantPrincipal', 'admin', 'founder', 'developer', 'guardian', 'parent'],
  ['principal', 'admin', 'founder', 'guardian'],
);

/** Sovereign platform stewards: founders, co-founders and executive directors. */
export const steward: CapacityRule = (holder) =>
  [holder.capacity, ...(holder.activeScope?.roles ?? [])].some(
    (capacity) => isSovereignSteward(capacity) || isSovereignSteward(capacity.toLowerCase()),
  );
