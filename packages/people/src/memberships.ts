import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import type { Membership, ScopeRef } from '@repo/core/types';

interface BondSeed {
  id: string;
  user_id: string;
  entity_id: string;
  entity_type: string;
  capacity: string | null;
  status?: string | null;
  metadata?: unknown;
  valid_from?: string | null;
  valid_until?: string | null;
  created_at?: string | null;
}

function buildScopes(bond: BondSeed): ScopeRef[] {
  const scopes: ScopeRef[] = [];
  if (bond.entity_id) {
    scopes.push({
      type: 'school',
      id: bond.entity_id,
      schoolId: bond.entity_id,
    });
  }
  return scopes;
}

function buildMembership(bond: BondSeed): Membership {
  const schoolId = bond.entity_id;
  const capacity = bond.capacity;
  return {
    userId: bond.user_id,
    schoolId,
    schoolRole: (capacity as unknown as Membership['schoolRole']) ?? null,
    workRoles: [],
    roles: [],
    scopes: buildScopes(bond),
    status: (bond.status as Membership['status']) ?? 'active',
    tenantKind: undefined,
  };
}

async function getStoredList<T>(key: string): Promise<T[]> {
  try {
    const raw = await SafeZustandStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const peopleMembershipsAPI = {
  async getSchoolMemberships(schoolId: string): Promise<Membership[]> {
    const bondRows = await getStoredList<BondSeed>(`school_bonds:${schoolId}`);
    return bondRows.map((row) => buildMembership(row));
  },

  async getUserMemberships(userId: string): Promise<Membership[]> {
    const bondRows = await getStoredList<BondSeed>(`user_bonds:${userId}`);
    return bondRows.map((row) => buildMembership(row));
  },
};
