import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { APIError, type StaffAttendance, type StaffLeave } from '@repo/core/types';

async function getCollection<T>(key: string): Promise<T[]> {
  try {
    const raw = await SafeZustandStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setCollection<T>(key: string, items: T[]): Promise<void> {
  await SafeZustandStorage.setItem(key, JSON.stringify(items));
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export const staffAPI = {
  /**
   * Check-in staff
   */
  async checkIn(userId: string, schoolId: string, notes?: string): Promise<StaffAttendance> {
    const key = `staff_attendance:${userId}`;
    const all = await getCollection<StaffAttendance>(key);
    const newRecord: StaffAttendance = {
      id: uid('attendance'),
      user_id: userId,
      school_id: schoolId,
      notes,
      check_in: new Date().toISOString(),
      check_out: null,
      created_at: new Date().toISOString(),
    } as unknown as StaffAttendance;

    all.unshift(newRecord);
    await setCollection(key, all);
    return newRecord;
  },

  /**
   * Check-out staff
   */
  async checkOut(userId: string): Promise<StaffAttendance> {
    const key = `staff_attendance:${userId}`;
    const all = await getCollection<StaffAttendance>(key);
    const latestIndex = all.findIndex((a) => !a.check_out);

    if (latestIndex < 0) {
      throw new APIError('No active check-in found', 'NOT_FOUND');
    }

    const updated: StaffAttendance = {
      ...all[latestIndex]!,
      check_out: new Date().toISOString(),
    };

    all[latestIndex] = updated;
    await setCollection(key, all);
    return updated;
  },

  /**
   * Get staff attendance history
   */
  async getAttendance(userId: string): Promise<StaffAttendance[]> {
    const key = `staff_attendance:${userId}`;
    const all = await getCollection<StaffAttendance>(key);
    return all.sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime());
  },

  /**
   * Submit leave request
   */
  async submitLeave(leave: Omit<StaffLeave, 'id' | 'status' | 'created_at'>): Promise<StaffLeave> {
    const key = `staff_leaves:${leave.user_id}`;
    const all = await getCollection<StaffLeave>(key);
    const newRecord: StaffLeave = {
      id: uid('leave'),
      status: 'pending',
      created_at: new Date().toISOString(),
      ...leave,
    } as unknown as StaffLeave;

    all.unshift(newRecord);
    await setCollection(key, all);
    return newRecord;
  },

  /**
   * Get staff leaves
   */
  async getLeaves(userId: string): Promise<StaffLeave[]> {
    const key = `staff_leaves:${userId}`;
    const all = await getCollection<StaffLeave>(key);
    return all.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  },
};
