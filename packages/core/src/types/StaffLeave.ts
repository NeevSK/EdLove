export type LeaveType = 'sick' | 'casual' | 'annual' | 'maternity' | 'duty';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface StaffLeave {
  id: string;
  user_id: string;
  school_id: string;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  reason?: string;
  status: LeaveStatus;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
}
