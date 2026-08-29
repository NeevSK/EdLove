import { type TotalState, useNotifications, usePermissions, useStore } from '@repo/core/logic';
import NotificationDrawer from '@repo/ui/components/NotificationDrawer';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { Bell, ChevronLeft, Menu, MoreHorizontal, Search, X } from '@repo/ui/icons';
import { Pressable } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import { router } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const isCompactLandscape = viewportWidth > viewportHeight && viewportHeight < 600;
  const roleLabel = useRoleLabel();
  const [showSecondaryActions, setShowSecondaryActions] = useState(false);
  const animatedSecondary = useState(() => new Animated.Value(0))[0];

  const [state, dispatch] = useReducer(headerReducer, {
    showNotifications: false,
    isSearchActive: false,
    internalSearchQuery: '',
  });

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
    if (hour < 12) return { text: t('goodMorning') };
    if (hour < 18) return { text: t('goodAfternoon') };
    return { text: t('goodEvening') };
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
    safeBack('/self');
  }, [onBack]);

  const handleNavigateProfile = useCallback(() => {
    router.push('/profile');
  }, []);

  const toggleSecondaryActions = useCallback(() => {
    setShowSecondaryActions((value) => !value);
  }, []);

  const {
    notifications,
    unreadCount,
    isLoading,
    isRealtimeConnected,
    error,
    markAsRead,
    markAllRead,
  } = useNotifications(user?.id);

  useEffect(() => {
    Animated.timing(animatedSecondary, {
      toValue: showSecondaryActions ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animatedSecondary, showSecondaryActions]);

  const secondaryMaxHeight = animatedSecondary.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isCompactLandscape ? 52 : 64],
  });

  const secondaryOpacity = animatedSecondary.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const headerHeight =
    insets.top +
    (isCompactLandscape ? 64 : 92) +
    (showSecondaryActions ? (isCompactLandscape ? 52 : 64) : 0);

  return (
    <Box accessibilityRole="header" className="w-full relative" style={{ height: headerHeight }}>
      <Box
        className="absolute inset-0 border-b"
        style={{
          opacity: 0.98,
          backgroundColor: '#F5EDD6',
          borderBottomColor: 'rgba(42,35,24,0.08)',
        }}
      />

      <VStack
        className="flex-1 px-4"
        style={{
          gap: isCompactLandscape ? 6 : 12,
          paddingTop: insets.top + (isCompactLandscape ? 6 : 10),
          paddingBottom: isCompactLandscape ? 6 : 12,
        }}
      >
        <HStack className="items-center justify-between gap-2">
          <HStack className="items-center gap-2">
            {showBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.back', 'Go back')}
                accessibilityHint={t('common.backHint', 'Returns to the previous screen')}
                onPress={handleBack}
              >
                <Box
                  className="p-2 rounded-full"
                  style={{ backgroundColor: tokens.colors.surfaceInteractive }}
                >
                  <ChevronLeft size={24} className="text-phase-text-primary" />
                </Box>
              </Pressable>
            ) : (
              showMenu && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.openSelf', 'Open Self')}
                  onPress={handleOpenDrawer}
                >
                  <Menu className="text-phase-text-primary" size={24} />
                </Pressable>
              )
            )}

            {isSelfView && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('profile.open', 'Open profile')}
                onPress={handleNavigateProfile}
              >
                <Box className="mr-2">
                  <UserAvatar
                    avatarUrl={avatarUrl || user?.avatar_url}
                    fullName={userFullName}
                    fallbackEmoji="G"
                    size={32}
                    borderRadius={12}
                  />
                </Box>
              </Pressable>
            )}

            <VStack className="gap-0.5">
              {!isCompactLandscape && (subtitle || (!title && greetingDetails.text)) && (
                <HStack className="items-center gap-1">
                  <Text className="text-[10px] font-bold tracking-widest uppercase text-phase-text-secondary">
                    {title ? subtitle : greetingDetails.text}
                  </Text>
                </HStack>
              )}
              <Text
                className={`${isCompactLandscape ? 'text-base' : 'text-lg'} font-bold text-phase-text-primary`}
              >
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                showSecondaryActions
                  ? t('common.closeActions', 'Close actions')
                  : t('common.moreActions', 'More actions')
              }
              accessibilityState={{ expanded: showSecondaryActions }}
              onPress={toggleSecondaryActions}
            >
              <Box
                className="p-2 rounded-full"
                style={{ backgroundColor: tokens.colors.surfaceInteractive }}
              >
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
          <VStack style={{ gap: 10 }}>
            {showSearch && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  state.isSearchActive
                    ? t('common.closeSearch', 'Close search')
                    : t('common.search', 'Search')
                }
                accessibilityState={{ expanded: state.isSearchActive }}
                onPress={handleToggleSearch}
              >
                <Box
                  className="p-2 rounded-2xl"
                  style={{
                    backgroundColor: state.isSearchActive
                      ? tokens.colors.surfaceInteractive
                      : tokens.colors.surfaceSubtle,
                  }}
                >
                  <HStack className="items-center gap-2">
                    {state.isSearchActive ? (
                      <X size={20} className="text-phase-text-primary" />
                    ) : (
                      <Search size={20} className="text-phase-text-primary" />
                    )}
                    <Text className="text-sm text-phase-text-primary">
                      {state.isSearchActive ? 'Close search' : 'Search'}
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            )}

            {!rightAction ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('notifications.title', 'Notifications')}
                onPress={handleOpenNotifications}
              >
                <Box
                  className="relative rounded-2xl p-2"
                  style={{ backgroundColor: tokens.colors.surfaceSubtle }}
                >
                  <HStack className="items-center gap-2">
                    <Bell size={20} className="text-phase-text-primary" />
                    <Text className="text-sm text-phase-text-primary">Notifications</Text>
                    {(error || isLoading || (unreadCount > 0 && !error)) && (
                      <Box
                        className="ml-auto w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: error
                            ? tokens.colors.error
                            : isLoading
                              ? tokens.colors.warning
                              : tokens.colors.success,
                        }}
                      />
                    )}
                  </HStack>
                </Box>
              </Pressable>
            ) : (
              rightAction
            )}
          </VStack>
        </Animated.View>

        <NotificationDrawer
          isVisible={state.showNotifications}
          onClose={handleCloseNotifications}
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
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
