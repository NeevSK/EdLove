export type LeaveType = 'sick' | 'casual' | 'annual' | 'maternity' | 'duty';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface StaffLeave {
  id: string;
  user_id: string;
  school_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason?: string;
  status: LeaveStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}
