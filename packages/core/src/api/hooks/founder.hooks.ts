import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import {
  EcosystemPulseSchema,
  EcosystemStatsSchema,
  GlobalUserSchema,
  SentinelAuditLogSchema,
} from '../../logic/schemas/founder.schema';
import { api } from '../index';

/**
 * Hook for ecosystem-wide statistics.
 */
export function useEcosystemStatsQuery() {
  return useQuery({
    queryKey: ['ecosystem-stats'],
    queryFn: async () => {
      const data = await api.founder.getEcosystemStats();
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
      const data = await api.founder.getEcosystemPulse();
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
      const data = await api.founder.getSentinelGovernance();
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
      const data = await api.founder.listAllUsers();
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
      return await api.founder.getAllSchools();
    },
  });
}
