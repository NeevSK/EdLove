import { useCallback, useEffect, useState } from 'react';
import type { GuardianDashboardData } from '@repo/admin/guardian/types';
import { guardianAPI } from '@repo/admin/guardian/api';

export function useGuardianWorkspaceData(guardianId: string) {
  const [dashboard, setDashboard] = useState<GuardianDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const dashboardData = await guardianAPI.getGuardianDashboard(guardianId);
      setDashboard({
        ...dashboardData,
        guardianId: dashboardData.guardianId || guardianId,
      } as GuardianDashboardData);
      setError(null);
    } catch (caughtError: any) {
      console.error('Failed to load guardian workspace data', caughtError);
      setDashboard(null);
      setError(caughtError.message || 'Failed to load guardian dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [guardianId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,
    isLoading,
    error,
    refreshData: loadDashboard,
  };
}
