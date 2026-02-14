/**
 * GlobalHeader Component
 * 
 * A unified header component to replace individual screen headers.
 */

import React from 'react';
import { Box, HStack, VStack, Text, Heading } from '@/ui';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { useUserRole } from '../../hooks/useUserRole';
import { useStore } from '../../store/useStore';
import { ChevronLeft, Search, User } from 'lucide-react-native';
import { Pressable, TouchableOpacity } from 'react-native';
import { useThemedColors } from '../../hooks/useThemedColors';
import SanctuaryInput from './SanctuaryInput';
import { hapticLight } from '../../utils/haptics';
import NotificationDrawer from './NotificationDrawer';

interface GlobalHeaderProps {
    title?: string;
    showGreeting?: boolean;
    subtitle?: string;
    rightAction?: React.ReactNode;
    showBack?: boolean;
    onBack?: () => void;
    searchProps?: {
        value: string;
        onChangeText: (text: string) => void;
        placeholder?: string;
    };
}

export default function GlobalHeader({
    title,
    showGreeting = false,
    subtitle,
    rightAction,
    showBack = false,
    onBack,
    searchProps,
}: GlobalHeaderProps) {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const teacherName = useStore(state => state.teacherName);
    const colors = useThemedColors();
    const [showSearch, setShowSearch] = React.useState(false);
    const [isNotificationVisible, setIsNotificationVisible] = React.useState(false);

    // Get time-aware greeting
    const getTimeAwareGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { key: 'self.goodMorning', emoji: '🌄' };
        if (hour >= 12 && hour < 17) return { key: 'self.goodAfternoon', emoji: '☀️' };
        if (hour >= 17 && hour < 21) return { key: 'self.goodEvening', emoji: '🌆' };
        return { key: 'self.goodNight', emoji: '🌙' };
    };

    // Get role display text
    const getRoleText = () => {
        if (!role) return '';
        const roleLabel = t(`role.${role.toLowerCase()}`) || role;
        return roleLabel;
    };

    const greeting = getTimeAwareGreeting();

    return (
        <Box
            sx={{
                paddingHorizontal: 0,
                paddingTop: 8,
                paddingBottom: Theme.spacing.xs,
                backgroundColor: 'transparent',
            }}
        >
            <HStack
                sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <HStack space={0} alignItems="center" sx={{ flex: 1.5 }}>
                    {showBack && (
                        <Pressable onPress={onBack} style={{ marginRight: Theme.spacing.xs, paddingLeft: Theme.spacing.md }}>
                            <ChevronLeft color={colors.action} size={28} />
                        </Pressable>
                    )}

                    {showGreeting ? (
                        <HStack space={0} alignItems="center">
                            <TouchableOpacity
                                onPress={() => {
                                    hapticLight();
                                    setIsNotificationVisible(true);
                                }}
                                style={{ position: 'relative', paddingLeft: 4 }}
                            >
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.tertiary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}>
                                    <User size={24} color={colors.action} />
                                </Box>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: -2,
                                    width: 12,
                                    height: 12,
                                    borderRadius: 6,
                                    backgroundColor: colors.error,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                }} />
                            </TouchableOpacity>

                            <Box sx={{ width: 10 }} />

                            <VStack sx={{ flexShrink: 1 }}>
                                <Heading
                                    size="md"
                                    color={colors.text}
                                    sx={{ lineHeight: 20 }}
                                    numberOfLines={1}
                                >
                                    {teacherName || '...'}
                                </Heading>
                                <Text color={colors.textSecondary} size="xs" numberOfLines={1}>
                                    {getRoleText()}
                                </Text>
                            </VStack>
                        </HStack>
                    ) : (
                        <Box sx={{ paddingLeft: Theme.spacing.md }}>
                            <Heading
                                size="xl"
                                color={colors.text}
                                sx={{ lineHeight: 32 }}
                            >
                                {title}
                            </Heading>
                        </Box>
                    )}
                </HStack>

                <HStack space="md" alignItems="center" sx={{ flex: 1, justifyContent: 'flex-end', paddingRight: Theme.spacing.md }}>
                    {showGreeting && (
                        <VStack alignItems="flex-end" space={0}>
                            <Text
                                color={colors.action as any}
                                size="lg"
                                sx={{
                                    lineHeight: 24,
                                    textAlign: 'right'
                                }}
                            >
                                {greeting.emoji}
                            </Text>
                            <Text
                                color={colors.action as any}
                                size="md"
                                sx={{
                                    fontStyle: 'italic',
                                    fontWeight: 'bold',
                                    letterSpacing: 1.5,
                                    textAlign: 'right',
                                    lineHeight: 20
                                }}
                            >
                                {t(greeting.key)}
                            </Text>
                        </VStack>
                    )}

                    {searchProps && (
                        <Pressable onPress={() => { hapticLight(); setShowSearch(!showSearch); }}>
                            <Search color={colors.textSecondary} size={24} />
                        </Pressable>
                    )}
                    {rightAction && (
                        <Box sx={{ marginLeft: Theme.spacing.xs }}>
                            {rightAction}
                        </Box>
                    )}
                </HStack>
            </HStack>

            {searchProps && showSearch && (
                <Box mt="$2">
                    <SanctuaryInput
                        placeholder={searchProps.placeholder || t('common.search') || "Search..."}
                        value={searchProps.value}
                        onChangeText={searchProps.onChangeText}
                        leftIcon={Search}
                        autoFocus
                    />
                </Box>
            )}

            <NotificationDrawer
                isVisible={isNotificationVisible}
                onClose={() => setIsNotificationVisible(false)}
            />
        </Box>
    );
}
