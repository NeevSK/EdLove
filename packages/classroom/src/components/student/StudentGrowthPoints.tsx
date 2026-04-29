import { Trophy } from '@repo/ui/icons';
import { Box } from '@repo/ui/primitives';
import { HStack, Heading, Icon, Text } from '@repo/ui/primitives';

interface StudentGrowthPointsProps {
  points: number;
  isDemo: boolean;
}

export const StudentGrowthPoints = ({ points, isDemo }: StudentGrowthPointsProps) => {
  if (!isDemo) return null; // Only for demo for now based on original code

  return (
    <Box className="bg-sanctuarySaffron/5 rounded-[32px] border border-sanctuarySaffron/20 p-6">
      <HStack className="items-center gap-2.5 mb-5">
        <Box className="w-8 h-8 bg-sanctuarySaffron/10 rounded-xl items-center justify-center border border-sanctuarySaffron/20">
          <Icon as={Trophy} size="xs" className="text-sanctuarySaffron" />
        </Box>
        <Heading className="text-sm font-black text-sanctuary-text uppercase tracking-widest">
          Growth Journey
        </Heading>
      </HStack>

      <HStack className="items-baseline mb-1">
        <Text className="text-4xl font-black text-sanctuarySaffron tracking-tighter">{points}</Text>
        <Text className="text-sm font-black text-sanctuary-text-tertiary ml-1.5 uppercase tracking-widest">
          pts
        </Text>
      </HStack>

      <Text className="text-xs font-bold text-sanctuary-text-tertiary mb-5">
        Level 4 • Inquisitive Learner
      </Text>

      <Box className="h-2 bg-sanctuarySaffron/10 rounded-full overflow-hidden mb-3">
        <Box className="h-full bg-sanctuarySaffron rounded-full" style={{ width: '68%' }} />
      </Box>

      <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-widest">
        160 pts to next level
      </Text>
    </Box>
  );
};
