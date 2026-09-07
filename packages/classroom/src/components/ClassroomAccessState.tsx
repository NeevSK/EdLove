import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, Button, ButtonText, Heading, Text, VStack } from '@repo/ui/primitives';

export type ClassroomAccessStateKind = 'missing' | 'unavailable';

export function ClassroomAccessState({
  kind,
  onBack,
  onRetry,
}: {
  kind: ClassroomAccessStateKind;
  onBack: () => void;
  onRetry?: () => void;
}) {
  const missing = kind === 'missing';

  return (
    <ScreenWrapper scroll={false} noTopInset={true}>
      <GlobalHeader
        title={missing ? 'Choose a classroom' : 'Classroom unavailable'}
        showBack
        onBack={onBack}
      />
      <Box className="flex-1 justify-center items-center p-6">
        <VStack className="gap-3 items-center max-w-[420px]">
          <Heading className="text-phase-text-primary text-xl text-center">
            {missing ? 'No classroom selected' : 'This classroom cannot be opened'}
          </Heading>
          <Text className="text-phase-text-secondary text-center leading-6">
            {missing
              ? 'Return to your workspace and choose a classroom to continue.'
              : 'It may no longer exist, or your current access does not include it. Return to the workspace to choose an available classroom.'}
          </Text>
          {onRetry ? (
            <Button
              accessibilityLabel="Retry opening classroom"
              onPress={onRetry}
              className="mt-2 rounded-full bg-phase-accent px-5"
            >
              <ButtonText className="text-sacredWhite font-bold">Try again</ButtonText>
            </Button>
          ) : null}
        </VStack>
      </Box>
    </ScreenWrapper>
  );
}

export default ClassroomAccessState;
