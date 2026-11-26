import type { Capacity } from '@repo/core/types/Authority';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface ClassroomJoinRequest {
  id: string;
  user_id: string;
  classroom_id: string;
  capacity: Capacity; // 'student' | 'subject_teacher'
  subject_label?: string;
  status: RequestStatus;
  message?: string;
  created_at: string;
  updated_at: string;
}
