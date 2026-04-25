import type { GuardianDashboardData } from './types';
 
export async function buildGuardianDashboard(guardianId: string): Promise<GuardianDashboardData> {
  return api.guardian.getDashboard(guardianId) as Promise<GuardianDashboardData>;
}
