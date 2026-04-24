import type { AuthorityTier } from '../types/Authority'; // Removed legacy UserRole export

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface SchoolJoinRequest {
  id: string;
  user_id: string;
  school_id: string;
  authority: AuthorityTier;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface ClassroomJoinRequest {
  id: string;
  user_id: string;
  classroom_id: string;
  role: AuthorityTier; // 'student' | 'subject_teacher'
  subject_label?: string;
  status: RequestStatus;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupReport {
  id: string;
  group_id: string;
  reporter_id: string;
  target_user_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}
