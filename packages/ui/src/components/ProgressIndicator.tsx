import React from 'react';
import { Text, HStack, VStack, Box } from '../gluestack';;
import { Theme } from '../theme/Theme';;
import { useThemedColors } from '../hooks/useThemedColors';;

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    showStepCount?: boolean;
}

/**
 * ProgressIndicator Component
 * 
 * Displays progress through a multi-step flow using lotus-inspired dots
 * Follows Gurudevi design principles: organic, breathing, alive
 * 
 * Design Philosophy:
 * - Dots represent lotus petals opening
 * - Current step "blooms" larger
 * - Past steps remain visible but subtle
 * - Future steps are faint, awaiting activation
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    currentStep,
    totalSteps,
    showStepCount = true,
}) => {
    const colors = useThemedColors();

    return (
        <VStack space="md" alignItems="center" style={{ width: '100%' }}>
            {/* Dot Indicators */}
            <HStack space="xs" alignItems="center" justifyContent="center">
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const isActive = index === currentStep;
                    const isPast = index < currentStep;
                    const isFuture = index > currentStep;

                    return (
                        <Box
                            key={index}
                            testID={`progress-dot-${index}`}
                            sx={{
                                width: isActive ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: isActive
                                    ? colors.action
                                    : isPast
                                        ? colors.textSecondary
                                        : colors.textTertiary,
                                opacity: isActive ? 1 : isPast ? 0.6 : 0.3,
                                // Organic transition (breathing effect)
                                transition: 'all 300ms ease-in-out',
                            }}
                        />
                    );
                })}
            </HStack>

            {/* Step Count Text */}
            {showStepCount && (
                <Text
                    size="sm"
                    color={colors.textSecondary}
                    sx={{ fontWeight: '$medium' }}
                >
                    Step {currentStep + 1} of {totalSteps}
                </Text>
            )}
        </VStack>
    );
};
