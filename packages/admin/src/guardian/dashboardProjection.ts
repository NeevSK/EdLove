import { api } from '@repo/core/api';

import type { GuardianDashboardData } from '@/guardian/types';

export async function buildGuardianDashboard(guardianId: string): Promise<GuardianDashboardData> {
  return api.guardian.getDashboard(guardianId) as Promise<GuardianDashboardData>;
}
