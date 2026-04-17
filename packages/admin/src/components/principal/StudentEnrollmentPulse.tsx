import React, { useEffect, useState } from 'react';
import { Icon, TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, Text, SkeletonCard, useThemedColors,  } from '@repo/ui';
import { ChevronRight, TrendingUp } from 'lucide-react-native';
import { staffOperationsAPI, type StudentPrincipalPulse } from '../../staff';

interface StudentPulseSectionProps {
  schoolId: string;
  classroomId?: string;
  onViewAtRisk?: () => void;
  onViewEnrollments?: () => void;
  onViewFullReport?: () => void;
}

function attendanceColor(rate: number): string {
  if (rate >= 90) return sageGreen ?? '#4caf50';
  if (rate >= 75) return amberGlow ?? '#ffc107';
  return emberRed ?? '#f44336';
}

export default function StudentPulseSection({
  schoolId,
  classroomId,
  onViewAtRisk,
  onViewEnrollments,
  onViewFullReport}: StudentPulseSectionProps) {
  const colors = useTheme().scene;
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState<StudentPrincipalPulse | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const pulseData = await staffOperationsAPI.getStudentPrincipalPulse(schoolId, classroomId);
        if (!mounted) return;
        setPulse(pulseData);
      } catch (error) {
        console.error('Error fetching student pulse:', error);
      } finally {
        if (mounted) setLoading(false);
      }
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
  const deltaColor = delta >= 0 ? colors?.success || '#4caf50' : colors?.error || '#f44336';

  return (
    <VStack sx={{ gap: Theme.spacing.sm }}>
      {/* Attendance and Submissions Row */}
      <HStack sx={{ gap: Theme.spacing.sm }}>
        <Box
          sx={{
            flex: 1,
            backgroundColor: colors?.primary || '#2A2318',
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors?.border || 'rgba(255,255,255,0.1)'}}
        >
          <Text sx={{ fontSize: 12, color: colors?.textSecondary || '#aaa', marginBottom: 2 }}>
            Attendance Today
          </Text>
          <Text
            sx={{
              fontSize: 28,
              fontWeight: '700',
              color: pulse ? attendanceColor(pulse.todayRate) : (colors?.text || '#fff')}}
          >
            {pulse ? `${pulse.todayRate}%` : '-'}
          </Text>
          <Text sx={{ fontSize: 11, color: deltaColor }}>
            {pulse ? deltaLabel : ''}
          </Text>
        </Box>

        <Box
          sx={{
            flex: 1,
            backgroundColor: colors?.primary || '#2A2318',
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors?.border || 'rgba(255,255,255,0.1)'}}
        >
          <Text sx={{ fontSize: 12, color: colors?.textSecondary || '#aaa', marginBottom: 2 }}>
            Submissions This Week
          </Text>
          <Text sx={{ fontSize: 28, fontWeight: '700', color: colors?.text || '#fff' }}>
            {pulse?.submissionRate !== null && pulse?.submissionRate !== undefined ? `${pulse.submissionRate}%` : '-'}
          </Text>
          <Text sx={{ fontSize: 11, color: colors?.textSecondary || '#aaa' }}>
            of assignments
          </Text>
        </Box>
      </HStack>

      {/* At-Risk and Pending Enrollments Row */}
      <HStack sx={{ gap: Theme.spacing.sm }}>
        <TouchableOpacity 
          onPress={onViewAtRisk} 
          activeOpacity={0.8} 
          style={{ flex: 1 }}
          disabled={!onViewAtRisk}
          accessibilityRole="button"
          accessibilityLabel="View At-risk Students"
          accessibilityHint="Navigates to the list of students with attendance or academic concerns"
        >
          <Box
            sx={{
              flex: 1,
              backgroundColor: colors?.primary || '#2A2318',
              borderRadius: Theme.corners.comfortable,
              padding: Theme.spacing.md,
              borderWidth: 1,
              borderColor: (pulse?.atRiskCount ?? 0) > 0 ? (colors?.error || '#f44336') : (colors?.border || 'rgba(255,255,255,0.1)')}}
          >
            <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
              <Box
                sx={{
                  backgroundColor: colors?.error || '#f44336',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2}}
              >
                <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                  {pulse?.atRiskCount ?? 0}
                </Text>
              </Box>
              <Text sx={{ fontSize: 12, color: colors?.text || '#fff', flex: 1 }}>
                At-risk students
              </Text>
              <Icon as={ChevronRight} size={16} color={colors?.textTertiary || '#666'} />
            </HStack>
            {onViewAtRisk && (
              <Text sx={{ fontSize: 11, color: colors?.textSecondary || '#aaa', marginTop: 2 }}>
                Tap to review
              </Text>
            )}
          </Box>
        </TouchableOpacity>

        {!classroomId && (
          <TouchableOpacity 
            onPress={onViewEnrollments} 
            activeOpacity={0.8} 
            style={{ flex: 1 }}
            disabled={!onViewEnrollments}
            accessibilityRole="button"
            accessibilityLabel="View Pending Enrollments"
            accessibilityHint="Opens the new student enrollment approval queue"
          >
            <Box
              sx={{
                flex: 1,
                backgroundColor: colors?.primary || '#2A2318',
                borderRadius: Theme.corners.comfortable,
                padding: Theme.spacing.md,
                borderWidth: 1,
                borderColor: (pulse?.pendingEnrollments ?? 0) > 0 ? (colors?.warning || '#ff9800') : (colors?.border || 'rgba(255,255,255,0.1)')}}
            >
              <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
                <Box
                  sx={{
                    backgroundColor: colors?.warning || '#ff9800',
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 2}}
                >
                  <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                    {pulse?.pendingEnrollments ?? 0}
                  </Text>
                </Box>
                <Text sx={{ fontSize: 12, color: colors?.text || '#fff', flex: 1 }}>
                  Pending enrollments
                </Text>
                <Icon as={ChevronRight} size={16} color={colors?.textTertiary || '#666'} />
              </HStack>
              {onViewEnrollments && (
                <Text sx={{ fontSize: 11, color: colors?.textSecondary || '#aaa', marginTop: 2 }}>
                  Tap to review
                </Text>
              )}
            </Box>
          </TouchableOpacity>
        )}
      </HStack>

      {/* Footer Full Analytics */}
      {onViewFullReport && (
        <TouchableOpacity 
          onPress={onViewFullReport} 
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View Full Analytics"
          accessibilityHint="Opens the detailed institutional analytics dashboard"
        >
          <HStack
            sx={{
              marginTop: Theme.spacing.sm,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: colors?.border || 'rgba(255,255,255,0.1)'}}
          >
            <Text sx={{ fontSize: 12, fontWeight: '700', color: colors?.action || '#2196f3' }}>
              VIEW FULL ANALYTICS
            </Text>
            <TrendingUp size={14} color={colors?.action || '#2196f3'} />
          </HStack>
        </TouchableOpacity>
      )}
    </VStack>
  );
}
