import { useAuthStore } from '@repo/core/store';
import { useScopedNotifications } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import NotificationDrawer from '@repo/ui/components/NotificationDrawer';
import { AppHeader, type AppHeaderProps, SceneBackdrop, useScene } from '@repo/ui/components/native';
import { Bell, ChevronLeft, Menu, QrCode, Search, X } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { BAND_WASH_EDGE, BAND_WASH_TEXT } from '@repo/ui/theme/scene';
import { getHeaderGreeting, getHeaderRoleContext } from '@repo/ui/utils/headerUtils';
import { safeBack } from '@repo/ui/utils/navigation';
import { router } from 'expo-router';
import type React from 'react';
import { useCallback, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface GlobalHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  showSearch?: boolean;
  showQRScan?: boolean;
  onQRScan?: () => void;
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
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_SEARCH' };

function headerReducer(state: HeaderState, action: HeaderAction): HeaderState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, showNotifications: action.show };
    case 'SET_SEARCH_QUERY':
      return { ...state, internalSearchQuery: action.query };
    case 'TOGGLE_SEARCH':
      return { ...state, isSearchActive: !state.isSearchActive };
    default:
      return state;
  }
}

/**
 * The app's header: the same places and behaviour as always (back or menu,
 * the person, greeting and title or perspective; search, QR and the bell),
 * drawn by the kit's AppHeader so every world dresses it. The scene band and
 * safe area stay here, the frame's concerns.
 */
export default function GlobalHeader({
  title,
  subtitle,
  showBack,
  onBack,
  showMenu = false,
  showSearch = false,
  showQRScan = false,
  onQRScan,
  rightAction,
  userName,
  searchProps,
  isSelfView = false,
  avatarUrl,
  perspectivePill,
}: GlobalHeaderProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const wt = useWorld().tokens;
  const user = useAuthStore((state) => state.user);
  const scene = useScene({ presence: 'band' });
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = width > height && height < 600;

  const [state, dispatch] = useReducer(headerReducer, {
    showNotifications: false,
    isSearchActive: false,
    internalSearchQuery: '',
  });

  const searchQuery = searchProps?.value ?? state.internalSearchQuery;
  const setSearchQuery = useCallback(
    (text: string) => {
      if (searchProps?.onChangeText) searchProps.onChangeText(text);
      else dispatch({ type: 'SET_SEARCH_QUERY', query: text });
    },
    [searchProps],
  );

  const displayName = userName || user?.display_name?.split(' ')[0] || '';
  const userFullName = userName || user?.display_name || '';
  const showFullNameAsPrimary = can('manage', 'StudentDashboard');
  const roleContext = useMemo(() => getHeaderRoleContext(can, t), [can, t]);
  const greetingDetails = useMemo(() => getHeaderGreeting(t), [t]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else safeBack('/self');
  }, [onBack]);

  const { notifications, unreadCount, isLoading, isRealtimeConnected, error, markAsRead, markAllRead } =
    useScopedNotifications(user?.id);

  const resolvedTitle = title
    ? title
    : isSelfView
      ? showFullNameAsPrimary
        ? userFullName
        : roleContext.label
      : displayName;

  const actions: NonNullable<AppHeaderProps['actions']>[number][] = [];
  if (showSearch) {
    actions.push({
      key: 'search',
      label: state.isSearchActive ? t('common.closeSearch', 'Close search') : t('common.search', 'Search'),
      icon: state.isSearchActive ? X : Search,
      expanded: state.isSearchActive,
      onPress: () => dispatch({ type: 'TOGGLE_SEARCH' }),
    });
  }
  if (showQRScan) {
    actions.push({
      key: 'qr',
      label: t('common.scanQr', 'Scan QR code'),
      icon: QrCode,
      onPress: () => (onQRScan ? onQRScan() : router.push('/qr')),
    });
  }
  if (!rightAction) {
    actions.push({
      key: 'notifications',
      label: t('notifications.title', 'Notifications'),
      icon: Bell,
      onPress: () => dispatch({ type: 'SET_NOTIFICATIONS', show: true }),
      // Error and loading are a quiet dot; unread is a counted lamp. Both are said.
      ...(error
        ? { badge: 'dot' as const, badgeTone: 'danger' as const, badgeLabel: t('notifications.unavailable', 'not updating') }
        : unreadCount > 0
          ? {
              badge: unreadCount,
              badgeTone: 'lamp' as const,
              badgeLabel: t('notifications.unreadCount', '{{count}} unread', { count: unreadCount }),
            }
          : isLoading
            ? { badge: 'dot' as const, badgeTone: 'quiet' as const, badgeLabel: t('common.loading', 'loading') }
            : {}),
    });
  }

  return (
    <View style={{ width: '100%', paddingTop: insets.top + (compact ? 2 : 4) }}>
      {/* The world's ground, with the room's scene showing through as a band when verger allows. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: wt.ground }}
      />
      <SceneBackdrop
        scene={scene}
        wash={{ colour: wt.ground, edge: BAND_WASH_EDGE, text: BAND_WASH_TEXT, textFrom: 0.42 }}
      />
      <AppHeader
        title={resolvedTitle}
        eyebrow={title ? subtitle : greetingDetails.text}
        leading={
          showBack
            ? { kind: 'back', label: t('common.back', 'Go back'), onPress: handleBack }
            : showMenu
              ? { kind: 'menu', label: t('common.openSelf', 'Open Self'), onPress: () => router.push('/self') }
              : undefined
        }
        icons={{ back: ChevronLeft, menu: Menu }}
        avatar={
          isSelfView
            ? {
                name: userFullName || roleContext.label,
                src: avatarUrl || user?.avatar_url || undefined,
                label: t('profile.open', 'Open profile'),
                onPress: () => router.push('/profile'),
              }
            : undefined
        }
        perspective={
          perspectivePill
            ? {
                label: perspectivePill.badge ? `${perspectivePill.label} · ${perspectivePill.badge}` : perspectivePill.label,
                onPress: perspectivePill.onPress,
                switchLabel: perspectivePill.onPress ? t('perspective.switch', 'Switch perspective') : undefined,
              }
            : undefined
        }
        actions={actions}
        trailing={rightAction}
        search={
          showSearch
            ? {
                open: state.isSearchActive,
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: searchProps?.placeholder ?? t('searchPlaceholder', 'Search...'),
                label: t('common.search', 'Search'),
              }
            : undefined
        }
        compact={compact}
        ruled
      />
      <NotificationDrawer
        isVisible={state.showNotifications}
        onClose={() => dispatch({ type: 'SET_NOTIFICATIONS', show: false })}
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
    </View>
  );
}
