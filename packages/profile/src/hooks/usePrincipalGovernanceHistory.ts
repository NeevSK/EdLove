import { studentsAPI } from '@repo/core/api/client';
import type { PrincipalGovernanceRecord } from '@repo/core/logic';
import { useQuery } from '@tanstack/react-query';

export function usePrincipalGovernanceHistory(principalId?: string) {
  return useQuery({
    queryKey: ['principal-governance-history', principalId],
    queryFn: async () => {
      if (!principalId) return [];
      const records = await studentsAPI.getHistoricalGovernanceRecords(principalId);
      return records as PrincipalGovernanceRecord[];
    },
    enabled: !!principalId,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}
