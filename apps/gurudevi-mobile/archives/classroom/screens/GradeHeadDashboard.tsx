import { useAIAgent } from '@repo/ai';
import { useStore } from '@repo/core/logic';
import { ScreenWrapper } from '@repo/ui';
import { SanctuaryButton } from '@repo/ui/components';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { CircleAlert, BookOpen, Users } from '@repo/ui/icons';
import { ScrollView, StyleSheet } from 'react-native';
export default function GradeHeadDashboard({
  schoolId,
  userId,
}: {
  schoolId?: string;
  userId?: string;
}) {
  const { activeGaps, refreshStatus } = useAIAgent();
  const _userRole = useStore((state: any) => state.userRole);
  // Register FAB globally
  useRegisterFAB({
    tabType: 'grade',
    hasActiveGaps: activeGaps.length > 0,
    onPress: () => refreshStatus(),
  });
  return (
    <ScreenWrapper backgroundColor={Theme.colors.ink}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack gap="$4">
          {/* Header */}
          <Box sx={{ paddingVertical: '$xl' as any }}>
            <Text
              sx={{
                fontSize: '$2xl' as any,
                fontWeight: '700',
                color: Theme.colors.sacredWhite,
              }}
            >
              Grade Coordination
            </Text>
            <Text sx={{ color: Theme.colors.starlightGray }}>
              Overview of grade status and teacher coordination.
            </Text>
          </Box>

          {/* Proactive Agent Notifications */}
          {activeGaps.length > 0 && (
            <VStack gap="$3">
              <Text
                sx={{
                  fontWeight: '600',
                  fontSize: '$sm' as any,
                  color: Theme.colors.sanctuarySaffron,
                }}
              >
                AI SUGGESTIONS
              </Text>
              {activeGaps.map((gap: any) => (
                <Box
                  key={gap.id}
                  sx={{
                    padding: '$md' as any,
                    borderRadius: '$lg' as any,
                    backgroundColor: 'rgba(230, 126, 34, 0.1)',
                    borderWidth: 1,
                    borderColor: Theme.colors.sanctuarySaffron,
                  }}
                >
                  <HStack gap="$3" alignItems="center">
                    <CircleAlert color={Theme.colors.sanctuarySaffron} size={20} />
                    <VStack sx={{ flex: 1 }}>
                      <Text
                        sx={{
                          fontWeight: '700',
                          color: Theme.colors.sacredWhite,
                        }}
                      >
                        {gap.title}
                      </Text>
                      <Text
                        sx={{
                          fontSize: '$sm' as any,
                          color: Theme.colors.starlightGray,
                        }}
                      >
                        {gap.description}
                      </Text>
                    </VStack>
                  </HStack>
                  <Box sx={{ marginTop: '$3' as any }}>
                    <SanctuaryButton
                      onPress={() => console.log('Executing relief:', gap.suggestedAction)}
                      size="sm"
                      variant="solid"
                    >
                      Assign Relief Teacher
                    </SanctuaryButton>
                  </Box>
                </Box>
              ))}
            </VStack>
          )}

          {/* Operational Overview */}
          <HStack gap="$3">
            <Box sx={styles.statBox}>
              <Text
                sx={{
                  fontSize: '$xs' as any,
                  color: Theme.colors.starlightGray,
                }}
              >
                CLASSES
              </Text>
              <Text
                sx={{
                  fontWeight: '700',
                  fontSize: '$xl' as any,
                  color: Theme.colors.sacredWhite,
                }}
              >
                5
              </Text>
            </Box>
            <Box sx={styles.statBox}>
              <Text
                sx={{
                  fontSize: '$xs' as any,
                  color: Theme.colors.starlightGray,
                }}
              >
                STUDENTS
              </Text>
              <Text
                sx={{
                  fontWeight: '700',
                  fontSize: '$xl' as any,
                  color: Theme.colors.sacredWhite,
                }}
              >
                210
              </Text>
            </Box>
          </HStack>

          {/* Quick Coordination */}
          <VStack gap="$2">
            <Text
              sx={{
                fontWeight: '600',
                fontSize: '$sm' as any,
                color: Theme.colors.starlightGray,
              }}
            >
              GRADE MANAGEMENT
            </Text>
            <SanctuaryButton onPress={() => {}} variant="outline">
              <HStack gap="$2" alignItems="center">
                <BookOpen size={18} color={Theme.colors.sacredWhite} />
                <Text sx={{ color: Theme.colors.sacredWhite }}>Curriculum Alignment Pulse</Text>
              </HStack>
            </SanctuaryButton>
            <SanctuaryButton onPress={() => {}} variant="outline">
              <HStack gap="$2" alignItems="center">
                <Users size={18} color={Theme.colors.sacredWhite} />
                <Text sx={{ color: Theme.colors.sacredWhite }}>Student Wellbeing Reports</Text>
              </HStack>
            </SanctuaryButton>
          </VStack>
        </VStack>
      </ScrollView>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  statBox: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.corners.comfortable,
    backgroundColor: Theme.colors.shroud,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});
