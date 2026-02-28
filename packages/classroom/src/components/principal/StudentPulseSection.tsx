/**
 * StudentPulseSection
 *
 * Aggregate student health for the principal:
 *  - Attendance today (% + colour + delta vs yesterday)
 *  - Submission rate this week
 *  - At-risk badge (tappable)
 *  - Pending enrollments badge (tappable)
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, Text, SkeletonCard, useThemedColors } from '@repo/ui';
import { Theme } from '@repo/ui';
import { staffManagementAPI, StudentAttendancePulse, supabase } from '@repo/core';

interface StudentPulseSectionProps {
  schoolId: string;
  onViewAtRisk?: () => void;
  onViewEnrollments?: () => void;
}

function attendanceColor(rate: number): string {
  if (rate >= 90) return Theme.colors.sage ?? '#4caf50';
  if (rate >= 75) return Theme.colors.amberGlow ?? '#ffc107';
  return Theme.colors.roseQuartz ?? '#f44336';
}

function weekStartISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1; // Monday=0
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

export default function StudentPulseSection({
  schoolId,
  onViewAtRisk,
  onViewEnrollments,
}: StudentPulseSectionProps) {
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState<StudentAttendancePulse | null>(null);
  const [submissionRate, setSubmissionRate] = useState<number | null>(null);
  const [pendingEnrollments, setPendingEnrollments] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const weekStart = weekStartISO();

      // Fetch assignment IDs for this school this week — used to scope submissions correctly.
      const assignResult = await supabase
        .from('assignments')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .gte('created_at', weekStart);

      const assignmentIds = (assignResult.data ?? []).map((a) => a.id);
      const assignmentCount = assignResult.count ?? 0;

      const [pulseData, subsResult, enrollResult] = await Promise.all([
        staffManagementAPI.getStudentAttendancePulse(schoolId),
        assignmentIds.length > 0
          ? supabase
              .from('submissions')
              .select('assignment_id', { count: 'exact' })
              .in('assignment_id', assignmentIds)
          : Promise.resolve({ count: 0, data: [] }),
        supabase
          .from('enrollment_requests')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId)
          .eq('status', 'pending'),
      ]);

      if (!mounted) return;

      setPulse(pulseData);

      // Submission rate: submitted assignments / total assignments (not per-student)
      const submittedCount = subsResult.count ?? 0;
      if (assignmentCount > 0) {
        setSubmissionRate(Math.min(100, Math.round((submittedCount / assignmentCount) * 100)));
      } else {
        setSubmissionRate(null);
      }

      setPendingEnrollments(enrollResult.count ?? 0);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [schoolId]);

  if (loading) {
    return (
      <VStack sx={{ gap: Theme.spacing.sm }}>
        <SkeletonCard height={80} />
        <SkeletonCard height={56} />
      </VStack>
    );
  }

  const delta = pulse ? pulse.todayRate - pulse.yesterdayRate : 0;
  const deltaLabel =
    delta > 0
      ? `+${delta}% vs yesterday`
      : delta < 0
      ? `${delta}% vs yesterday`
      : 'same as yesterday';
  const deltaColor =
    delta >= 0 ? (Theme.colors.sage ?? '#4caf50') : (Theme.colors.roseQuartz ?? '#f44336');

  return (
    <VStack sx={{ gap: Theme.spacing.sm }}>
      {/* Attendance + submission row */}
      <HStack sx={{ gap: Theme.spacing.sm }}>
        {/* Attendance big number */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text sx={{ fontSize: 12, color: colors.textMuted, marginBottom: 2 }}>
            Attendance Today
          </Text>
          <Text
            sx={{
              fontSize: 28,
              fontWeight: '700',
              color: pulse ? attendanceColor(pulse.todayRate) : colors.text,
            }}
          >
            {pulse ? `${pulse.todayRate}%` : '—'}
          </Text>
          <Text sx={{ fontSize: 11, color: deltaColor }}>
            {pulse ? deltaLabel : ''}
          </Text>
        </Box>

        {/* Submission rate */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text sx={{ fontSize: 12, color: colors.textMuted, marginBottom: 2 }}>
            Submissions This Week
          </Text>
          <Text sx={{ fontSize: 28, fontWeight: '700', color: colors.text }}>
            {submissionRate !== null ? `${submissionRate}%` : '—'}
          </Text>
          <Text sx={{ fontSize: 11, color: colors.textMuted }}>of assignments</Text>
        </Box>
      </HStack>

      {/* At-risk + pending enrollments row */}
      <HStack sx={{ gap: Theme.spacing.sm }}>
        {/* At-risk badge */}
        <TouchableOpacity onPress={onViewAtRisk} activeOpacity={0.8} style={{ flex: 1 }}>
          <Box
            sx={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: Theme.corners.comfortable,
              padding: Theme.spacing.md,
              borderWidth: 1,
              borderColor:
                (pulse?.atRiskCount ?? 0) > 0
                  ? (Theme.colors.roseQuartz ?? '#f44336')
                  : colors.border,
            }}
          >
            <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
              <Box
                sx={{
                  backgroundColor: Theme.colors.roseQuartz ?? '#f44336',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                  {pulse?.atRiskCount ?? 0}
                </Text>
              </Box>
              <Text sx={{ fontSize: 12, color: colors.text, flex: 1 }}>At-risk students</Text>
            </HStack>
            {onViewAtRisk && (
              <Text sx={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                Tap to review
              </Text>
            )}
          </Box>
        </TouchableOpacity>

        {/* Pending enrollments badge */}
        <TouchableOpacity onPress={onViewEnrollments} activeOpacity={0.8} style={{ flex: 1 }}>
          <Box
            sx={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: Theme.corners.comfortable,
              padding: Theme.spacing.md,
              borderWidth: 1,
              borderColor:
                pendingEnrollments > 0
                  ? (Theme.colors.amberGlow ?? '#ffc107')
                  : colors.border,
            }}
          >
            <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
              <Box
                sx={{
                  backgroundColor: Theme.colors.amberGlow ?? '#ffc107',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                  {pendingEnrollments}
                </Text>
              </Box>
              <Text sx={{ fontSize: 12, color: colors.text, flex: 1 }}>Pending enrollments</Text>
            </HStack>
            {onViewEnrollments && (
              <Text sx={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                Tap to review
              </Text>
            )}
          </Box>
        </TouchableOpacity>
      </HStack>
    </VStack>
  );
}
