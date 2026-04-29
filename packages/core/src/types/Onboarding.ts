import type { AuthorityTier } from './Authority';

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
