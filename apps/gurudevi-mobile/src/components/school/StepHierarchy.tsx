import React from 'react';
import { Icon, VStack,
    Text,
    HStack,
    Pressable,
    
    Box,
    Heading } from '@repo/ui';
import { Plus, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface StepHierarchyProps {
    data: {
        levels: string[];
        sections: { name: string; headName?: string }[];
    };
    onUpdate: (hier: Partial<StepHierarchyProps['data']>) => void;
}

const COMMON_LEVELS: { id: string; labelKey: string }[] = [
    { id: 'Primary (1-5)', labelKey: 'schoolSetup.levels.primary' },
    { id: 'Junior Secondary (6-9)', labelKey: 'schoolSetup.levels.juniorSecondary' },
    { id: 'Secondary (10-11)', labelKey: 'schoolSetup.levels.secondary' },
    { id: 'Advanced Level (12-13)', labelKey: 'schoolSetup.levels.advancedLevel' }];

export default function StepHierarchy({ data, onUpdate }: StepHierarchyProps) {
    const { t } = useTranslation();

    const toggleLevel = (level: string) => {
        const newLevels = data.levels.includes(level)
            ? data.levels.filter(l => l !== level)
            : [...data.levels, level];
        onUpdate({ levels: newLevels });
    };

    return (
        <VStack className="gap-6">
            <Box>
                <Heading size="sm" className="mb-2">{t('schoolSetup.academicLevels')}</Heading>
                <Text size="xs" className="text-phaseText-secondary mb-4">
                    {t('schoolSetup.academicLevelsDesc')}
                </Text>
                <VStack className="gap-2">
                    {COMMON_LEVELS.map(level => {
                        const isSelected = data.levels.includes(level.id);
                        return (
                            <Pressable 
                                accessibilityRole="button"
                                key={level.id}
                                onPress={() => toggleLevel(level.id)}
                                className={`p-3 rounded-xl border ${ isSelected ? 'border-phase-accent bg-phase-accent/10' : 'border-phase-interactive/10 bg-phase-canvas' }`}>
                                <HStack className="justify-between items-center">
                                    <Text className={isSelected ? 'text-phase-accent' : 'text-phaseText-primary'}>{t(level.labelKey)}</Text>
                                    {isSelected && <Box className="w-2 h-2 rounded-full bg-phase-accent" />}
                                </HStack>
                            </Pressable>
                        );
                    })}
                </VStack>
            </Box>

            <Box className="mt-4">
                <Heading size="sm" className="mb-2">{t('schoolSetup.orgSections')}</Heading>
                <Text size="xs" className="text-phaseText-secondary mb-4">
                    {t('schoolSetup.orgSectionsDesc')}
                </Text>

                {/* Placeholder for section adding - will enhance in future phases if needed */}
                <Box
                    className="p-8 rounded-xl border-2 border-dashed border-phase-interactive/10 items-center justify-center">
                    <Icon as={Plus} size={24} color="var(--phase-text-secondary)" />
                    <Text size="sm" className="text-phaseText-secondary mt-2">{t('schoolSetup.addCustomSection')}</Text>
                </Box>
            </Box>
        </VStack>
    );
}
