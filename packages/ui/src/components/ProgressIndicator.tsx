import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { cn } from '@repo/ui/utils/classNames';
import type React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  showStepCount?: boolean;
}

/**
 * ProgressIndicator Component
 *
 * Displays progress through a multi-step flow using lotus-inspired dots
 * Hardened v3 implementation.
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  showStepCount = true,
}) => {
  return (
    <VStack className="items-center w-full gap-4">
      {/* Dot Indicators */}
      <HStack className="items-center justify-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index === currentStep;
          const isPast = index < currentStep;

          return (
            <Box
              key={`dot-${index}`}
              testID={`progress-dot-${index}`}
              className={cn(
                'h-2 rounded-full transition-all',
                isActive ? 'w-6 bg-phase-accent' : 'w-2',
                isPast
                  ? 'bg-phase-accent/60'
                  : !isActive
                    ? 'bg-phase-border border border-phase-border/40'
                    : undefined,
              )}
            />
          );
        })}
      </HStack>

      {/* Step Count Text */}
      {showStepCount && (
        <Text className="text-phase-text-secondary font-medium text-sm">
          Step {currentStep + 1} of {totalSteps}
        </Text>
      )}
    </VStack>
  );
};
