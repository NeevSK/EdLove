import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
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

async function getStoredList<T>(key: string): Promise<T[]> {
  try {
    const raw = await SafeZustandStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const peopleDirectoryAPI = {
  async listBySchool(
    schoolId: string,
    options?: {
      personKind?: 'all' | 'staff' | 'student';
    },
  ): Promise<PeopleDirectoryEntry[]> {
    const bondRows = await getStoredList<BondSeed>(`school_bonds:${schoolId}`);
    let filteredBonds = bondRows;
    if (options?.personKind === 'student') {
      filteredBonds = filteredBonds.filter((b) => b.capacity === 'student');
    } else if (options?.personKind === 'staff') {
      filteredBonds = filteredBonds.filter((b) => b.capacity !== 'student');
    }

    const userIds = Array.from(new Set(filteredBonds.map((b) => b.user_id).filter(Boolean)));
    if (userIds.length === 0) return [];

    const allUsers = await getStoredList<User>('directory_users');
    const userRows = allUsers.filter((u) => userIds.includes(u.id));

    const bondByUserId = new Map(filteredBonds.map((b) => [b.user_id, b]));
    return userRows
      .map((row) => {
        const bond = bondByUserId.get(row.id);
        return bond ? mapDirectoryEntry(row, bond) : null;
      })
      .filter(Boolean) as PeopleDirectoryEntry[];
  },

  async getPerson(userId: string): Promise<PeopleDirectoryEntry | null> {
    const allUsers = await getStoredList<User>('directory_users');
    const userRow = allUsers.find((u) => u.id === userId);
    if (!userRow) return null;

    const schoolId = userRow.school_id as string | null | undefined;
    if (!schoolId) {
      return {
        ...userRow,
        schoolCapacity: null,
        workCapacities: [],
        personKind: 'staff',
      } as PeopleDirectoryEntry;
    }

    const bondRows = await getStoredList<BondSeed>(`school_bonds:${schoolId}`);
    const bondRow = bondRows.find((b) => b.user_id === userId);

    const bond: BondSeed = bondRow ?? {
      user_id: userId,
      entity_id: schoolId,
      entity_type: 'SCHOOL',
      capacity: null,
    };

    return mapDirectoryEntry(userRow, bond);
  },

  async listStaff(schoolId: string): Promise<PeopleDirectoryEntry[]> {
    return this.listBySchool(schoolId, { personKind: 'staff' });
  },

  async listStudents(schoolId: string): Promise<PeopleDirectoryEntry[]> {
    return this.listBySchool(schoolId, { personKind: 'student' });
  },
};
