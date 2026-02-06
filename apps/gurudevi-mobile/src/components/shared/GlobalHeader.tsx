/**
 * GlobalHeader Component
 * 
 * A unified header component to replace individual screen headers.
 * Features:
 * - Personalized Greeting (Ayubowan)
 * - Contextual Titles
 * - Role & School Subtitles
 * - Consistent Sanctuary Styling
 * - Back button support
 */

import React from 'react';
import { Box, HStack, VStack, Text, Heading } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { useUserRole } from '../../hooks/useUserRole';
import { useStore } from '../../store/useStore';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

interface GlobalHeaderProps {
    title?: string;
    showGreeting?: boolean;
    subtitle?: string;
    rightAction?: any;
    showBack?: boolean;
    onBack?: () => void;
}

export default function GlobalHeader({
    title,
    showGreeting = false,
    subtitle,
    rightAction,
    showBack = false,
    onBack,
}: GlobalHeaderProps) {
    const { t } = useTranslation();
    const { role, schoolType } = useUserRole();
    const teacherName = useStore(state => state.teacherName);

    // Get role display text
    const getRoleText = () => {
        switch (role) {
            case 'principal': return t('role.principal') || 'Principal';
            case 'section_head': return t('role.sectionHead') || 'Section Head';
            case 'grade_head': return t('role.gradeHead') || 'Grade Head';
            case 'teacher': return t('role.teacher') || 'Teacher';
            case 'student': return t('role.student') || 'Student';
            default: return '';
        }
    };

    return (
        <Box
            sx={{
                paddingHorizontal: Theme.spacing.lg,
                paddingTop: 60, // Status bar space
                paddingBottom: Theme.spacing.md,
                backgroundColor: Theme.colors.voidIndigo,
                borderBottomWidth: 1,
                borderBottomColor: Theme.colors.deepIndigo,
            }}
        >
            <HStack
                sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <HStack space="md" alignItems="center" sx={{ flex: 1 }}>
                    {showBack && (
                        <Pressable onPress={onBack} style={{ marginRight: Theme.spacing.xs }}>
                            <ChevronLeft color={Theme.colors.sanctuarySaffron} size={28} />
                        </Pressable>
                    )}
                    <VStack space="xs" sx={{ flex: 1 }}>
                        {showGreeting ? (
                            <>
                                <Text
                                    color={Theme.colors.sanctuarySaffron}
                                    size="sm"
                                    sx={{ fontStyle: 'italic' }}
                                >
                                    {t('greeting.ayubowan') || 'Ayubowan'} 🙏
                                </Text>
                                <Heading
                                    size="xl"
                                    color={Theme.colors.sacredWhite}
                                    sx={{ lineHeight: 32 }}
                                >
                                    {teacherName}
                                </Heading>
                            </>
                        ) : (
                            <Heading
                                size="xl"
                                color={Theme.colors.sacredWhite}
                                sx={{ lineHeight: 36 }}
                            >
                                {title}
                            </Heading>
                        )}

                        {(subtitle || showGreeting) && (
                            <Text color={Theme.colors.mistGray} size="sm">
                                {subtitle || `${getRoleText()} • ${schoolType ? t(`school.${schoolType}`) : 'School'}`}
                            </Text>
                        )}
                    </VStack>
                </HStack>

                {rightAction && (
                    <Box sx={{ marginLeft: Theme.spacing.md }}>
                        {rightAction}
                    </Box>
                )}
            </HStack>
        </Box>
    );
}
