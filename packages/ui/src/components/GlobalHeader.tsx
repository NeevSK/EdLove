import React, { useState } from 'react';
import { HStack, VStack, Text, Box, Input, InputField, InputIcon, Pressable } from '../gluestack';
import { useTranslation } from 'react-i18next';
import { Theme } from '../theme/Theme';
import { useUserRole, useStore } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { Bell, Menu, GraduationCap, School, Crown, Search, X, ChevronLeft } from 'lucide-react-native';
import { useThemedColors } from '../hooks/useThemedColors';
import { useTheme } from '../hooks/useTheme';
import SanctuaryInput from './SanctuaryInput';
import { hapticLight, hapticMedium } from '../utils/haptics';
import NotificationDrawer from './NotificationDrawer';
import { TouchableOpacity } from 'react-native';
import { UserAvatar } from './UserAvatar';

interface GlobalHeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    showMenu?: boolean;
    showSearch?: boolean;
    rightAction?: React.ReactNode;
    userName?: string; // Optional override, usually gets from store
    searchProps?: {
        value: string;
        onChangeText: (text: string) => void;
        placeholder?: string;
    };
    isSelfView?: boolean;
    avatarUrl?: string;
}

export default function GlobalHeader({
    title,
    subtitle,
    showBack,
    onBack,
    showMenu = false,
    showSearch = false,
    rightAction,
    userName,
    searchProps,
    isSelfView = false,
    avatarUrl
}: GlobalHeaderProps) {
    const { t } = useTranslation();
    const { role } = useUserRole(); // Get current role from store
    const user = useStore((state: any) => state.user); // Get user details
    const navigation = useNavigation<any>();
    const colors = useThemedColors();
    const { glass, text, accent, isDark, blurEnabled } = useTheme();

    const [isSearchActive, setIsSearchActive] = useState(false);
    // Use internal state if searchProps is not provided
    const [internalSearchQuery, setInternalSearchQuery] = useState('');

    const searchQuery = searchProps?.value ?? internalSearchQuery;
    const setSearchQuery = searchProps?.onChangeText ?? setInternalSearchQuery;
    const [showNotifications, setShowNotifications] = useState(false);

    // Get display name
    const displayName = userName || (user?.user_metadata?.full_name?.split(' ')[0]) || '';
    const userFullName = userName || user?.user_metadata?.full_name || '';

    // Get role icon and label
    const getRoleContext = () => {
        switch (role) {
            case 'teacher':
                return { icon: GraduationCap, label: 'Teacher' };
            case 'principal':
            case 'admin':
                return { icon: Crown, label: 'Principal' };
            case 'student':
            default:
                return { icon: School, label: 'Student' };
        }
    };

    const { icon: RoleIcon, label: RoleLabel } = getRoleContext();

    // Determine greeting based on time of day
    const getGreetingDetails = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: t('goodMorning', 'Good Morning'), emoji: '🌅' };
        if (hour < 18) return { text: t('goodAfternoon', 'Good Afternoon'), emoji: '☀️' };
        return { text: t('goodEvening', 'Good Evening'), emoji: '🏮' };
    };

    const { text: greetingText, emoji } = getGreetingDetails();

    return (
        <VStack sx={{ gap: '$md' as any, marginBottom: '$4' as any, paddingHorizontal: '$4' as any }}>
            <HStack sx={{ gap: '$sm' as any, alignItems: 'center', justifyContent: 'space-between' }}>
                {/* LEFT: Greeting or Title */}
                <HStack sx={{ gap: '$sm' as any, alignItems: 'center' }}>
                    {/* Only show Profile Icon/Menu if specifically requested */}
                    {showBack ? (
                        <Pressable onPress={onBack || (() => navigation.goBack())}>
                            <Box sx={{
                                backgroundColor: colors.secondary,
                                padding: 8,
                                borderRadius: 12,
                            }}>
                                <ChevronLeft size={24} color={text.primary} />
                            </Box>
                        </Pressable>
                    ) : showMenu && (
                        <Pressable onPress={() => navigation.openDrawer && navigation.openDrawer()}>
                            <Menu color={text.primary} size={24} />
                        </Pressable>
                    )}

                    {isSelfView && (
                        <Pressable
                            onPress={() => navigation.navigate('Profile')}
                            style={{ marginRight: Theme.spacing.md }}
                        >
                            <UserAvatar
                                avatarUrl={avatarUrl || user?.user_metadata?.avatar_url}
                                fullName={userFullName}
                                role={role}
                                size={32}
                                borderRadius={12}
                            />
                        </Pressable>
                    )}

                    <VStack>
                        {(subtitle || (!title && greetingText)) && (
                            <Text
                                color={text.secondary}
                                sx={{
                                    fontSize: '$xs' as any,
                                    letterSpacing: 0.5,
                                    fontWeight: 'bold',
                                    fontFamily: Theme.typography.fontFamily.english
                                }}
                            >
                                {title ? subtitle : `${greetingText} ${emoji}`}
                            </Text>
                        )}
                        <Text
                            color={text.primary}
                            sx={{
                                fontSize: '$lg' as any,
                                fontFamily: Theme.typography.fontFamily.english,
                                fontWeight: 'bold'
                            }}
                        >
                            {title ? title : (isSelfView ? (role === 'student' ? userFullName : RoleLabel) : displayName)}
                        </Text>
                    </VStack>
                </HStack>

                {/* RIGHT: Actions */}
                <HStack sx={{ gap: '$md' as any, alignItems: 'center' }}>
                    {showSearch && (
                        <TouchableOpacity
                            onPress={() => {
                                hapticLight();
                                setIsSearchActive(!isSearchActive);
                            }}
                        >
                            <Box sx={{
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: isSearchActive ? colors.tertiary : 'transparent'
                            }}>
                                {isSearchActive ? (
                                    <X size={22} color={text.primary} />
                                ) : (
                                    <Search size={22} color={text.primary} />
                                )}
                            </Box>
                        </TouchableOpacity>
                    )}

                    {rightAction ? rightAction : (
                        <TouchableOpacity onPress={() => {
                            hapticLight();
                            setShowNotifications(true);
                        }}>
                            <Box sx={{ position: 'relative' }}>
                                <Bell size={24} color={text.primary} />
                                {/* Notification Dot */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 2,
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: accent.action,
                                    borderWidth: 1,
                                    borderColor: colors.primary
                                }} />
                            </Box>
                        </TouchableOpacity>
                    )}
                </HStack>
            </HStack>

            {/* EXPANDABLE SEARCH BAR */}
            {isSearchActive && (
                <Box sx={{
                    marginTop: Theme.spacing.sm,
                }}>
                    <SanctuaryInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={t('searchPlaceholder', 'Find anything...')}
                        leftIcon={Search}
                        autoFocus
                    />
                </Box>
            )}

            <NotificationDrawer
                isVisible={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </VStack>
    );
}
