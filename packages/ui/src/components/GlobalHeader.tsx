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
  School,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { Box, VStack, HStack, Text } from '../gluestack';
import { hapticLight } from '../utils/haptics';
import { TemporalGlass } from '../components-native/TemporalGlass';
import { UserAvatar } from './UserAvatar';
import SanctuaryInput from './SanctuaryInput';
import NotificationDrawer from './NotificationDrawer';

import { useStore, usePermissions } from '@repo/core/logic';
import { useNotifications } from '@repo/core/logic';

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

/**
 * GlobalHeader - Core navigation and brand identity component.
 * Hardened v3 implementation.
 */
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

  const user = useStore((state: any) => state.user);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [showNotifications, setShowNotifications] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading: notifLoading,
    markAsRead,
    markAllRead,
  } = useNotifications(user?.id);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  const searchQuery = searchProps?.value ?? internalSearchQuery;
  const setSearchQuery = searchProps?.onChangeText ?? setInternalSearchQuery;

  const displayName = userName || user?.user_metadata?.full_name?.split(' ')[0] || '';
  const userFullName = userName || user?.user_metadata?.full_name || '';

  const getRoleContext = () => {
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
  };

  const { icon: RoleIcon, emoji: RoleEmoji, label: RoleLabel } = getRoleContext();

  const getGreetingDetails = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t('goodMorning'), emoji: '\uD83C\uDF05' };
    if (hour < 18) return { text: t('goodAfternoon'), emoji: '\u2600\uFE0F' };
    return { text: t('goodEvening'), emoji: '\uD83C\uDFEE' };
  };

  const { text: greetingText, emoji: GreetingEmoji } = getGreetingDetails();

  const headerHeight = insets.top + (isSearchActive ? 120 : 80);
  const showFullNameAsPrimary = can('manage', 'StudentDashboard');

  return (
    <Box className="w-full relative" style={{ height: headerHeight }}>
      {/* SOLID BACKDROP (REPLACED GLASS) */}
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
          {/* LEFT: Greeting or Title */}
          <HStack className="items-center gap-2">
            {showBack ? (
              <Pressable accessibilityRole="button" onPress={onBack || (() => navigation.goBack())}>
                <Box className="p-2 rounded-xl bg-phase-surface">
                  <ChevronLeft size={24} className="text-phase-text-primary" />
                </Box>
              </Pressable>
            ) : (
              showMenu && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.openDrawer && navigation.openDrawer()}
                >
                  <Menu className="text-phase-text-primary" size={24} />
                </Pressable>
              )
            )}

            {isSelfView && (
              <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Profile')}>
                <Box className="mr-2">
                  <UserAvatar
                    avatarUrl={avatarUrl || user?.user_metadata?.avatar_url}
                    fullName={userFullName}
                    fallbackEmoji={RoleEmoji}
                    size={32}
                    borderRadius={12}
                  />
                </Box>
              </Pressable>
            )}

            <VStack className="gap-0.5">
              {(subtitle || (!title && greetingText)) && (
                <HStack className="items-center gap-1">
                  <Text className="text-[10px] font-bold tracking-widest uppercase text-phase-text-secondary">
                    {title ? subtitle : greetingText}
                  </Text>
                  {!title && <Text className="text-sm -mt-0.5">{GreetingEmoji}</Text>}
                </HStack>
              )}
              <Text className="text-lg font-bold text-phase-text-primary">
                {title
                  ? title
                  : isSelfView
                    ? showFullNameAsPrimary
                      ? userFullName
                      : RoleLabel
                    : displayName}
              </Text>
            </VStack>
          </HStack>

          {/* RIGHT: Actions */}
          <HStack className="items-center gap-4">
            {showSearch && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  hapticLight();
                  setIsSearchActive(!isSearchActive);
                }}
              >
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
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  hapticLight();
                  setShowNotifications(true);
                }}
              >
                <Box className="relative">
                  <Bell size={24} className="text-phase-text-primary" />
                  {/* Notification Dot */}
                  {unreadCount > 0 && (
                    <Box className="absolute top-0 right-0.5 w-2.5 h-2.5 rounded-full border-2 bg-phase-accent border-phase-canvas" />
                  )}
                </Box>
              </TouchableOpacity>
            )}
          </HStack>
        </HStack>

        {/* EXPANDABLE SEARCH BAR */}
        {isSearchActive && (
          <Box className="mt-2">
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
