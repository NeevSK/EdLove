import { useMemo } from 'react';
import { type AdminWorkspaceSnapshot, useAdminWorkspaceSnapshot } from './adminRepository';

export interface AdminWorkspaceData {
  schoolCount: number;
  userCount: number;
  incidentCount: number;
  pendingApprovalCount: number;
  inviteCount: number;
  inventoryRequestCount: number;
  recentIncidentSignals: AdminWorkspaceSnapshot['recentIncidentSignals'];
  recentApprovals: AdminWorkspaceSnapshot['recentApprovals'];
  recentInventoryRequests: AdminWorkspaceSnapshot['recentInventoryRequests'];
  recentSchools: AdminWorkspaceSnapshot['recentSchools'];
  recentUsers: AdminWorkspaceSnapshot['recentUsers'];
  recentInvites: AdminWorkspaceSnapshot['recentInvites'];
  recentObservations: AdminWorkspaceSnapshot['recentObservations'];
  isLoading: boolean;
  error: string | null;
}

export function useAdminWorkspaceData() {
  const { snapshot, isLoading, error } = useAdminWorkspaceSnapshot();

  return useMemo<AdminWorkspaceData>(
    () => ({
      schoolCount: snapshot?.schoolCount ?? 0,
      userCount: snapshot?.userCount ?? 0,
      incidentCount: snapshot?.incidentCount ?? 0,
      pendingApprovalCount: snapshot?.pendingApprovalCount ?? 0,
      inviteCount: snapshot?.inviteCount ?? 0,
      inventoryRequestCount: snapshot?.inventoryRequestCount ?? 0,
      recentIncidentSignals: snapshot?.recentIncidentSignals ?? [],
      recentApprovals: snapshot?.recentApprovals ?? [],
      recentInventoryRequests: snapshot?.recentInventoryRequests ?? [],
      recentSchools: snapshot?.recentSchools ?? [],
      recentUsers: snapshot?.recentUsers ?? [],
      recentInvites: snapshot?.recentInvites ?? [],
      recentObservations: snapshot?.recentObservations ?? [],
      isLoading,
      error,
    }),
    [error, isLoading, snapshot],
  );
}
