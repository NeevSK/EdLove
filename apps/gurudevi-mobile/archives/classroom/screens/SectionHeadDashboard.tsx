/**
 * SectionHeadView Component
 *
 * Section Overview for Section Heads
 * Displays Primary/Junior/Senior section
 */
import { useAIAgent } from '@repo/ai';
import { useStore } from '@repo/core/logic';
import { ScreenWrapper } from '@repo/ui';
import { Box, HStack, Text, VStack } from "@repo/ui/primitives";
import { SanctuaryButton } from '@repo/ui/components';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { Theme } from '@repo/ui/theme';
import { AlertCircle, Calendar, CalendarCheck, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet } from 'react-native';
export default function SectionHeadDashboard({ schoolId, userId, }: {
    schoolId?: string;
    userId?: string;
}) {
    const { activeGaps, refreshStatus, generateTimetable, isThinking, lastTimetableDraft } = useAIAgent();
    const _userRole = useStore((state: any) => state.userRole);
    // Register FAB globally
    useRegisterFAB({
        tabType: 'section',
        hasActiveGaps: activeGaps.length > 0,
        onPress: () => refreshStatus(),
    });
    return (<ScreenWrapper backgroundColor={Theme.colors.ink}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack gap="$4">
          {/* Header */}
          <Box sx={{ paddingVertical: '$xl' as any }}>
            <Text sx={{
            fontSize: '$2xl' as any,
            fontWeight: '700',
            color: Theme.colors.sacredWhite,
        }}>
              Section Coordination
            </Text>
            <Text sx={{ color: Theme.colors.starlightGray }}>
              Monitoring section activity and teacher coordination.
            </Text>
          </Box>

          {/* Proactive Agent Notifications */}
          {activeGaps.length > 0 && (<VStack gap="$3">
              <Text sx={{
                fontWeight: '600',
                fontSize: '$sm' as any,
                color: Theme.colors.sanctuarySaffron,
            }}>
                AI SUGGESTIONS
              </Text>
              {activeGaps.map((gap: any) => (<Box key={gap.id} sx={{
                    padding: '$md' as any,
                    borderRadius: '$lg' as any,
                    backgroundColor: 'rgba(230, 126, 34, 0.1)',
                    borderWidth: 1,
                    borderColor: Theme.colors.sanctuarySaffron,
                }}>
                  <HStack gap="$3" alignItems="center">
                    <AlertCircle color={Theme.colors.sanctuarySaffron} size={20}/>
                    <VStack sx={{ flex: 1 }}>
                      <Text sx={{ fontWeight: '700', color: Theme.colors.sacredWhite }}>
                        {gap.title}
                      </Text>
                      <Text sx={{ fontSize: '$sm' as any, color: Theme.colors.starlightGray }}>
                        {gap.description}
                      </Text>
                    </VStack>
                  </HStack>
                  <Box sx={{ marginTop: '$3' as any }}>
                    <SanctuaryButton onPress={() => console.log('Executing relief:', gap.suggestedAction)} size="sm" variant="solid">
                      Assign Relief Teacher
                    </SanctuaryButton>
                  </Box>
                </Box>))}
            </VStack>)}

          {/* Agentic Structural Repair: Timetable */}
          <Box sx={{
            marginTop: Theme.spacing.md,
            padding: Theme.spacing.lg,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderRadius: Theme.corners.generous,
            borderWidth: 1,
            borderColor: 'rgba(59, 130, 246, 0.2)',
        }}>
            <HStack sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Theme.spacing.sm,
        }}>
              <HStack sx={{ gap: 8, alignItems: 'center' }}>
                <CalendarCheck size={20} color={Theme.colors.gurudeviBlue}/>
                <Text sx={{ fontWeight: '700', color: Theme.colors.sacredWhite }}>
                  Timetable Review
                </Text>
              </HStack>
              <Box sx={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
            backgroundColor: `${Theme.colors.gurudeviBlue}33`,
        }}>
                <Text sx={{ fontSize: 10, color: Theme.colors.gurudeviBlue, fontWeight: '700' }}>
                  AGENTIC
                </Text>
              </Box>
            </HStack>

            {lastTimetableDraft ? (<VStack sx={{ gap: 8 }}>
                <HStack sx={{ gap: 8, alignItems: 'center' }}>
                  <AlertCircle size={16} color={Theme.colors.amberGlow}/>
                  <Text sx={{ fontSize: 13, color: Theme.colors.sacredWhite }}>
                    Draft generated for your section.
                  </Text>
                </HStack>
                <SanctuaryButton onPress={() => console.log('Reviewing draft')} variant="solid" size="sm">
                  Review Section Draft
                </SanctuaryButton>
              </VStack>) : (<VStack sx={{ gap: Theme.spacing.md }}>
                <Text sx={{ color: Theme.colors.starlightGray }}>
                  I can help you review and update the current schedule for this section.
                </Text>
                <SanctuaryButton onPress={() => generateTimetable('current-school')} action="primary" size="md" isLoading={isThinking}>
                  {isThinking ? 'Creating Draft...' : 'Create Schedule Draft'}
                </SanctuaryButton>
              </VStack>)}
          </Box>

          {/* Operational Overview */}
          <HStack gap="$3">
            <Box sx={styles.statBox}>
              <Text sx={{ fontSize: '$xs' as any, color: Theme.colors.starlightGray }}>
                CLASSES
              </Text>
              <Text sx={{ fontWeight: '700', fontSize: '$xl' as any, color: Theme.colors.sacredWhite }}>
                12
              </Text>
            </Box>
            <Box sx={styles.statBox}>
              <Text sx={{ fontSize: '$xs' as any, color: Theme.colors.starlightGray }}>
                TEACHERS
              </Text>
              <Text sx={{ fontWeight: '700', fontSize: '$xl' as any, color: Theme.colors.sacredWhite }}>
                8
              </Text>
            </Box>
          </HStack>

          {/* Quick Coordination */}
          <VStack gap="$2">
            <Text sx={{ fontWeight: '600', fontSize: '$sm' as any, color: Theme.colors.starlightGray }}>
              QUICK COORDINATION
            </Text>
            <SanctuaryButton onPress={() => { }} variant="outline">
              <HStack gap="$2" alignItems="center">
                <Calendar size={18} color={Theme.colors.sacredWhite}/>
                <Text sx={{ color: Theme.colors.sacredWhite }}>Review Section Schedule</Text>
              </HStack>
            </SanctuaryButton>
            <SanctuaryButton onPress={() => { }} variant="outline">
              <HStack gap="$2" alignItems="center">
                <Users size={18} color={Theme.colors.sacredWhite}/>
                <Text sx={{ color: Theme.colors.sacredWhite }}>Staff Workload Balance</Text>
              </HStack>
            </SanctuaryButton>
          </VStack>
        </VStack>
      </ScrollView>
    </ScreenWrapper>);
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
