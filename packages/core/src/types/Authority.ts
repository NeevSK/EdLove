import type { Role } from '../logic/schemas/role.schema';

export type AuthorityTier = Role;
export type { Role as PlatformAuthority, Role as SchoolAuthority, Role as WorkCapacity }; // Transitional aliases
export type SchoolRole = Role;
export type WorkRole = Role;
