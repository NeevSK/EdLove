import { useAuthStore } from '@repo/core/store';
import { useScopedNotifications } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import NotificationDrawer from '@repo/ui/components/NotificationDrawer';
import SanctuaryInput from '@repo/ui/components/SanctuaryInput';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { Bell, ChevronLeft, Menu, Search, X } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight } from '@repo/ui/utils/haptics';
import { getHeaderGreeting, getHeaderRoleContext } from '@repo/ui/utils/headerUtils';
import { router } from 'expo-router';
import type React from 'react';
import { useCallback, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
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
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

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
  } = useScopedNotifications(user?.id);

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

  const headerHeight = insets.top + 80 + (state.isSearchActive ? 64 : 0);

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
          gap: 10,
          paddingTop: insets.top + 12,
          paddingBottom: 12,
        }}
      >
        <HStack className="items-center justify-between gap-2">
          {/* Left / Center Section */}
          <HStack className="items-center gap-2 flex-1">
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
                    fallbackEmoji={roleContext.emoji}
                    size={32}
                    borderRadius={12}
                  />
                </Box>
              </Pressable>
            )}

            <VStack className="gap-0.5 flex-1">
              {(subtitle || (!title && greetingDetails.text)) && (
                <HStack className="items-center gap-1">
                  <Text className="text-[10px] font-bold tracking-widest uppercase text-phase-text-secondary">
                    {title ? subtitle : greetingDetails.text}
                  </Text>
                  {!title && <Text className="text-xs">{greetingDetails.emoji}</Text>}
                </HStack>
              )}
              <Text className="text-lg font-bold text-phase-text-primary" numberOfLines={1}>
                {title
                  ? title
                  : isSelfView
                    ? showFullNameAsPrimary
                      ? userFullName
                      : roleContext.label
                    : displayName}
              </Text>
            </VStack>
          </HStack>

          {/* Right Action Bar */}
          <HStack className="items-center gap-3">
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
                  className={`p-2 rounded-full ${state.isSearchActive ? 'bg-phase-accent/20' : 'bg-transparent'}`}
                >
                  {state.isSearchActive ? (
                    <X size={22} className="text-phase-accent" />
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
                onPress={handleOpenNotifications}
              >
                <Box className="relative p-2 rounded-full bg-white/8">
                  <Bell
                    size={22}
                    className={
                      error ? 'text-phase-text-secondary opacity-50' : 'text-phase-text-primary'
                    }
                  />
                  {(error || notifLoading || (unreadCount > 0 && !error)) && (
                    <Box
                      className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: error
                          ? tokens.colors.error
                          : notifLoading
                            ? tokens.colors.warning
                            : tokens.colors.success,
                        borderWidth: 1.5,
                        borderColor: '#2A2318',
                      }}
                    />
                  )}
                </Box>
              </Pressable>
            )}
          </HStack>
        </HStack>

        {/* In-place Search Input Row (Active State Only) */}
        {state.isSearchActive && (
          <Box className="mt-1">
            <SanctuaryInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchProps?.placeholder ?? t('searchPlaceholder', 'Search...')}
              leftIcon={Search}
            />
          </Box>
        )}

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
