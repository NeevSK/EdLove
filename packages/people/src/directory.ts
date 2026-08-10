import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import type { Capacity, User } from '@repo/core/types';
export interface PeopleDirectoryEntry extends User {
  schoolCapacity: Capacity | null;
  workCapacities: Capacity[];
  personKind: 'staff' | 'student';
}
interface BondSeed {
  user_id: string;
  entity_id: string;
  entity_type: string;
  capacity: string | null;
  status?: string | null;
}
function mapDirectoryEntry(user: User, bond: BondSeed): PeopleDirectoryEntry {
  const userWithTimestamps = {
    ...user,
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString(),
  };
  const schoolCapacity = (bond.capacity as Capacity) ?? null;
  return {
    ...userWithTimestamps,
    schoolCapacity,
    workCapacities: [],
    personKind: schoolCapacity === 'student' ? 'student' : 'staff',
  } as unknown as PeopleDirectoryEntry;
}
export const peopleDirectoryAPI = {
  async listBySchool(
    schoolId: string,
    options?: {
      personKind?: 'all' | 'staff' | 'student';
    },
  ): Promise<PeopleDirectoryEntry[]> {
    const { data: bondRows, error: bondError } = await supabase
      .from('bonds')
      .select('user_id, entity_id, entity_type, capacity, status')
      .eq('entity_type', 'SCHOOL')
      .eq('entity_id', schoolId);
    if (bondError) throw bondError;

    let filteredBonds = (bondRows ?? []) as BondSeed[];
    if (options?.personKind === 'student') {
      filteredBonds = filteredBonds.filter((b) => b.capacity === 'student');
    } else if (options?.personKind === 'staff') {
      filteredBonds = filteredBonds.filter((b) => b.capacity !== 'student');
    }

    const userIds = Array.from(new Set(filteredBonds.map((b) => b.user_id).filter(Boolean)));
    if (userIds.length === 0) return [];

    const { data: userRows, error: userError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds)
      .order('full_name', { ascending: true });
    if (userError) throw userError;

    const bondByUserId = new Map(filteredBonds.map((b) => [b.user_id, b]));
    return (userRows ?? [])
      .map((row) => {
        const bond = bondByUserId.get((row as User).id);
        return bond ? mapDirectoryEntry(row as User, bond) : null;
      })
      .filter(Boolean) as PeopleDirectoryEntry[];
  },
  async getPerson(userId: string): Promise<PeopleDirectoryEntry | null> {
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (userError) throw userError;
    if (!userRow) return null;

    const schoolId = (userRow as User).school_id as string | null | undefined;
    if (!schoolId) {
      return {
        ...(userRow as User),
        schoolCapacity: null,
        workCapacities: [],
        personKind: 'staff',
      } as PeopleDirectoryEntry;
    }

    const { data: bondRow, error: bondError } = await supabase
      .from('bonds')
      .select('user_id, entity_id, entity_type, capacity, status')
      .eq('entity_type', 'SCHOOL')
      .eq('entity_id', schoolId)
      .eq('user_id', userId)
      .maybeSingle();
    if (bondError) throw bondError;

    const bond =
      (bondRow as BondSeed | null) ??
      ({
        user_id: userId,
        entity_id: schoolId,
        entity_type: 'SCHOOL',
        capacity: null,
      } satisfies BondSeed);
    return mapDirectoryEntry(userRow as User, bond);
  },
  async listStaff(schoolId: string): Promise<PeopleDirectoryEntry[]> {
    return this.listBySchool(schoolId, { personKind: 'staff' });
  },
  async listStudents(schoolId: string): Promise<PeopleDirectoryEntry[]> {
    return this.listBySchool(schoolId, { personKind: 'student' });
  },
};
