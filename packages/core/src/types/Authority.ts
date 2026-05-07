import type { Capacity } from '../logic/schemas/capacity.schema';

export type AuthorityTier = Capacity;
export type { Capacity as PlatformAuthority, Capacity as SchoolAuthority, Capacity as WorkCapacity }; // Transitional aliases
export type SchoolRole = Capacity;
export type WorkRole = Capacity;
