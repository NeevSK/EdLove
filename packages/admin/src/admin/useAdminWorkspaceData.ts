import { useEffect, useState } from 'react';
import { supabase } from '@repo/core';

export interface AdminWorkspaceData {
  schoolCount: number;
  userCount: number;
  incidentCount: number;
  pendingApprovalCount: number;
  recentSchools: Array<{ id: string; name: string | null; created_at?: string | null }>;
  recentUsers: Array<{ id: string; full_name: string | null; role?: string | null; school_id?: string | null }>;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_DATA: AdminWorkspaceData = {
  schoolCount: 0,
  userCount: 0,
  incidentCount: 0,
  pendingApprovalCount: 0,
  recentSchools: [],
  recentUsers: [],
  isLoading: true,
  error: null,
};

export function useAdminWorkspaceData() {
  const [data, setData] = useState<AdminWorkspaceData>(INITIAL_DATA);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [
          schools,
          users,
          pendingLeaves,
          recentSchoolsResult,
          recentUsersResult,
        ] = await Promise.all([
          supabase.from('schools').select('id', { count: 'exact', head: true }),
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('staff_leaves').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('schools').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('users').select('id, full_name, role, school_id').order('created_at', { ascending: false }).limit(5),
        ]);

        if (cancelled) return;

        setData({
          schoolCount: schools.count ?? 0,
          userCount: users.count ?? 0,
          incidentCount: pendingLeaves.count ?? 0,
          pendingApprovalCount: pendingLeaves.count ?? 0,
          recentSchools: (recentSchoolsResult.data ?? []) as AdminWorkspaceData['recentSchools'],
          recentUsers: (recentUsersResult.data ?? []) as AdminWorkspaceData['recentUsers'],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setData((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load admin workspace data',
        }));
      };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
