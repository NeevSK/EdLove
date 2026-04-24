import { api } from '@repo/core';
import type { GuardianDashboard } from './types';

export async function buildGuardianDashboard(guardianId: string): Promise<GuardianDashboard> {
  return api.guardian.getDashboard(guardianId) as Promise<GuardianDashboard>;
}
