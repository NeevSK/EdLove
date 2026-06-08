import { useNavigation } from '@react-navigation/native';
import { type TotalState, useNotifications, usePermissions, useStore } from '@repo/core/logic';
import {
  Bell,
  ChevronLeft,
  Crown,
  GraduationCap,
  Menu,
  School,
  Search,
  X,
} from 'lucide-react-native';
import type React from 'react';
import { useCallback, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, HStack, Text, VStack } from '../gluestack';
import { Pressable } from '../primitives';
import { hapticLight } from '../utils/haptics';
import NotificationDrawer from './NotificationDrawer';
import SanctuaryInput from './SanctuaryInput';
import { UserAvatar } from './UserAvatar';

// ──────────────────────────────────────────────────────────
// TYPES & REDUCER
// ──────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────

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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [state, dispatch] = useReducer(headerReducer, {
    showNotifications: false,
    isSearchActive: false,
    internalSearchQuery: '',
  });

  const { showNotifications, isSearchActive, internalSearchQuery } = state;

  const {
    notifications,
    unreadCount,
    isLoading: notifLoading,
    isRealtimeConnected,
    error,
    markAsRead,
    markAllRead,
  } = useNotifications(user?.id);

  const searchQuery = searchProps?.value ?? internalSearchQuery;

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

  const roleContext = useMemo(() => {
    if (can('manage', 'AdminDashboard')) {
      return { icon: Crown, emoji: '\u26A1', label: t('roles.admin') || 'Admin' };
    }
    if (can('manage', 'PrincipalDashboard')) {
      return {
        icon: Crown,
        emoji: '\uD83C\uDFDB\uFE0F',
        label: t('roles.principal') || 'Principal',
      };
    }
    if (can('manage', 'SectionHeadDashboard')) {
      return {
        icon: GraduationCap,
        emoji: '\uD83C\uDFD4\uFE0F',
        label: t('roles.sectionHead') || 'Section Head',
      };
    }
    if (can('manage', 'GradeHeadDashboard')) {
      return {
        icon: GraduationCap,
        emoji: '\uD83C\uDF32',
        label: t('roles.gradeHead') || 'Grade Head',
      };
    }
    if (can('manage', 'TeacherDashboard')) {
      return { icon: GraduationCap, emoji: '\uD83C\uDF31', label: t('roles.teacher') || 'Teacher' };
    }
    if (can('manage', 'StudentDashboard')) {
      return { icon: School, emoji: '\uD83D\uDCDA', label: t('roles.student') || 'Student' };
    }
    return { icon: School, emoji: '\uD83C\uDF3F', label: t('roles.member') || 'Member' };
  }, [can, t]);

  const greetingDetails = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t('goodMorning'), emoji: '\uD83C\uDF05' };
    if (hour < 18) return { text: t('goodAfternoon'), emoji: '\u2600\uFE0F' };
    return { text: t('goodEvening'), emoji: '\uD83C\uDFEE' };
  }, [t]);

  const handleToggleSearch = useCallback(() => {
    hapticLight();
    dispatch({ type: 'TOGGLE_SEARCH' });
  }, []);

  const handleOpenNotifications = useCallback(() => {
    hapticLight();
    dispatch({ type: 'SET_NOTIFICATIONS', show: true });
  }, []);

  const handleCloseNotifications = useCallback(() => {
    dispatch({ type: 'SET_NOTIFICATIONS', show: false });
  }, []);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  }, [onBack, navigation]);

  const handleOpenDrawer = useCallback(() => {
    (navigation as any).openDrawer?.();
  }, [navigation]);

  const handleNavigateProfile = useCallback(() => {
    (navigation as any).navigate('Profile');
  }, [navigation]);

  const headerHeight = insets.top + (isSearchActive ? 120 : 80);
  const showFullNameAsPrimary = can('manage', 'StudentDashboard');

  return (
    <Box accessibilityRole="header" className="w-full relative" style={{ height: headerHeight }}>
      <Box
        className="absolute inset-0 bg-phase-canvas border-b border-white/5"
        style={{ opacity: 0.95 }}
      />

      <VStack
        className="flex-1 px-4"
        style={{
          gap: 12,
          paddingTop: insets.top + 14,
          paddingBottom: 16,
        }}
      >
        <HStack className="items-center justify-between gap-2">
          <HStack className="items-center gap-2">
            {showBack ? (
              <Pressable accessibilityRole="button" onPress={handleBack}>
                <Box className="p-2 rounded-xl bg-phase-surface">
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
                      : roleContext.label
                    : displayName}
              </Text>
            </VStack>
          </HStack>

          <HStack className="items-center gap-4">
            {showSearch && (
              <TouchableOpacity accessibilityRole="button" onPress={handleToggleSearch}>
                <Box
                  className={`p-2 rounded-full ${isSearchActive ? 'bg-phase-accent/20' : 'bg-transparent'}`}
                >
                  {isSearchActive ? (
                    <X
                      size={22}
                      className={isSearchActive ? 'text-phase-accent' : 'text-phase-text-primary'}
                    />
                  ) : (
                    <Search size={22} className="text-phase-text-primary" />
                  )}
                </Box>
              </TouchableOpacity>
            )}

            {rightAction ? (
              rightAction
            ) : (
              <TouchableOpacity accessibilityRole="button" onPress={handleOpenNotifications}>
                <Box className="relative">
                  <Bell
                    size={24}
                    className={
                      error ? 'text-phase-text-secondary opacity-50' : 'text-phase-text-primary'
                    }
                  />
                  {/* Notification Badge Logic - High Fidelity Feedback */}
                  {(error || notifLoading || (unreadCount > 0 && !error)) && (
                    <Box
                      className={`absolute top-0 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-phase-canvas ${
                        error ? 'bg-red-500' : notifLoading ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{
                        backgroundColor: error ? '#ef4444' : notifLoading ? '#f59e0b' : '#10b981',
                        shadowColor: error ? '#ef4444' : notifLoading ? '#f59e0b' : '#10b981',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 6,
                        elevation: 5,
                      }}
                    />
                  )}
                </Box>
              </TouchableOpacity>
            )}
          </HStack>
        </HStack>

        {isSearchActive && (
          <Box className="mt-2">
            <SanctuaryInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchProps?.placeholder ?? t('searchPlaceholder')}
              leftIcon={Search}
            />
          </Box>
        )}

        <NotificationDrawer
          isVisible={showNotifications}
          onClose={handleCloseNotifications}
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={notifLoading}
          isRealtimeConnected={isRealtimeConnected}
          error={error}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllRead}
        />
      </VStack>
    </Box>
  );
}
