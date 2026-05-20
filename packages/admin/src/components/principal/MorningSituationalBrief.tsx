/**
 * MorningSituationalBrief
 *
 * First thing the principal sees each morning:
 *  - Staff presence strip (X of Y teachers present)
 *  - Student attendance pulse (today % + delta vs yesterday)
 *  - At-risk student count badge
 *  - Pending leave approvals badge
 */

import {
  attendanceAPI,
  type StaffPresenceSummary,
  type StudentAttendancePulse,
  staffManagementAPI,
} from '@repo/core/api';

import { AlertCircle, ChevronRight, FileCheck, TrendingDown, TrendingUp } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useEffect, useState } from 'react';

interface MorningSituationalBriefProps {
  schoolId: string;
  onViewStaff?: () => void;
  onViewApprovals?: () => void;
}

export default function MorningSituationalBrief({
  schoolId,
  onViewStaff,
  onViewApprovals,
}: MorningSituationalBriefProps) {
  const [loading, setLoading] = useState(true);
  const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
  const [pulse, setPulse] = useState<StudentAttendancePulse | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  const getPresenceColorClass = (present: number, total: number): string => {
    if (total === 0) return 'bg-phaseText-muted';
    const pct = present / total;
    if (pct >= 0.9) return 'bg-phase-success';
    if (pct >= 0.7) return 'bg-phase-interactive';
    return 'bg-phase-danger';
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [pres, puls, leaves] = await Promise.all([
          staffManagementAPI.getStaffPresenceSummary(schoolId),
          attendanceAPI.getSchoolAttendancePulse(schoolId),
          staffManagementAPI.getPendingLeaves(schoolId),
        ]);
        if (!mounted) return;
        setPresence(pres);
        setPulse(puls);
        setPendingLeaves(leaves.length);
      } catch (error) {
        console.error('Error fetching morning brief:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [schoolId]);

  if (loading) {
    return (
      <VStack className="gap-3">
        <Box className="h-16 bg-phase-canvas border border-phase-border rounded-[24px] opacity-40 shadow-sm" />
        <HStack className="gap-3">
          <Box className="flex-1 h-28 bg-phase-canvas border border-phase-border rounded-[24px] opacity-30 shadow-sm" />
          <Box className="flex-1 h-28 bg-phase-canvas border border-phase-border rounded-[24px] opacity-20 shadow-sm" />
        </HStack>
      </VStack>
    );
  }

  const dotColorClass = presence
    ? getPresenceColorClass(presence.present, presence.total)
    : 'bg-phaseText-secondary';
  const attendanceDelta = pulse ? pulse.todayRate - pulse.yesterdayRate : 0;
  const deltaLabel = attendanceDelta >= 0 ? `+${attendanceDelta}%` : `${attendanceDelta}%`;

  return (
    <VStack className="gap-3">
      {/* Staff presence strip */}
      <Pressable
        onPress={() => {
          hapticLight();
          onViewStaff?.();
        }}
      >
        <Box className="bg-phase-surface rounded-[24px] px-5 py-4 border border-phase-border shadow-sm active:scale-[0.98] transition-all">
          <HStack className="items-center justify-between">
            <HStack className="items-center gap-4 flex-1">
              <Box className={`w-3 h-3 rounded-full ${dotColorClass} shadow-sm`} />
              <VStack className="gap-0.5">
                <Text className="text-[14px] text-phaseText-primary font-black tracking-tight">
                  {presence
                    ? `${presence.present} of ${presence.total} Faculty Present`
                    : 'Awaiting Presence Data'}
                </Text>
                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest opacity-60">
                  Status Check
                </Text>
              </VStack>
            </HStack>
            <Icon as={ChevronRight} size="xs" className="text-phaseText-muted/20" />
          </HStack>
        </Box>
      </Pressable>

      {/* Student pulse + at-risk + pending approvals */}
      <HStack className="gap-3">
        {/* Attendance pulse */}
        <Box className="flex-1 bg-phase-surface rounded-[24px] p-5 border border-phase-border shadow-sm">
          <VStack className="gap-4">
            <HStack className="justify-between items-start">
              <VStack className="gap-1">
                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest leading-none">
                  Scholar Pulse
                </Text>
                <Text className="text-[22px] font-black text-phaseText-primary tracking-tighter">
                  {pulse ? `${pulse.todayRate}%` : '—'}
                </Text>
              </VStack>
              <Box
                className={`p-1.5 rounded-lg ${attendanceDelta >= 0 ? 'bg-phase-success/10' : 'bg-phase-danger/10'}`}
              >
                <Icon
                  as={attendanceDelta >= 0 ? TrendingUp : TrendingDown}
                  size="xs"
                  className={attendanceDelta >= 0 ? 'text-phase-success' : 'text-phase-danger'}
                />
              </Box>
            </HStack>
            <Text
              className={`text-[10px] font-black uppercase tracking-wider ${attendanceDelta >= 0 ? 'text-phase-success' : 'text-phase-danger'}`}
            >
              {pulse ? `${deltaLabel} vs yesterday` : ''}
            </Text>
          </VStack>
        </Box>

        {/* At-risk badge */}
        <Box className="flex-1 bg-phase-surface rounded-[24px] p-5 border border-phase-border shadow-sm">
          <VStack className="gap-4">
            <HStack className="justify-between items-start">
              <VStack className="gap-1">
                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest leading-none">
                  At-Risk
                </Text>
                <Text
                  className={`text-[22px] font-black tracking-tighter ${
                    (pulse?.atRiskCount ?? 0) > 0 ? 'text-phase-danger' : 'text-phaseText-primary'
                  }`}
                >
                  {pulse?.atRiskCount ?? 0}
                </Text>
              </VStack>
              <Box className="p-1.5 rounded-lg bg-phase-danger/10">
                <Icon as={AlertCircle} size="xs" className="text-phase-danger" />
              </Box>
            </HStack>
            <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest opacity-60">
              Critical Path
            </Text>
          </VStack>
        </Box>

        {/* Pending approvals */}
        <Pressable
          onPress={() => {
            hapticLight();
            onViewApprovals?.();
          }}
          className="flex-1"
        >
          <Box className="h-full bg-phase-interactive rounded-[24px] p-5 shadow-md active:scale-95 transition-all">
            <VStack className="gap-4">
              <HStack className="justify-between items-start">
                <VStack className="gap-1">
                  <Text className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">
                    Pending
                  </Text>
                  <Text className="text-[22px] font-black text-white tracking-tighter">
                    {pendingLeaves}
                  </Text>
                </VStack>
                <Box className="p-1.5 rounded-lg bg-white/20">
                  <Icon as={FileCheck} size="xs" className="text-white" />
                </Box>
              </HStack>
              <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                Govern
              </Text>
            </VStack>
          </Box>
        </Pressable>
      </HStack>
    </VStack>
  );
}
