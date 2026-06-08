import { useThemedColors } from '@repo/ui/hooks';
import { ArrowLeft, History } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';

interface LegacyDashboardProps {
  schoolId: string;
  onBack: () => void;
}

export const LegacyDashboard = ({ schoolId, onBack }: LegacyDashboardProps) => {
  const colors = useThemedColors();

  return (
    <VStack className="flex-1 gap-md">
      <Box
        className="rounded-generous border p-lg"
        style={{
          backgroundColor: Theme.colors.silk,
          borderColor: Theme.colors.linen,
        }}
      >
        <HStack className="items-center justify-between gap-md">
          <HStack className="items-center gap-md">
            <Pressable onPress={onBack}>
              <Box
                className="p-sm rounded-full border"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.border,
                }}
              >
                <Icon as={ArrowLeft} size={20} color={colors.text} />
              </Box>
            </Pressable>
            <VStack className="gap-1">
              <HStack className="items-center gap-2">
                <Icon as={History} size={24} color={Theme.colors.gurudeviBlue} />
                <Heading className="text-xl" style={{ color: colors.text }}>
                  Institutional Legacy
                </Heading>
              </HStack>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Longitudinal institutional memory and historical milestones for this sanctuary.
              </Text>
            </VStack>
          </HStack>
        </HStack>
      </Box>

      <Box className="flex-1">
        <Box
          className="rounded-generous border p-lg"
          style={{
            backgroundColor: Theme.colors.silk,
            borderColor: Theme.colors.linen,
          }}
        >
          <VStack className="gap-2">
            <Heading className="text-lg" style={{ color: colors.text }}>
              Legacy timeline
            </Heading>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Historical institutional memory is temporarily detached from the admin workspace
              package. Reattach the dedicated legacy surface to restore the full timeline for school
              ID `{schoolId}`.
            </Text>
          </VStack>
        </Box>
      </Box>
    </VStack>
  );
};
