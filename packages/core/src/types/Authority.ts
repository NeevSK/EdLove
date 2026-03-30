import { Role } from '../permissions/schemas/role.schema';

export type AuthorityTier = Role;
export type { Role as PlatformAuthority }; // Transitional aliases
export type { Role as SchoolAuthority };
export type { Role as WorkCapacity };
export type SchoolRole = Role;
export type WorkRole = Role;

