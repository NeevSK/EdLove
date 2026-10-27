export type WorkforceJobFamily =
  | 'academic'
  | 'operations'
  | 'finance'
  | 'wellbeing'
  | 'facilities'
  | 'transport'
  | 'food_service'
  | 'external_service';

export type StaffLeaveType = 'casual' | 'medical' | 'duty' | 'unpaid';

export type StaffLeaveStatus = 'pending' | 'approved' | 'rejected';

export interface WorkforcePosition {
  id: string;
  schoolId: string;
  title: string;
  family: WorkforceJobFamily;
  reportsToUserId?: string | null;
  active: boolean;
}

export interface WorkforceAssignment {
  id: string;
  userId: string;
  schoolId: string;
  positionId: string;
  startDate?: string | null;
  endDate?: string | null;
  status: 'active' | 'inactive' | 'planned';
}

export interface StaffLeaveRecord {
  id: string;
  schoolId: string;
  userId: string;
  staffName: string;
  role: string;
  leaveType: StaffLeaveType;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: StaffLeaveStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  substituteId?: string | null;
  substituteName?: string | null;
  createdAt: string;
}

export interface FacultyMember {
  id: string;
  userId: string;
  name: string;
  role: string;
  family: WorkforceJobFamily;
  department: string;
  email: string;
  active: boolean;
  allocatedClasses: string[];
  leaveBalance: {
    casual: number;
    medical: number;
    duty: number;
  };
}

export interface WorkforceMetrics {
  totalStaff: number;
  activeToday: number;
  onLeaveToday: number;
  pendingRequests: number;
  coverageRatePercent: number;
}
