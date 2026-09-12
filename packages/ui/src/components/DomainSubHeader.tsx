import { ArrowLeft, Bell, ChevronDown, LayoutGrid, Settings } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight } from '@repo/ui/utils/haptics';
import React from 'react';

export interface DomainSubHeaderProps {
  title: string;
  subtitle?: string;
  domain: 'workspace' | 'self' | 'library' | 'community' | 'profile';
  perspectivePill?: {
    label: string;
    onPress: () => void;
  };
  unreadCount?: number;
  onBackPress?: () => void;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  onCatalogPress?: () => void;
}

/**
 * DomainSubHeader: A compact, elegant mobile header tailored per domain.
 *
 * Provides a high-density, calm header experience that prioritizes vertical content
 * real-estate on mobile phones, directly anchoring perspective switching and catalog access.
 */
export const DomainSubHeader: React.FC<DomainSubHeaderProps> = ({
  title,
  subtitle,
  domain,
  perspectivePill,
  unreadCount = 0,
  onBackPress,
  onNotificationsPress,
  onSettingsPress,
  onCatalogPress,
}) => {
  return (
    <Box
      style={{
        backgroundColor: tokens.semantic.surface.canvas,
        borderBottomWidth: 1,
        borderBottomColor: tokens.semantic.border.subtle,
        paddingHorizontal: tokens.spacing.md,
        paddingVertical: 8,
      }}
    >
      <HStack style={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Left: Back button + Domain & Perspective */}
        <HStack style={{ alignItems: 'center', gap: tokens.spacing.sm, flex: 1 }}>
          {onBackPress && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back to overview"
              accessibilityHint="Returns to the domain overview screen"
              onPress={() => {
                hapticLight();
                onBackPress();
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: tokens.radii.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.semantic.surface.interactive,
              }}
            >
              <ArrowLeft size={18} color={tokens.semantic.text.primary} />
            </Pressable>
          )}

          <Box>
            <Text
              style={{
                fontSize: tokens.typography.sizes.sm,
                fontWeight: '800',
                color: tokens.semantic.text.primary,
                letterSpacing: -0.2,
              }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.secondary,
                  fontWeight: '500',
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </Box>

          {perspectivePill ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Switch perspective, currently ${perspectivePill.label}`}
              accessibilityHint="Opens sanctuary perspective switcher"
              onPress={() => {
                hapticLight();
                perspectivePill.onPress();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: tokens.semantic.surface.interactive,
                borderRadius: tokens.radii.full,
                paddingVertical: 3,
                paddingHorizontal: tokens.spacing.sm,
                gap: 4,
                borderWidth: 1,
                borderColor: tokens.semantic.border.subtle,
              }}
            >
              <Box
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: tokens.colors.primary,
                }}
              />
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: '700',
                  color: tokens.semantic.text.primary,
                  maxWidth: 130,
                }}
                numberOfLines={1}
              >
                {perspectivePill.label}
              </Text>
              <ChevronDown size={11} color={tokens.semantic.text.secondary} />
            </Pressable>
          ) : null}
        </HStack>

        {/* Right: Quick actions */}
        <HStack style={{ alignItems: 'center', gap: 6 }}>
          {onCatalogPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open domain feature catalog"
              accessibilityHint="Browse all rooms and tools in this domain"
              onPress={() => {
                hapticLight();
                onCatalogPress();
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: tokens.radii.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.semantic.surface.interactive,
              }}
            >
              <LayoutGrid size={16} color={tokens.semantic.text.primary} />
            </Pressable>
          ) : null}

          {onNotificationsPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              onPress={() => {
                hapticLight();
                onNotificationsPress();
              }}
              style={{
                position: 'relative',
                width: 32,
                height: 32,
                borderRadius: tokens.radii.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.semantic.surface.interactive,
              }}
            >
              <Bell size={16} color={tokens.semantic.text.primary} />
              {unreadCount > 0 ? (
                <Box
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: tokens.colors.primary,
                    paddingHorizontal: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: tokens.semantic.text.inverse,
                      fontSize: 9,
                      fontWeight: '800',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </Box>
              ) : null}
            </Pressable>
          ) : null}

          {onSettingsPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={() => {
                hapticLight();
                onSettingsPress();
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: tokens.radii.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.semantic.surface.interactive,
              }}
            >
              <Settings size={16} color={tokens.semantic.text.primary} />
            </Pressable>
          ) : null}
        </HStack>
      </HStack>
    </Box>
  );
};
