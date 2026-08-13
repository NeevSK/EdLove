import { api } from '@repo/core/api/client';

import type { GuardianDashboardData } from '@repo/admin/guardian/types';

export async function buildGuardianDashboard(guardianId: string): Promise<GuardianDashboardData> {
  return api.guardian.getDashboard(guardianId) as Promise<GuardianDashboardData>;
}
