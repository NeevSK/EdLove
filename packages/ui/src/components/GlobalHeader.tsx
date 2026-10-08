import { type TotalState, useNotifications, usePermissions, useStore } from '@repo/core/logic';
import { BondBadge } from '@repo/ui/components/BondBadge';
import NotificationDrawer from '@repo/ui/components/NotificationDrawer';
import SanctuaryInput from '@repo/ui/components/SanctuaryInput';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Bell, ChevronDown, ChevronLeft, Menu, Search, X } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight } from '@repo/ui/utils/haptics';
import { getHeaderGreeting, getHeaderRoleContext } from '@repo/ui/utils/headerUtils';
import { safeBack } from '@repo/ui/utils/navigation';
import { router } from 'expo-router';
import type React from 'react';
import { useCallback, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import Reanimated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
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
  perspectivePill?: {
    label: string;
    badge?: string;
    kind?: 'personal' | 'commercial' | 'institutional' | 'guardian';
    onPress?: () => void;
  };
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
  perspectivePill,
}: GlobalHeaderProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const theme = useTheme();
  const user = useStore((state: TotalState) => state.user);
  const insets = useSafeAreaInsets();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const isCompactLandscape = viewportWidth > viewportHeight && viewportHeight < 600;

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

  const roleContext = useMemo(() => getHeaderRoleContext(can, t), [can, t]);
  const greetingDetails = useMemo(() => getHeaderGreeting(t), [t]);

  const handleToggleSearch = useCallback(() => {
    hapticLight();
    dispatch({ type: 'TOGGLE_SEARCH' });
  }, []);

  const handleOpenNotifications = useCallback(() => {
    hapticLight();
    dispatch({ type: 'SET_NOTIFICATIONS', show: true });
  }, []);

  const handleOpenDrawer = useCallback(() => {
    hapticLight();
    router.push('/self');
  }, []);

  const handleCloseNotifications = useCallback(() => {
    dispatch({ type: 'SET_NOTIFICATIONS', show: false });
  }, []);

  const handleBack = useCallback(() => {
    hapticLight();
    if (onBack) {
      onBack();
      return;
    }
    safeBack('/self');
  }, [onBack]);

  const handleNavigateProfile = useCallback(() => {
    hapticLight();
    router.push('/profile');
  }, []);

  const handlePerspectivePress = useCallback(() => {
    if (perspectivePill?.onPress) {
      hapticLight();
      perspectivePill.onPress();
    }
  }, [perspectivePill]);

  const {
    notifications,
    unreadCount,
    isLoading,
    isRealtimeConnected,
    error,
    markAsRead,
    markAllRead,
  } = useNotifications(user?.id);


  return (
    <Box
      accessibilityRole="header"
      className="w-full relative"
      style={{
        paddingTop: insets.top + (isCompactLandscape ? 6 : 10),
        paddingBottom: isCompactLandscape ? 6 : 12,
      }}
    >
      {/* Living Phase Backdrop */}
      <Box
        className="absolute inset-0 border-b"
        style={{
          backgroundColor: theme.isDark ? '#1A1610' : '#F5EDD6',
          borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(42,35,24,0.08)',
          opacity: 0.98,
        }}
      />

      <VStack
        className="flex-1 px-4"
        style={{
          gap: isCompactLandscape ? 6 : 10,
        }}
      >
        <HStack className="items-center justify-between gap-2">
          {/* Left / Center Navigation Section */}
          <HStack className="items-center gap-2 flex-1">
            {showBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.back', 'Go back')}
                accessibilityHint={t('common.backHint', 'Returns to the previous screen')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={handleBack}
              >
                <Box
                  className="p-2 rounded-xl"
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
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                onPress={handleNavigateProfile}
              >
                <Box className="mr-1.5">
                  <UserAvatar
                    avatarUrl={avatarUrl || user?.avatar_url}
                    fullName={userFullName}
                    fallbackEmoji={roleContext.emoji}
                    size={32}
                    borderRadius={12}
                  />
                </Box>
              </Pressable>
            )}

            <VStack className="gap-0.5 flex-1">
              {!isCompactLandscape && (subtitle || (!title && greetingDetails.text)) && (
                <HStack className="items-center gap-1">
                  <Text className="text-[10px] font-bold tracking-widest uppercase text-phase-text-secondary">
                    {title ? subtitle : greetingDetails.text}
                  </Text>
                  {!title && <Text className="text-xs">{greetingDetails.emoji}</Text>}
                </HStack>
              )}

              {perspectivePill ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Current perspective: ${perspectivePill.label}. Tap to switch perspective.`}
                  onPress={handlePerspectivePress}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 2,
                  }}
                >
                  <HStack
                    style={{
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <BondBadge
                      label={perspectivePill.label}
                      kind={perspectivePill.kind || 'personal'}
                      size="sm"
                    />
                    {perspectivePill.onPress ? (
                      <ChevronDown size={14} color={tokens.colors.inkSubtle} />
                    ) : null}
                  </HStack>
                </Pressable>
              ) : (
                <Text
                  className={`${isCompactLandscape ? 'text-base' : 'text-lg'} font-bold text-phase-text-primary`}
                  numberOfLines={1}
                >
                  {title
                    ? title
                    : isSelfView
                      ? showFullNameAsPrimary
                        ? userFullName
                        : roleContext.label
                      : displayName}
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Right Action Bar */}
          <HStack className="items-center gap-2.5">
            {showSearch && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  state.isSearchActive
                    ? t('common.closeSearch', 'Close search')
                    : t('common.search', 'Search')
                }
                accessibilityState={{ expanded: state.isSearchActive }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={handleToggleSearch}
              >
                <Box
                  className="p-2 rounded-full"
                  style={{
                    backgroundColor: state.isSearchActive
                      ? tokens.colors.surfaceInteractive
                      : 'transparent',
                  }}
                >
                  {state.isSearchActive ? (
                    <X size={22} className="text-phase-text-primary" />
                  ) : (
                    <Search size={22} className="text-phase-text-primary" />
                  )}
                </Box>
              </Pressable>
            )}

            {rightAction ? (
              rightAction
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('notifications.title', 'Notifications')}
                accessibilityHint={
                  unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                    : 'Open your notifications'
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={handleOpenNotifications}
              >
                <Box
                  className="relative p-2 rounded-full"
                  style={{ backgroundColor: tokens.colors.surfaceInteractive }}
                >
                  <Bell
                    size={22}
                    className={
                      error ? 'text-phase-text-secondary opacity-50' : 'text-phase-text-primary'
                    }
                  />
                  {(error || isLoading || (unreadCount > 0 && !error)) && (
                    <Box
                      className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: error
                          ? tokens.colors.error
                          : isLoading
                            ? tokens.colors.warning
                            : tokens.colors.success,
                        borderWidth: 1.5,
                        borderColor: theme.isDark ? '#1A1610' : '#F5EDD6',
                      }}
                    />
                  )}
                </Box>
              </Pressable>
            )}
          </HStack>
        </HStack>

        {/* Smooth Animated In-Place Search Input Row */}
        {state.isSearchActive && (
          <Reanimated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOutUp.duration(150)}
            layout={LinearTransition.duration(200)}
            style={{ overflow: 'hidden' }}
          >
            <Box className="pt-1">
              <SanctuaryInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchProps?.placeholder ?? t('searchPlaceholder', 'Search...')}
                leftIcon={Search}
              />
            </Box>
          </Reanimated.View>
        )}

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
