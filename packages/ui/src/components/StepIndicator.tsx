import { Box, HStack, Text, VStack } from '@repo/ui/gluestack';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <VStack space="sm" className="px-4 py-4">
      <HStack space="xs" className="w-full items-center">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index + 1 < currentStep;
          const isActive = index + 1 === currentStep;

          return (
            <Box
              key={`step-${index}`}
              className={`flex-1 h-1 rounded-full ${
                isCompleted || isActive ? 'bg-phase-accent' : 'bg-phase-surface'
              } ${isActive ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-30'}`}
            />
          );
        })}
      </HStack>
      <HStack className="justify-between w-full">
        <Text className="text-phase-accent font-bold text-sm">
          Step {currentStep} of {totalSteps}
        </Text>
        <Text className="text-phase-text-secondary text-sm">{stepLabels[currentStep - 1]}</Text>
      </HStack>
    </VStack>
  );
}
