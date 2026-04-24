import { useQuery } from '@tanstack/react-query';
import {
  mappingAPI, 
  useTemporalStore, 
  useStore, 
  api as coreAPI,
  KnowledgeTopologySchema,
  type School,
  type SchoolStats,
  type PulseMetricsZod} from '@repo/core';
import { staffOperationsAPI } from '../staff';
import { approvalsAPI } from '../approvals';
import { adminCalendarAPI } from '../calendar';
import { adminInventoryAPI } from '../inventory';
import { insightsAPI } from '../insights';
import { observationsAPI } from '../observations';

/**
 * Hook for School Pulse (metrics like resonance score)
 */
export function useSchoolPulseQuery(schoolId: string) {
  const { viewDate, viewScale } = useTemporalStore();

  return useQuery({
    queryKey: ['school-pulse', schoolId, viewDate, viewScale],
    queryFn: () => coreAPI.profile.getSchoolPulse(schoolId, { viewDate, viewScale }) as Promise<PulseMetricsZod>,
    enabled: !!schoolId});
}

/**
 * Hook for mapping topology
 */
export function useMappingTopologyQuery(schoolId: string) {
  const { viewDate } = useTemporalStore();
  return useQuery({
    queryKey: ['mapping-topology', schoolId, viewDate],
    queryFn: async () => {
      const data = await mappingAPI.getSchoolPulse(schoolId, viewDate);
      return KnowledgeTopologySchema.parse(data);
    },
    enabled: !!schoolId});
}

/**
 * Hook for school stats and info
 */
export function useSchoolStatsQuery(schoolId: string) {
  const { viewDate } = useTemporalStore();
  const isDemoMode = useStore((state) => state.isDemoMode);
  return useQuery({
    queryKey: ['school-stats', schoolId, viewDate, isDemoMode],
    queryFn: async () => {
        // Migration of line 40+ from useSchoolStats.ts
        if (isDemoMode || !schoolId) {
            return {
                school: {
                    id: 'sample-school',
                    name: 'Wisdom Academy',
                    type: 'primary',
                    handle: 'wisdom-academy',
                    official_type: 'Primary',
                    status: 'active',
                    created_at: new Date().toISOString()} as School,
                stats: { 
                    is_sample: true, 
                    total_students: 450, 
                    total_teachers: 35, 
                    attendance_rate: 92,
                    total_classrooms: 12,
                    total_sections: 24
                } as SchoolStats
            };
        }
        const [school, stats] = await Promise.all([
            coreAPI.school.getSchool(schoolId),
            coreAPI.school.getSchoolStats(schoolId, viewDate)]);
        return { school, stats };
    },
    enabled: !!schoolId || isDemoMode});
}

/**
 * useStaffResonance
 * Manages all staff-related dashboard data (presence, carousel, pending approvals)
 */
export function useStaffResonance(schoolId: string) {
  const { viewDate } = useTemporalStore();

  const presence = useQuery({
    queryKey: ['staff-presence', schoolId, viewDate],
    queryFn: () => staffOperationsAPI.getStaffPresenceSummary(schoolId, viewDate),
    enabled: !!schoolId});

  const teachers = useQuery({
    queryKey: ['teachers-carousel', schoolId, viewDate],
    queryFn: () => staffOperationsAPI.getTeacherCarousel(schoolId, viewDate),
    enabled: !!schoolId});

  const pendingLeaves = useQuery({
    queryKey: ['pending-leaves', schoolId],
    queryFn: () => approvalsAPI.listPendingLeaveApprovals(schoolId),
    enabled: !!schoolId});

  return { presence, teachers, pendingLeaves };
}

/**
 * useCurriculumPulse
 * Manages student feedback echoes and curriculum progress
 */
export function useCurriculumPulse(schoolId: string) {
  const { viewDate } = useTemporalStore();

  const echoes = useQuery({
    queryKey: ['echo-items', schoolId, viewDate],
    queryFn: () => insightsAPI.listFeedbackEchoes(schoolId, 5, viewDate),
    enabled: !!schoolId});

  const progress = useQuery({
    queryKey: ['curriculum-progress', schoolId],
    queryFn: () => insightsAPI.listCurriculumProgress(schoolId),
    enabled: !!schoolId});

  return { echoes, progress };
}

/**
 * useOperationalAwareness
 * Manages resource needs, upcoming events, and recent observations
 */
export function useOperationalAwareness(schoolId: string, principalId: string) {
  const { viewDate } = useTemporalStore();

  const resourceNeeds = useQuery({
    queryKey: ['resource-needs', schoolId],
    queryFn: () => adminInventoryAPI.getResourceNeeds(schoolId),
    enabled: !!schoolId});

  const calendarEvents = useQuery({
    queryKey: ['calendar-events', schoolId, viewDate],
    queryFn: () => adminCalendarAPI.listUpcomingEvents(schoolId, 5, viewDate),
    enabled: !!schoolId});

  const observations = useQuery({
    queryKey: ['observations', principalId, viewDate],
    queryFn: () => observationsAPI.listByDate(principalId, viewDate, 10),
    enabled: !!principalId});

  return { resourceNeeds, calendarEvents, observations };
}
