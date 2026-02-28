import React from 'react';
import {
    VStack,
    Text,
    HStack,
    Pressable,
    useThemedColors,
    Theme,
    Box,
    Heading
} from '@repo/ui';
import { Plus, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface StepHierarchyProps {
    data: {
        levels: string[];
        sections: { name: string; headName?: string }[];
    };
    onUpdate: (hier: Partial<StepHierarchyProps['data']>) => void;
}

const COMMON_LEVELS = ['Primary (1-5)', 'Junior Secondary (6-9)', 'Secondary (10-11)', 'Advanced Level (12-13)'];

export default function StepHierarchy({ data, onUpdate }: StepHierarchyProps) {
    const colors = useThemedColors();
    const { t } = useTranslation();

    const toggleLevel = (level: string) => {
        const newLevels = data.levels.includes(level)
            ? data.levels.filter(l => l !== level)
            : [...data.levels, level];
        onUpdate({ levels: newLevels });
    };

    return (
        <VStack sx={{ gap: '$lg' as any }}>
            <Box>
                <Heading size="sm" sx={{ marginBottom: '$2' as any }}>{t('schoolSetup.academicLevels')}</Heading>
                <Text size="xs" color={colors.textSecondary} sx={{ marginBottom: '$4' as any }}>
                    {t('schoolSetup.academicLevelsDesc')}
                </Text>
                <VStack sx={{ gap: '$2' as any }}>
                    {COMMON_LEVELS.map(level => (
                        <Pressable
                            key={level}
                            onPress={() => toggleLevel(level)}
                            sx={{
                                padding: '$3' as any,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: data.levels.includes(level) ? Theme.colors.sanctuarySaffron : colors.border,
                                backgroundColor: data.levels.includes(level) ? `${Theme.colors.sanctuarySaffron}10` : colors.secondary,
                            }}
                        >
                            <HStack justifyContent="space-between" alignItems="center">
                                <Text color={data.levels.includes(level) ? Theme.colors.sanctuarySaffron : colors.text}>{level}</Text>
                                {data.levels.includes(level) && <Box sx={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.sanctuarySaffron }} />}
                            </HStack>
                        </Pressable>
                    ))}
                </VStack>
            </Box>

            <Box sx={{ marginTop: '$4' as any }}>
                <Heading size="sm" sx={{ marginBottom: '$2' as any }}>{t('schoolSetup.orgSections')}</Heading>
                <Text size="xs" color={colors.textSecondary} sx={{ marginBottom: '$4' as any }}>
                    {t('schoolSetup.orgSectionsDesc')}
                </Text>

                {/* Placeholder for section adding - will enhance in future phases if needed */}
                <Box
                    sx={{
                        padding: '$8' as any,
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        borderColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Plus size={24} color={colors.textTertiary} />
                    <Text size="sm" color={colors.textTertiary} sx={{ marginTop: '$2' as any }}>{t('schoolSetup.addCustomSection')}</Text>
                </Box>
            </Box>
        </VStack>
    );
}
