import { historyAPI, supabase } from '@repo/core/api';

import { useEffect, useState } from 'react';
import { getAdminAuditEntries } from '@/admin/adminControl';

export interface AdminWorkspaceSnapshot {
  schoolCount: number;
  userCount: number;
  incidentCount: number;
  pendingApprovalCount: number;
  inviteCount: number;
  inventoryRequestCount: number;
  recentIncidentSignals: Array<{
    id: string;
    title: string;
    schoolId: string;
    createdAt: string;
    status: string;
  }>;
  recentApprovals: Array<{
    id: string;
    title: string;
    schoolId: string;
    createdAt: string;
    status: string;
  }>;
  recentInventoryRequests: Array<{
    id: string;
    schoolId: string;
    status: string;
    createdAt: string;
    title: string;
  }>;
  recentSchools: Array<{
    id: string;
    name: string | null;
    created_at?: string | null;
  }>;
  recentUsers: Array<{
    id: string;
    full_name: string | null;
    role?: string | null;
    school_id?: string | null;
  }>;
  recentInvites: Array<{
    code: string;
    role: string;
    is_active?: boolean | null;
    uses_count?: number | null;
    max_uses?: number | null;
    school_id?: string | null;
  }>;
  recentObservations: Array<{
    id: string;
    type: string;
    content: string;
    created_at: string;
  }>;
}

const emptySnapshot: AdminWorkspaceSnapshot = {
  schoolCount: 0,
  userCount: 0,
  incidentCount: 0,
  pendingApprovalCount: 0,
  inviteCount: 0,
  inventoryRequestCount: 0,
  recentIncidentSignals: [],
  recentApprovals: [],
  recentInventoryRequests: [],
  recentSchools: [],
  recentUsers: [],
  recentInvites: [],
  recentObservations: [],
};

export const adminRepository = {
  async getWorkspaceSnapshot(): Promise<AdminWorkspaceSnapshot> {
    const [
      schools,
      users,
      pendingLeaves,
      recentSchoolsResult,
      recentUsersResult,
      recentLeavesResult,
      recentInvitesResult,
      recentObservationsResult,
      inventoryRequests,
    ] = await Promise.all([
      supabase.from('schools').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase
        .from('staff_leaves')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('schools')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('users')
        .select('id, full_name, role, school_id')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('staff_leaves')
        .select('id, leave_type, school_id, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('invite_codes')
        .select('code, role, is_active, uses_count, max_uses, school_id')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('school_echo_feedback')
        .select('id, type, content, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('inventory_requests')
        .select('id, school_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return {
      ...emptySnapshot,
      schoolCount: schools.count ?? 0,
      userCount: users.count ?? 0,
      incidentCount: pendingLeaves.count ?? 0,
      pendingApprovalCount: pendingLeaves.count ?? 0,
      inviteCount: recentInvitesResult.data?.length ?? 0,
      inventoryRequestCount: inventoryRequests.data?.length ?? 0,
      recentIncidentSignals: (recentLeavesResult.data ?? []).map((item: any) => ({
        id: item.id,
        title: `${item.leave_type} leave`,
        schoolId: item.school_id,
        createdAt: item.created_at,
        status: item.status,
      })),
      recentApprovals: (recentLeavesResult.data ?? []).slice(0, 5).map((item: any) => ({
        id: item.id,
        title: `${item.leave_type} leave`,
        schoolId: item.school_id,
        createdAt: item.created_at,
        status: item.status,
      })),
      recentInventoryRequests: (inventoryRequests.data ?? []).map((item: any) => ({
        id: item.id,
        title: item.status === 'pending' ? 'Pending request' : 'Inventory request',
        schoolId: item.school_id,
        createdAt: item.created_at,
        status: item.status,
      })),
      recentSchools: (recentSchoolsResult.data ?? []) as AdminWorkspaceSnapshot['recentSchools'],
      recentUsers: (recentUsersResult.data ?? []) as AdminWorkspaceSnapshot['recentUsers'],
      recentInvites: (recentInvitesResult.data ?? []) as AdminWorkspaceSnapshot['recentInvites'],
      recentObservations: (recentObservationsResult.data ??
        []) as AdminWorkspaceSnapshot['recentObservations'],
    };
  },

  async getAuditTrail() {
    return getAdminAuditEntries();
  },

  async getRecordHistory(tableName: string, recordId: string) {
    return historyAPI.getForRecord(tableName, recordId);
  },
};

export function useAdminWorkspaceSnapshot() {
  const [snapshot, setSnapshot] = useState<AdminWorkspaceSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await adminRepository.getWorkspaceSnapshot();
        if (cancelled) return;
        setSnapshot(next);
        setError(null);
      } catch (caughtError) {
        if (cancelled) return;
        setError(
          caughtError instanceof Error ? caughtError.message : 'Failed to load admin snapshot',
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, isLoading, error };
}
