import { staffManagementAPI, type StaffLeaveDTO } from '@repo/core';

export type { StaffLeaveDTO };

export interface PendingApprovalItem {
  id: string;
  type: 'staff_leave';
  schoolId: string;
  createdAt: string;
  status: string;
  title: string;
  payload: StaffLeaveDTO;
}

export const approvalsAPI = {
  async listPendingLeaveApprovals(schoolId: string): Promise<StaffLeaveDTO[]> {
    return staffManagementAPI.getPendingLeaves(schoolId);
  },

  async listPendingApprovals(schoolId: string): Promise<PendingApprovalItem[]> {
    const leaves = await staffManagementAPI.getPendingLeaves(schoolId);
    return leaves.map((leave) => ({
      id: leave.id,
      type: 'staff_leave',
      schoolId: leave.school_id,
      createdAt: leave.created_at,
      status: leave.status,
      title: `${leave.leave_type} leave`,
      payload: leave,
    }));
  },

  async approveLeave(leaveId: string, principalId: string): Promise<boolean> {
    return staffManagementAPI.approveLeave(leaveId, principalId, true);
  },

  async rejectLeave(leaveId: string, principalId: string): Promise<boolean> {
    return staffManagementAPI.approveLeave(leaveId, principalId, false);
  },
};
