import React from 'react';
import { Box, HStack, Text, VStack } from '../gluestack';
import { Theme } from '../theme/Theme';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    stepLabels: string[];
}

export default function StepIndicator({
    currentStep,
    totalSteps,
    stepLabels,
}: StepIndicatorProps) {
    return (
        <VStack sx={{ gap: Theme.spacing.sm, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md }}>
            <HStack sx={{ gap: Theme.spacing.xs, width: '100%', alignItems: 'center' }}>
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const isCompleted = index + 1 < currentStep;
                    const isActive = index + 1 === currentStep;

                    return (
                        <React.Fragment key={index}>
                            <Box>
                                sx={{
                                    flex: 1,
                                    height: 4,
                                    backgroundColor: isCompleted || isActive
                                        ? Theme.colors.sanctuarySaffron
                                        : Theme.colors.mistGray,
                                    borderRadius: Theme.corners.full,
                                    opacity: isActive ? 1 : isCompleted ? 0.8 : 0.3,
                                }}
                            /
                            {index < totalSteps - 1 && <Box sx={{ width: 4 }} />}
                        </React.Fragment>
                    );
                })}
            </HStack>
            <HStack sx={{ justifyContent: 'space-between', width: '100%' }}>
                <Text color={Theme.colors.sanctuarySaffron} sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.sm }}>
                    Step {currentStep} of {totalSteps}
                </Text>
                <Text color={Theme.colors.mistGray} sx={{ fontSize: Theme.typography.fontSize.sm }}>
                    {stepLabels[currentStep - 1]}
                </Text>
            </HStack>
        </VStack>
    );
}
