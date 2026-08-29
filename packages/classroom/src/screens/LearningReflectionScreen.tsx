/**
 * LEARNING REFLECTION (P1a)
 * Classroom-owned wrapper that reuses @repo/self's ReframeWizard engine for
 * academic reflection: a student unpacks an automatic thought about a grade or
 * feedback, names the learning trap, and turns the reframe into a next-step
 * commitment. The engine itself lives in @repo/self (P0) and is imported here,
 * not duplicated — the classroom adds only the academic context chrome and the
 * commitment note.
 */

import { useLearningReflections } from '@repo/classroom/hooks/useLearningReflections';
import { usePermissions } from '@repo/core/logic';
import ReframeWizard from '@repo/self/components/ReframeWizard';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { NotebookPen } from '@repo/ui/icons';
import { Box, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function LearningReflectionScreen() {
  const { classroomId, classroomName } = useLocalSearchParams<{
    classroomId?: string;
    classroomName?: string;
  }>();
  const { context } = usePermissions();
  const { t } = useTranslation();
  const activeUserId = context.userId ?? undefined;

  const { records, isLoading, isAnonymous, addLearningReflection, completeFollowUp } =
    useLearningReflections(activeUserId, classroomId);

  return (
    <ScreenWrapper>
      <GlobalHeader
        title={t('learningReflection.title')}
        showBack
        onBack={() =>
          safeBack(classroomId ? `/workspace/classroom/student/${classroomId}` : '/workspace')
        }
      />
      <VStack className="gap-4 p-6 pb-10">
        <Box className="bg-obsidian rounded-[24px] border border-phase-border p-5">
          <HStack className="gap-3 items-center">
            <Box className="w-10 h-10 rounded-xl bg-phase-interactive/10 items-center justify-center">
              <Icon as={NotebookPen} size="sm" className="text-sanctuary-info" />
            </Box>
            <VStack className="gap-1 flex-1">
              <Text className="text-mistGray text-sm leading-snug">
                {t('learningReflection.subtitle')}
              </Text>
              {classroomName ? (
                <Text className="text-[11px] uppercase tracking-widest text-templeGold font-bold">
                  {t('learningReflection.classroomLabel')} · {classroomName}
                </Text>
              ) : null}
            </VStack>
          </HStack>
        </Box>

        <ReframeWizard
          persistence={{
            records,
            isLoading,
            isAnonymous,
            addThoughtRecord: addLearningReflection,
            completeFollowUp,
          }}
        />

        <Text className="text-mistGray/80 text-xs italic text-center px-4 leading-snug">
          {t('learningReflection.commitmentNote')}
        </Text>
      </VStack>
    </ScreenWrapper>
  );
}
