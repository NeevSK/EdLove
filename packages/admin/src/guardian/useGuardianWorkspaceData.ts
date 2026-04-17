import { useCallback, useEffect, useState } from 'react';
import { api } from '@repo/core';
import type { GuardianDashboard } from './types';

export function useGuardianWorkspaceData(guardianId: string) {
  const [dashboard, setDashboard] = useState<GuardianDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true);
            const dashboardData = await api.guardian.getDashboard(guardianId);
            setDashboard({
                ...dashboardData,
                guardianId: dashboardData.guardianId || guardianId
            } as GuardianDashboard);
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
    refreshData: loadDashboard};
}
