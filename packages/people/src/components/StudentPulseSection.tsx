import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, Text, SkeletonCard, useThemedColors, Theme } from '@repo/ui';
import { ChevronRight, TrendingUp } from 'lucide-react-native';
import { staffOperationsAPI, type StudentPrincipalPulse } from '../staff';

interface StudentPulseSectionProps {
  schoolId: string;
  classroomId?: string;
  onViewAtRisk?: () => void;
  onViewEnrollments?: () => void;
  onViewFullReport?: () => void;
}

function attendanceColor(rate: number): string {
  if (rate >= 90) return Theme.colors.sageGreen ?? '#4caf50';
  if (rate >= 75) return Theme.colors.amberGlow ?? '#ffc107';
  return Theme.colors.emberRed ?? '#f44336';
}

export default function StudentPulseSection({
  schoolId,
  classroomId,
  onViewAtRisk,
  onViewEnrollments,
  onViewFullReport,
}: StudentPulseSectionProps) {
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState<StudentPrincipalPulse | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const pulseData = await staffOperationsAPI.getStudentPrincipalPulse(schoolId, classroomId);
      if (!mounted) return;
      setPulse(pulseData);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [schoolId, classroomId]);

  if (loading) {
    return (
      <VStack sx={{ gap: Theme.spacing.sm }}>
        <SkeletonCard height={80} />
        <SkeletonCard height={56} />
      </VStack>
    );
  }

  const delta = pulse ? pulse.todayRate - pulse.yesterdayRate : 0;
  const deltaLabel = delta > 0 ? `+${delta}% vs yesterday` : delta < 0 ? `${delta}% vs yesterday` : 'same as yesterday';
  const deltaColor = delta >= 0 ? colors.success : colors.error;

  return (
    <VStack sx={{ gap: Theme.spacing.sm }}>
      <HStack sx={{ gap: Theme.spacing.sm }}>
        <Box
          sx={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text sx={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>Attendance Today</Text>
          <Text
            sx={{
              fontSize: 28,
              fontWeight: '700',
              color: pulse ? attendanceColor(pulse.todayRate) : colors.text,
            }}
          >
            {pulse ? `${pulse.todayRate}%` : '-'}
          </Text>
          <Text sx={{ fontSize: 11, color: deltaColor }}>{pulse ? deltaLabel : ''}</Text>
        </Box>

        <Box
          sx={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text sx={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>Submissions This Week</Text>
          <Text sx={{ fontSize: 28, fontWeight: '700', color: colors.text }}>
            {pulse?.submissionRate !== null && pulse?.submissionRate !== undefined ? `${pulse.submissionRate}%` : '-'}
          </Text>
          <Text sx={{ fontSize: 11, color: colors.textSecondary }}>of assignments</Text>
        </Box>
      </HStack>

      <HStack sx={{ gap: Theme.spacing.sm }}>
        <TouchableOpacity onPress={onViewAtRisk} activeOpacity={0.8} style={{ flex: 1 }}>
          <Box
            sx={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: Theme.corners.comfortable,
              padding: Theme.spacing.md,
              borderWidth: 1,
              borderColor: (pulse?.atRiskCount ?? 0) > 0 ? colors.error : colors.border,
            }}
          >
            <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
              <Box
                sx={{
                  backgroundColor: colors.error,
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{pulse?.atRiskCount ?? 0}</Text>
              </Box>
              <Text sx={{ fontSize: 12, color: colors.text, flex: 1 }}>At-risk students</Text>
            </HStack>
            {onViewAtRisk && <Text sx={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Tap to review</Text>}
          </Box>
        </TouchableOpacity>

        {!classroomId && (
          <TouchableOpacity onPress={onViewEnrollments} activeOpacity={0.8} style={{ flex: 1 }}>
            <Box
              sx={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: Theme.corners.comfortable,
                padding: Theme.spacing.md,
                borderWidth: 1,
                borderColor: (pulse?.pendingEnrollments ?? 0) > 0 ? colors.warning : colors.border,
              }}
            >
              <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
                <Box
                  sx={{
                    backgroundColor: colors.warning,
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{pulse?.pendingEnrollments ?? 0}</Text>
                </Box>
                <Text sx={{ fontSize: 12, color: colors.text, flex: 1 }}>Pending enrollments</Text>
                <ChevronRight size={16} color={colors.textTertiary} />
              </HStack>
              {onViewEnrollments && (
                <Text sx={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Tap to review</Text>
              )}
            </Box>
          </TouchableOpacity>
        )}
      </HStack>

      {onViewFullReport && (
        <TouchableOpacity onPress={onViewFullReport} activeOpacity={0.7}>
          <HStack
            sx={{
              marginTop: Theme.spacing.sm,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text sx={{ fontSize: 12, fontWeight: '700', color: colors.action }}>VIEW FULL ANALYTICS</Text>
            <TrendingUp size={14} color={colors.action} />
          </HStack>
        </TouchableOpacity>
      )}
    </VStack>
  );
}
