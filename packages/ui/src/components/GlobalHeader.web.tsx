import { type TotalState, useNotifications, usePermissions, useStore } from '@repo/core/logic';
import { router } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  Crown,
  GraduationCap,
  Menu,
  MoreHorizontal,
  School,
  Search,
  X,
} from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, HStack, Text, VStack } from '../gluestack';
import { Pressable } from '../primitives';
import { hapticLight } from '../utils/haptics';
import NotificationDrawer from './NotificationDrawer';
import SanctuaryInput from './SanctuaryInput';
import { UserAvatar } from './UserAvatar';

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
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
  };
  isSelfView?: boolean;
  avatarUrl?: string;
}

interface HeaderState {
  showNotifications: boolean;
  isSearchActive: boolean;
  internalSearchQuery: string;
}

type HeaderAction =
  | { type: 'SET_NOTIFICATIONS'; show: boolean }
  | { type: 'SET_SEARCH_ACTIVE'; active: boolean }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_SEARCH' };

function headerReducer(state: HeaderState, action: HeaderAction): HeaderState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, showNotifications: action.show };
    case 'SET_SEARCH_ACTIVE':
      return { ...state, isSearchActive: action.active };
    case 'SET_SEARCH_QUERY':
      return { ...state, internalSearchQuery: action.query };
    case 'TOGGLE_SEARCH':
      return { ...state, isSearchActive: !state.isSearchActive };
    default:
      return state;
  }
}

function useRoleLabel() {
  const { can } = usePermissions();
  const { t } = useTranslation();

  return useMemo(() => {
    if (can('manage', 'AdminDashboard')) return t('roles.admin') || 'Admin';
    if (can('manage', 'PrincipalDashboard')) return t('roles.principal') || 'Principal';
    if (can('manage', 'SectionHeadDashboard')) return t('roles.sectionHead') || 'Section Head';
    if (can('manage', 'GradeHeadDashboard')) return t('roles.gradeHead') || 'Grade Head';
    if (can('manage', 'TeacherDashboard')) return t('roles.teacher') || 'Teacher';
    if (can('manage', 'StudentDashboard')) return t('roles.student') || 'Student';
    return t('roles.member') || 'Member';
  }, [can, t]);
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
  avatarUrl,
}: GlobalHeaderProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const user = useStore((state: TotalState) => state.user);
  const insets = useSafeAreaInsets();
  const roleLabel = useRoleLabel();
  const [showSecondaryActions, setShowSecondaryActions] = useState(true);
  const animatedSecondary = useState(() => new Animated.Value(1))[0];

  const [state, dispatch] = useReducer(headerReducer, {
    showNotifications: false,
    isSearchActive: false,
    internalSearchQuery: '',
  });

  const {
    notifications,
    unreadCount,
    isLoading: notifLoading,
    isRealtimeConnected,
    error,
    markAsRead,
    markAllRead,
  } = useNotifications(user?.id);

  const searchQuery = searchProps?.value ?? state.internalSearchQuery;

  const setSearchQuery = useCallback(
    (text: string) => {
      if (searchProps?.onChangeText) {
        searchProps.onChangeText(text);
      } else {
        dispatch({ type: 'SET_SEARCH_QUERY', query: text });
      }
    },
    [searchProps],
  );

  const displayName = userName || user?.display_name?.split(' ')[0] || '';
  const userFullName = userName || user?.display_name || '';
  const showFullNameAsPrimary = can('manage', 'StudentDashboard');

  const greetingDetails = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t('goodMorning'), emoji: '🌅' };
    if (hour < 18) return { text: t('goodAfternoon'), emoji: '☀️' };
    return { text: t('goodEvening'), emoji: '🏮' };
  }, [t]);

  const handleToggleSearch = useCallback(() => {
    hapticLight();
    dispatch({ type: 'TOGGLE_SEARCH' });
  }, []);

  const handleOpenNotifications = useCallback(() => {
    hapticLight();
    dispatch({ type: 'SET_NOTIFICATIONS', show: true });
  }, []);

  const handleOpenDrawer = useCallback(() => {
    router.push('/self');
  }, []);

  const handleCloseNotifications = useCallback(() => {
    dispatch({ type: 'SET_NOTIFICATIONS', show: false });
  }, []);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  }, [onBack]);

  const handleNavigateProfile = useCallback(() => {
    router.push('/profile');
  }, []);

  const toggleSecondaryActions = useCallback(() => {
    setShowSecondaryActions((value) => !value);
  }, []);

  useEffect(() => {
    Animated.timing(animatedSecondary, {
      toValue: showSecondaryActions ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animatedSecondary, showSecondaryActions]);

  const secondaryMaxHeight = animatedSecondary.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 56],
  });

  const secondaryOpacity = animatedSecondary.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const headerHeight = insets.top + 84 + (showSecondaryActions ? 56 : 0);

  return (
    <Box accessibilityRole="header" className="w-full relative" style={{ height: headerHeight }}>
      <Box
        className="absolute inset-0 border-b"
        style={
          {
            opacity: 0.98,
            borderBottomColor: 'rgba(255,255,255,0.05)',
            background: 'linear-gradient(180deg, rgba(13,17,24,0.96) 0%, rgba(16,20,29,0.94) 100%)',
            backdropFilter: 'blur(16px)',
          } as any
        }
      />

      <VStack
        className="flex-1 px-4"
        style={{
          gap: 12,
          paddingTop: insets.top + 14,
          paddingBottom: 12,
        }}
      >
        <HStack className="items-center justify-between gap-2">
          <HStack className="items-center gap-2">
            {showBack ? (
              <Pressable accessibilityRole="button" onPress={handleBack}>
                <Box className="p-2 rounded-xl bg-white/8">
                  <ChevronLeft size={24} className="text-phase-text-primary" />
                </Box>
              </Pressable>
            ) : (
              showMenu && (
                <Pressable accessibilityRole="button" onPress={handleOpenDrawer}>
                  <Menu className="text-phase-text-primary" size={24} />
                </Pressable>
              )
            )}

            {isSelfView && (
              <Pressable accessibilityRole="button" onPress={handleNavigateProfile}>
                <Box className="mr-2">
                  <UserAvatar
                    avatarUrl={avatarUrl || user?.avatar_url}
                    fullName={userFullName}
                    fallbackEmoji={roleContextEmoji(can)}
                    size={32}
                    borderRadius={12}
                  />
                </Box>
              </Pressable>
            )}

            <VStack className="gap-0.5">
              {(subtitle || (!title && greetingDetails.text)) && (
                <HStack className="items-center gap-1">
                  <Text className="text-[10px] font-bold tracking-widest uppercase text-phase-text-secondary">
                    {title ? subtitle : greetingDetails.text}
                  </Text>
                  {!title && <Text className="text-sm -mt-0.5">{greetingDetails.emoji}</Text>}
                </HStack>
              )}
              <Text className="text-lg font-bold text-phase-text-primary">
                {title
                  ? title
                  : isSelfView
                    ? showFullNameAsPrimary
                      ? userFullName
                      : roleLabel
                    : displayName}
              </Text>
            </VStack>
          </HStack>

          <HStack className="items-center gap-2">
            <Pressable accessibilityRole="button" onPress={toggleSecondaryActions}>
              <Box className="p-2 rounded-full bg-white/8">
                <MoreHorizontal size={22} className="text-phase-text-primary" />
              </Box>
            </Pressable>
          </HStack>
        </HStack>

        <Animated.View
          style={{
            maxHeight: secondaryMaxHeight,
            opacity: secondaryOpacity,
            overflow: 'hidden',
          }}
        >
          <HStack className="items-center gap-2 pt-1">
            {showSearch && (
              <Pressable accessibilityRole="button" onPress={handleToggleSearch}>
                <Box
                  className={`px-3 py-2 rounded-full ${state.isSearchActive ? 'bg-phase-accent/20' : 'bg-white/8'}`}
                >
                  <HStack className="items-center gap-2">
                    {state.isSearchActive ? (
                      <X size={18} className="text-phase-accent" />
                    ) : (
                      <Search size={18} className="text-phase-text-primary" />
                    )}
                    <Text className="text-sm text-phase-text-primary">
                      {state.isSearchActive ? 'Close search' : 'Search'}
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            )}

            {rightAction ? (
              rightAction
            ) : (
              <Pressable accessibilityRole="button" onPress={handleOpenNotifications}>
                <Box className="relative px-3 py-2 rounded-full bg-white/8">
                  <HStack className="items-center gap-2">
                    <Bell
                      size={18}
                      className={
                        error ? 'text-phase-text-secondary opacity-50' : 'text-phase-text-primary'
                      }
                    />
                    <Text className="text-sm text-phase-text-primary">Notifications</Text>
                    {(error || notifLoading || (unreadCount > 0 && !error)) && (
                      <Box
                        className="ml-auto w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: error ? '#ef4444' : notifLoading ? '#f59e0b' : '#10b981',
                          boxShadow: `0 0 10px ${error ? '#ef4444' : notifLoading ? '#f59e0b' : '#10b981'}`,
                        }}
                      />
                    )}
                  </HStack>
                </Box>
              </Pressable>
            )}
          </HStack>
        </Animated.View>

        <NotificationDrawer
          isVisible={state.showNotifications}
          onClose={handleCloseNotifications}
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={notifLoading}
          isRealtimeConnected={isRealtimeConnected}
          error={error}
          onMarkRead={(id) => {
            void markAsRead(id);
          }}
          onMarkAllRead={() => {
            void markAllRead();
          }}
        />
      </VStack>
    </Box>
  );
}

function roleContextEmoji(can: (action: any, subject: any) => boolean) {
  if (can('manage', 'AdminDashboard')) return '⚡';
  if (can('manage', 'PrincipalDashboard')) return '🏛️';
  if (can('manage', 'SectionHeadDashboard')) return '🏔️';
  if (can('manage', 'GradeHeadDashboard')) return '🌲';
  if (can('manage', 'TeacherDashboard')) return '🌱';
  if (can('manage', 'StudentDashboard')) return '📚';
  return '🌿';
}
