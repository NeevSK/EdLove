import { storage } from '@repo/core/lib/storage';
import type {
  FacultyMember,
  StaffLeaveRecord,
  WorkforceMetrics,
} from './types';

const LEAVE_STORAGE_KEY = 'gurudevi:workforce:leave_requests';
const FACULTY_STORAGE_KEY = 'gurudevi:workforce:faculty';

export const CANONICAL_FACULTY: FacultyMember[] = [
  {
    id: 'fac-1',
    userId: 'usr-teacher-karunaratne',
    name: 'Bandula Karunaratne',
    role: 'Senior Science Master',
    family: 'academic',
    department: 'Biological Sciences',
    email: 'b.karunaratne@ananda.ac.lk',
    active: true,
    allocatedClasses: ['Grade 10A Science', 'Grade 11B Biology'],
    leaveBalance: { casual: 14, medical: 18, duty: 5 },
  },
  {
    id: 'fac-2',
    userId: 'usr-history-head',
    name: 'Sunil Jayawardena',
    role: 'Head of Humanities',
    family: 'academic',
    department: 'History & Archeology',
    email: 's.jayawardena@ananda.ac.lk',
    active: true,
    allocatedClasses: ['Grade 10A History', 'Grade 12 Arts'],
    leaveBalance: { casual: 10, medical: 21, duty: 7 },
  },
  {
    id: 'fac-3',
    userId: 'usr-pantry-matron',
    name: 'Chitra Wickramasinghe',
    role: 'Nutrition & Pantry Director',
    family: 'food_service',
    department: 'Pantry Operations',
    email: 'c.wickramasinghe@ananda.ac.lk',
    active: true,
    allocatedClasses: [],
    leaveBalance: { casual: 12, medical: 14, duty: 0 },
  },
  {
    id: 'fac-4',
    userId: 'usr-wellbeing-counselor',
    name: 'Dr. Nirmala Perera',
    role: 'Sanctuary Somatic Counselor',
    family: 'wellbeing',
    department: 'Student Care Circle',
    email: 'n.perera@ananda.ac.lk',
    active: true,
    allocatedClasses: ['Sanctuary Mindfulness Circle'],
    leaveBalance: { casual: 16, medical: 20, duty: 4 },
  },
  {
    id: 'fac-5',
    userId: 'usr-facilities-lead',
    name: 'Gamini Rathnayake',
    role: 'Campus Facilities Superintendent',
    family: 'facilities',
    department: 'Estate & Logistics',
    email: 'g.rathnayake@ananda.ac.lk',
    active: true,
    allocatedClasses: [],
    leaveBalance: { casual: 8, medical: 15, duty: 2 },
  },
];

export const CANONICAL_LEAVE_REQUESTS: StaffLeaveRecord[] = [
  {
    id: 'leave-101',
    schoolId: 'school-ananda-colombo',
    userId: 'usr-teacher-karunaratne',
    staffName: 'Bandula Karunaratne',
    role: 'Senior Science Master',
    leaveType: 'casual',
    startDate: '2026-10-27',
    endDate: '2026-10-28',
    reason: 'Family religious observance at Kelaniya Raja Maha Vihara',
    status: 'approved',
    reviewedBy: 'usr-principal-colombo',
    reviewedAt: '2026-10-25T14:30:00Z',
    substituteId: 'fac-2',
    substituteName: 'Sunil Jayawardena',
    createdAt: '2026-10-24T09:15:00Z',
  },
  {
    id: 'leave-102',
    schoolId: 'school-ananda-colombo',
    userId: 'usr-history-head',
    staffName: 'Sunil Jayawardena',
    role: 'Head of Humanities',
    leaveType: 'duty',
    startDate: '2026-11-02',
    endDate: '2026-11-03',
    reason: 'Ministry of Education Archaeological Curriculum Committee Meeting',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    substituteId: null,
    substituteName: null,
    createdAt: '2026-10-25T11:00:00Z',
  },
];

export class WorkforceService {
  static async getFaculty(_schoolId = 'school-ananda-colombo'): Promise<FacultyMember[]> {
    try {
      const cached = storage.getString(FACULTY_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached) as FacultyMember[];
      }
    } catch {
      // Fallback to in-memory
    }
    return CANONICAL_FACULTY;
  }

  static async getLeaveRequests(_schoolId = 'school-ananda-colombo'): Promise<StaffLeaveRecord[]> {
    try {
      const cached = storage.getString(LEAVE_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached) as StaffLeaveRecord[];
      }
    } catch {
      // Fallback
    }
    return CANONICAL_LEAVE_REQUESTS;
  }

  static async submitLeaveRequest(
    request: Omit<StaffLeaveRecord, 'id' | 'createdAt' | 'status' | 'reviewedBy' | 'reviewedAt'>,
  ): Promise<StaffLeaveRecord> {
    const existing = await this.getLeaveRequests(request.schoolId);
    const newRecord: StaffLeaveRecord = {
      ...request,
      id: 'leave-' + Date.now().toString(36),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...existing];
    try {
      storage.set(LEAVE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    return newRecord;
  }

  static async reviewLeaveRequest(
    leaveId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    substituteId?: string,
  ): Promise<StaffLeaveRecord> {
    const list = await this.getLeaveRequests();
    const faculty = await this.getFaculty();
    const sub = substituteId ? faculty.find((f) => f.id === substituteId) : undefined;

    let target: StaffLeaveRecord | undefined;
    const updated = list.map((item) => {
      if (item.id === leaveId) {
        target = {
          ...item,
          status,
          reviewedBy: reviewerId,
          reviewedAt: new Date().toISOString(),
          substituteId: substituteId ?? item.substituteId,
          substituteName: sub?.name ?? item.substituteName,
        };
        return target;
      }
      return item;
    });

    if (!target) {
      throw new Error('Leave request not found: ' + leaveId);
    }

    try {
      storage.set(LEAVE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    return target;
  }

  static async getMetrics(schoolId = 'school-ananda-colombo'): Promise<WorkforceMetrics> {
    const faculty = await this.getFaculty(schoolId);
    const leaves = await this.getLeaveRequests(schoolId);

    const now = new Date().toISOString().slice(0, 10);
    const activeLeaves = leaves.filter(
      (l) => l.status === 'approved' && l.startDate <= now && l.endDate >= now,
    );
    const pending = leaves.filter((l) => l.status === 'pending');

    const totalStaff = faculty.length;
    const onLeaveCount = activeLeaves.length;
    const activeCount = Math.max(0, totalStaff - onLeaveCount);
    const coverageRate = totalStaff > 0 ? Math.round((activeCount / totalStaff) * 100) : 100;

    return {
      totalStaff,
      activeToday: activeCount,
      onLeaveToday: onLeaveCount,
      pendingRequests: pending.length,
      coverageRatePercent: coverageRate,
    };
  }
}

export const workforceService = WorkforceService;
