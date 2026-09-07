import { CircleAlert, ClipboardCheck, TrendingUp, UserPlus, Users } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useEffect, useState } from 'react';
import { type StudentPrincipalPulse, staffOperationsAPI } from '@repo/admin/staff';

interface StudentPulseSectionProps {
  schoolId: string;
  classroomId?: string;
  onViewAtRisk?: () => void;
  onViewEnrollments?: () => void;
  onViewFullReport?: () => void;
}

export default function StudentPulseSection({
  schoolId,
  classroomId,
  onViewAtRisk,
  onViewEnrollments,
  onViewFullReport,
}: StudentPulseSectionProps) {
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState<StudentPrincipalPulse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const getAttendanceStatusInfo = (rate: number) => {
    if (rate >= 90)
      return {
        color: 'text-phase-success',
        bg: 'bg-phase-success/10',
        label: 'OPTIMAL',
      };
    if (rate >= 75)
      return {
        color: 'text-phase-interactive',
        bg: 'bg-phase-interactive/10',
        label: 'MONITOR',
      };
    return {
      color: 'text-phase-danger',
      bg: 'bg-phase-danger/10',
      label: 'CRITICAL',
    };
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const pulseData = await staffOperationsAPI.getStudentPrincipalPulse(schoolId, classroomId);
        if (!mounted) return;
        setPulse(pulseData);
      } catch (error) {
        console.error('Error fetching student pulse:', error);
        if (mounted) setLoadError('Student attendance data could not be loaded.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [schoolId, classroomId, retryKey]);

  if (loading) {
    return (
      <Box className="h-[200px] items-center justify-center bg-phase-canvas rounded-[32px] border border-dashed border-phase-border">
        <Spinner className="text-phase-interactive" />
      </Box>
    );
  }

  if (loadError) {
    return (
      <VStack className="gap-4 bg-phase-surface rounded-[28px] p-6 border border-phase-danger/30">
        <Text className="font-bold text-phaseText-primary">Student pulse unavailable</Text>
        <Text className="text-sm text-phaseText-secondary">{loadError}</Text>
        <Button
          variant="outline"
          onPress={() => setRetryKey((key) => key + 1)}
          accessibilityLabel="Retry loading student pulse"
        >
          <ButtonText>Try again</ButtonText>
        </Button>
      </VStack>
    );
  }

  const delta = pulse ? pulse.todayRate - pulse.yesterdayRate : 0;
  const deltaLabel =
    delta > 0 ? `+${delta}% vs yesterday` : delta < 0 ? `${delta}% vs yesterday` : 'STABLE';
  const deltaColor = delta >= 0 ? 'text-phase-success' : 'text-phase-danger';

  const attendanceInfo = pulse ? getAttendanceStatusInfo(pulse.todayRate) : null;

  return (
    <VStack className="gap-4">
      <HStack className="gap-4">
        <Box className="flex-1 bg-phase-surface rounded-[28px] p-6 border border-phase-border shadow-sm">
          <VStack className="gap-3">
            <HStack className="justify-between items-center">
              <Box className="p-2.5 rounded-xl bg-phase-interactive/10">
                <Icon as={Users} size="xs" className="text-phase-interactive" />
              </Box>
              <Box className={`px-2 py-0.5 rounded-md ${attendanceInfo?.bg || 'bg-phase-canvas'}`}>
                <Text
                  className={`text-[8px] font-black uppercase tracking-widest ${attendanceInfo?.color || 'text-phaseText-muted'}`}
                >
                  {attendanceInfo?.label || 'DATA'}
                </Text>
              </Box>
            </HStack>
            <VStack className="gap-0.5">
              <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
                Attendance Today
              </Text>
              <Text
                className={`text-3xl font-black ${attendanceInfo?.color || 'text-phaseText-primary'} tracking-tight`}
              >
                {pulse ? `${pulse.todayRate}%` : '-'}
              </Text>
            </VStack>
            <HStack className="gap-1.5 items-center">
              <Box
                className={`w-1.5 h-1.5 rounded-full ${delta >= 0 ? 'bg-phase-success' : 'bg-phase-danger'}`}
              />
              <Text className={`text-[10px] font-black uppercase tracking-widest ${deltaColor}`}>
                {deltaLabel}
              </Text>
            </HStack>
          </VStack>
        </Box>

        <Box className="flex-1 bg-phase-surface rounded-[28px] p-6 border border-phase-border shadow-sm">
          <VStack className="gap-3">
            <HStack className="justify-between items-center">
              <Box className="p-2.5 rounded-xl bg-phase-interactive/10">
                <Icon as={ClipboardCheck} size="xs" className="text-phase-interactive" />
              </Box>
              <Icon as={TrendingUp} size="xs" className="text-phase-success opacity-40" />
            </HStack>
            <VStack className="gap-0.5">
              <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
                Submissions
              </Text>
              <Text className="text-3xl font-black text-phaseText-primary tracking-tight">
                {pulse?.submissionRate !== null && pulse?.submissionRate !== undefined
                  ? `${pulse.submissionRate}%`
                  : '-'}
              </Text>
            </VStack>
            <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-widest opacity-60">
              Weekly Cycles
            </Text>
          </VStack>
        </Box>
      </HStack>

      <HStack className="gap-4">
        <Pressable
          onPress={() => {
            hapticLight();
            onViewAtRisk?.();
          }}
          className="flex-1 active:scale-[0.98] transition-all"
          disabled={!onViewAtRisk}
          accessibilityRole="button"
          accessibilityLabel={`${pulse?.atRiskCount ?? 0} students at risk`}
          accessibilityHint="Opens at-risk student review"
        >
          <Box
            className={`p-5 rounded-[24px] border ${
              (pulse?.atRiskCount ?? 0) > 0
                ? 'border-phase-danger/30 bg-phase-danger/5'
                : 'border-phase-border bg-phase-surface'
            } shadow-sm`}
          >
            <HStack className="items-center gap-3">
              <Box
                className={`p-2 rounded-lg ${(pulse?.atRiskCount ?? 0) > 0 ? 'bg-phase-danger' : 'bg-phaseText-muted/10'}`}
              >
                <Text className="text-[11px] font-black text-white leading-none">
                  {pulse?.atRiskCount ?? 0}
                </Text>
              </Box>
              <VStack className="flex-1 gap-0.5">
                <Text className="text-[13px] font-black text-phaseText-primary tracking-tight">
                  At-Risk Gate
                </Text>
                <Text className="text-[9px] font-bold text-phaseText-muted uppercase tracking-widest leading-none">
                  Review Required
                </Text>
              </VStack>
              <Icon as={CircleAlert} size="xs" className="text-phase-danger opacity-40" />
            </HStack>
          </Box>
        </Pressable>

        {!classroomId && (
          <Pressable
            onPress={() => {
              hapticLight();
              onViewEnrollments?.();
            }}
            className="flex-1 active:scale-[0.98] transition-all"
            disabled={!onViewEnrollments}
            accessibilityRole="button"
            accessibilityLabel={`${pulse?.pendingEnrollments ?? 0} pending enrollments`}
            accessibilityHint="Opens enrollment review"
          >
            <Box
              className={`p-5 rounded-[24px] border ${
                (pulse?.pendingEnrollments ?? 0) > 0
                  ? 'border-phase-interactive/30 bg-phase-interactive/5'
                  : 'border-phase-border bg-phase-surface'
              } shadow-sm`}
            >
              <HStack className="items-center gap-3">
                <Box
                  className={`p-2 rounded-lg ${(pulse?.pendingEnrollments ?? 0) > 0 ? 'bg-phase-interactive' : 'bg-phaseText-muted/10'}`}
                >
                  <Text className="text-[11px] font-black text-white leading-none">
                    {pulse?.pendingEnrollments ?? 0}
                  </Text>
                </Box>
                <VStack className="flex-1 gap-0.5">
                  <Text className="text-[13px] font-black text-phaseText-primary tracking-tight">
                    Enrollments
                  </Text>
                  <Text className="text-[9px] font-bold text-phaseText-muted uppercase tracking-widest leading-none">
                    Identity Pipeline
                  </Text>
                </VStack>
                <Icon as={UserPlus} size="xs" className="text-phase-interactive opacity-40" />
              </HStack>
            </Box>
          </Pressable>
        )}
      </HStack>

      {onViewFullReport && (
        <Pressable
          onPress={() => {
            hapticLight();
            onViewFullReport();
          }}
          className="mt-2"
          accessibilityRole="button"
          accessibilityLabel="Open full student analytics report"
        >
          <Box className="h-14 rounded-[20px] bg-phase-canvas border border-phase-border items-center justify-center flex-row gap-3 active:scale-95 transition-all">
            <Text className="text-[11px] font-black text-phase-interactive uppercase tracking-[3px]">
              Extract Full Analytics
            </Text>
            <Icon as={TrendingUp} size="xs" className="text-phase-interactive" />
          </Box>
        </Pressable>
      )}
    </VStack>
  );
}
