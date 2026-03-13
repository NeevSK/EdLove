import React, { useState } from 'react';
import { Dimensions, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    Menu,
    Search,
    X,
    Bell,
    GraduationCap,
    Crown,
    School
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import {
    Box,
    VStack,
    HStack,
    Text
} from '../gluestack';
import { Theme } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { useThemedColors } from '../hooks/useThemedColors';
import { hapticLight } from '../utils/haptics';
import { TemporalGlass } from '../components-native/TemporalGlass';
import { UserAvatar } from './UserAvatar';
import SanctuaryInput from './SanctuaryInput';
import NotificationDrawer from './NotificationDrawer';

import { useUserRole, useStore, useNotifications } from '@repo/core';

export interface GlobalHeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    showMenu?: boolean;
    showSearch?: boolean;
    rightAction?: React.ReactNode;
    userName?: string;
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
    const { glass, text, accent, isDark, blurEnabled, phase } = useTheme();
    const insets = useSafeAreaInsets();

    const [showNotifications, setShowNotifications] = useState(false);
    const { notifications, unreadCount, isLoading: notifLoading, markAsRead, markAllRead } =
        useNotifications(user?.id);

    const [isSearchActive, setIsSearchActive] = useState(false);
    // Use internal state if searchProps is not provided
    const [internalSearchQuery, setInternalSearchQuery] = useState('');

    const searchQuery = searchProps?.value ?? internalSearchQuery;
    const setSearchQuery = searchProps?.onChangeText ?? setInternalSearchQuery;

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
        if (hour < 12) return { text: t('goodMorning'), emoji: '🌅' };
        if (hour < 18) return { text: t('goodAfternoon'), emoji: '☀️' };
        return { text: t('goodEvening'), emoji: '🏮' };
    };

    const { text: greetingText, emoji } = getGreetingDetails();

    const headerHeight = insets.top + (isSearchActive ? 120 : 80);

    return (
        <Box sx={{
            width: '100%',
            height: headerHeight,
            position: 'relative',
        }}>
            {/* GLASS BACKDROP */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
            }}>
                <BlurView
                    intensity={blurEnabled ? 36 : 0}
                    tint={isDark ? 'dark' : 'light'}
                    style={{ flex: 1, backgroundColor: glass.surface.bg }}
                />
                <TemporalGlass
                    width={Dimensions.get('window').width}
                    height={headerHeight}
                    phase={phase}
                    cornerRadius={0}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                >
                    <></>
                </TemporalGlass>
            </Box>

            <VStack sx={{
                flex: 1,
                gap: '$md' as any,
                paddingHorizontal: '$4' as any,
                paddingTop: insets.top + 14,
                paddingBottom: '$4' as any,
            }}>
                <HStack sx={{ gap: '$sm' as any, alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* LEFT: Greeting or Title */}
                    <HStack sx={{ gap: '$sm' as any, alignItems: 'center' }}>
                        {/* Only show Profile Icon/Menu if specifically requested */}
                        {showBack ? (
                            <Pressable onPress={onBack || (() => navigation.goBack())}>
                                <Box sx={{
                                    backgroundColor: glass.interact.bg,
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
                            >
                                <Box sx={{ marginRight: '$4' }}>
                                    <UserAvatar
                                        avatarUrl={avatarUrl || user?.user_metadata?.avatar_url}
                                        fullName={userFullName}
                                        role={role}
                                        size={32}
                                        borderRadius={12}
                                    />
                                </Box>
                            </Pressable>
                        )}

                        <VStack>
                            {(subtitle || (!title && greetingText)) && (
                                <HStack sx={{ gap: 4, alignItems: 'center' }}>
                                    <Text
                                        color={text.secondary}
                                        sx={{
                                            fontSize: '$xs' as any,
                                            letterSpacing: 0.5,
                                            fontWeight: 'bold',
                                            paddingBottom: 2, // Added to prevent clipping of descenders
                                            fontFamily: Theme.typography.fontFamily.english
                                        }}
                                    >
                                        {title ? subtitle : greetingText}
                                    </Text>
                                    {!title && (
                                        <Text sx={{ fontSize: 14, marginTop: -2 }}>
                                            {emoji}
                                        </Text>
                                    )}
                                </HStack>
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
                                    backgroundColor: isSearchActive ? glass.interact.bg : 'transparent'
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
                                    {unreadCount > 0 && (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 2,
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: accent.action,
                                            borderWidth: 1.5,
                                            borderColor: glass.surface.bg // Matches the Porcelain header background
                                        }} />
                                    )}
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
                            placeholder={searchProps?.placeholder ?? t('searchPlaceholder')}
                            leftIcon={Search}
                            autoFocus
                        />
                    </Box>
                )}

                <NotificationDrawer
                    isVisible={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    isLoading={notifLoading}
                    onMarkRead={markAsRead}
                    onMarkAllRead={markAllRead}
                />
            </VStack>
        </Box>
    );
}

