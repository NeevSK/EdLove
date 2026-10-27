import { useState } from 'react';
import { ClaimInviteModal } from '../ClaimInviteModal';
import { FireflyMascot } from '@repo/ui';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { BookOpen } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';

interface Classroom {
  id: string;
  name: string;
  subject?: string;
  color_theme?: string;
}

interface StudentClassroomListProps {
  classrooms: Classroom[];
  loading: boolean;
  isDemo?: boolean;
  onInviteClaimed?: () => void;
}

export const StudentClassroomList = ({
  classrooms,
  loading,
  isDemo = false,
  onInviteClaimed,
}: StudentClassroomListProps) => {
  const router = useRouter();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  if (loading) {
    return (
      <VStack className="gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-[120px] rounded-[32px]" />
        ))}
      </VStack>
    );
  }

  if (classrooms.length === 0) {
    return (
      <Box className="py-8 items-center w-full">
        <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite p-8 items-center w-full max-w-md shadow-sm">
          <FireflyMascot size={72} mode="glowing" role="guide" />
          <VStack className="gap-2 items-center mt-5">
            <Text className="text-xl font-black text-phaseText-primary text-center">
              Join Your Classroom Sanctuary
            </Text>
            <Text className="text-xs text-phaseText-secondary text-center max-w-[280px] leading-5">
              Enter your 6-digit classroom invitation code or desk pass from your teacher to enter your learning space.
            </Text>
          </VStack>
          <Box className="w-full mt-6">
            <Pressable
              onPress={() => {
                hapticLight();
                setIsClaimModalOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Enter classroom invitation code"
              className="w-full py-3.5 bg-templeGold rounded-2xl items-center shadow-sm active:opacity-90"
            >
              <Text className="text-white font-bold text-sm tracking-wide">
                Enter Invitation Code
              </Text>
            </Pressable>
          </Box>
        </Box>

        <ClaimInviteModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          onSuccess={() => {
            hapticSuccess();
            setIsClaimModalOpen(false);
            onInviteClaimed?.();
          }}
        />
      </Box>
    );
  }

  return (
    <HStack className="flex-wrap gap-6">
      {classrooms.map((cls) => (
        <Pressable
          key={cls.id}
          onPress={() =>
            router.push({
              pathname: '/workspace/classroom/student/[classroomId]',
              params: { classroomId: cls.id, classroomName: cls.name },
            })
          }
          className="w-full max-w-[320px] bg-sanctuary-surface rounded-[32px] overflow-hidden border border-sanctuary-border/60"
        >
          <Box
            className="h-24 p-6 flex-row justify-between items-start opacity-90"
            style={{ backgroundColor: cls.color_theme || '#34C7DB' }}
          >
            <Box className="w-10 h-10 rounded-xl bg-white/95 items-center justify-center border border-white/20">
              <Icon as={BookOpen} size="sm" className="text-sanctuary-info" />
            </Box>
            <Box className="px-2.5 py-1 bg-white/95 rounded-lg border border-white/20 shadow-sm">
              <Text className="text-[10px] font-black text-sanctuary-text uppercase tracking-widest">
                Active
              </Text>
            </Box>
          </Box>

          <VStack className="p-6 gap-5">
            <VStack className="gap-1.5">
              <Text className="text-xl font-black text-sanctuary-text tracking-tight leading-tight">
                {cls.name}
              </Text>
              {cls.subject && (
                <Text className="text-xs font-bold text-sanctuary-text-tertiary">
                  {cls.subject}
                </Text>
              )}
            </VStack>

            <HStack className="gap-2.5">
              <Box className="px-3 py-2 bg-sanctuary-surface-secondary border border-sanctuary-border/40 rounded-xl">
                <Text className="text-[11px] font-black text-sanctuary-text-tertiary uppercase tracking-wider">
                  📖 Lessons
                </Text>
              </Box>
              <Box className="px-3 py-2 bg-sanctuary-surface-secondary border border-sanctuary-border/40 rounded-xl">
                <Text className="text-[11px] font-black text-sanctuary-text-tertiary uppercase tracking-wider">
                  📋 Tasks
                </Text>
              </Box>
            </HStack>
          </VStack>
        </Pressable>
      ))}
    </HStack>
  );
};
