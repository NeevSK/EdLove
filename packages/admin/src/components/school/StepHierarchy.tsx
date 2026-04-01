import React from 'react';
import {
    VStack,
    Text,
    HStack,
    Pressable,
    useThemedColors,
    Theme,
    Box
} from '@repo/ui';
import { CheckCircle2, Circle, ChevronRight, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Step {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    isActive: boolean;
}

interface StepHierarchyProps {
    steps: Step[];
    onStepPress?: (id: string) => void;
}

export const StepHierarchy: React.FC<StepHierarchyProps> = ({ 
    steps = [], 
    onStepPress 
}) => {
    const { t } = useTranslation();
    const colors = useThemedColors();

    return (
        <VStack space="md" sx={{ width: '100%' }}>
            {steps.map((step, index) => (
                <Pressable 
                    key={step.id} 
                    onPress={() => onStepPress?.(step.id)}
                    sx={{
                        opacity: step.isActive || step.isCompleted ? 1 : 0.5
                    }}
                >
                    <HStack space="md" sx={{ alignItems: 'flex-start' }}>
                        <VStack sx={{ alignItems: 'center', width: 24 }}>
                            {step.isCompleted ? (
                                <CheckCircle2 size={24} color={Theme.colors.sageGreen} />
                            ) : (
                                <Circle 
                                    size={24} 
                                    color={step.isActive ? Theme.colors.skyBlue : colors.textTertiary} 
                                />
                            )}
                            {index < steps.length - 1 && (
                                <Box 
                                    sx={{ 
                                        width: 2, 
                                        flex: 1, 
                                        bg: step.isCompleted ? Theme.colors.sageGreen : colors.border,
                                        my: 4,
                                        minHeight: 20
                                    }} 
                                />
                            )}
                        </VStack>

                        <VStack sx={{ flex: 1, pb: index < steps.length - 1 ? 20 : 0 }}>
                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text 
                                    fontWeight="700" 
                                    color={step.isActive ? colors.text : colors.textSecondary}
                                >
                                    {step.title}
                                </Text>
                                {step.isActive && <ChevronRight size={16} color={colors.textTertiary} />}
                            </HStack>
                            {step.description && (
                                <Text size="xs" color={colors.textTertiary} sx={{ mt: 2 }}>
                                    {step.description}
                                </Text>
                            )}
                        </VStack>
                    </HStack>
                </Pressable>
            ))}

            <Box sx={{ mt: 10, pt: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Pressable>
                    <HStack space="sm" sx={{ alignItems: 'center' }}>
                        <Box sx={{ bg: `${Theme.colors.skyBlue}20`, p: 6, borderRadius: 8 }}>
                            <Plus size={16} color={Theme.colors.skyBlue} />
                        </Box>
                        <Text size="sm" fontWeight="600" color={Theme.colors.skyBlue}>
                            {t('schoolSetup.addCustomSection') || 'Add Custom Section'}
                        </Text>
                    </HStack>
                </Pressable>
            </Box>
        </VStack>
    );
};
