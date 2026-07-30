import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import {
  EcosystemPulseSchema,
  EcosystemStatsSchema,
  GlobalUserSchema,
  SentinelAuditLogSchema,
} from '@repo/core/logic/schemas/founder.schema';
import { founderAPI } from '@repo/core/api/founder';

/**
 * Hook for ecosystem-wide statistics.
 */
export function useEcosystemStatsQuery() {
  return useQuery({
    queryKey: ['ecosystem-stats'],
    queryFn: async () => {
      const data = await founderAPI.getEcosystemStats();
      return EcosystemStatsSchema.parse(data);
    },
  });
}

/**
 * Hook for ecosystem pulse (weather across schools).
 */
export function useEcosystemPulseQuery() {
  return useQuery({
    queryKey: ['ecosystem-pulse'],
    queryFn: async () => {
      const data = await founderAPI.getEcosystemPulse();
      return EcosystemPulseSchema.parse(data);
    },
    refetchInterval: 30000,
  });
}

/**
 * Hook for sentinel governance audit logs.
 */
export function useSentinelGovernanceQuery() {
  return useQuery({
    queryKey: ['sentinel-governance'],
    queryFn: async () => {
      const data = await founderAPI.getSentinelGovernance();
      return z.array(SentinelAuditLogSchema).parse(data);
    },
  });
}

/**
 * Hook for listing all users across the ecosystem.
 */
export function useGlobalUsersQuery() {
  return useQuery({
    queryKey: ['global-users'],
    queryFn: async () => {
      const data = await founderAPI.listAllUsers();
      return z.array(GlobalUserSchema).parse(data);
    },
  });
}

/**
 * Hook for listing all schools in the ecosystem.
 */
export function useAllSchoolsQuery() {
  return useQuery({
    queryKey: ['all-schools'],
    queryFn: async () => {
      return await founderAPI.getAllSchools();
    },
  });
}
