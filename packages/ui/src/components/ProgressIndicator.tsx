import React from 'react';
import { Text, HStack, VStack, Box } from '../gluestack';

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
                            key={index}
                            testID={`progress-dot-${index}`}
                            className={`
                                h-2 rounded-full
                                ${isActive ? 'w-6 bg-phase-accent' : 'w-2'}
                                ${isPast ? 'bg-phase-text-secondary opacity-60' : !isActive ? 'bg-phase-surface opacity-30' : ''}
                            `}
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
