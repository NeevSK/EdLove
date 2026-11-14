import { AppHeader, type AppHeaderProps } from '@repo/ui/components/native';
import { ArrowLeft, Bell, LayoutGrid, Settings } from '@repo/ui/icons';
import type React from 'react';

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
 * The compact header: one tight line that keeps vertical room for content on
 * phones, the domain's name with its context under it and the perspective
 * beside it, quick actions on the right. Drawn by the kit's AppHeader.
 */
export const DomainSubHeader: React.FC<DomainSubHeaderProps> = ({
  title,
  subtitle,
  perspectivePill,
  unreadCount = 0,
  onBackPress,
  onNotificationsPress,
  onSettingsPress,
  onCatalogPress,
}) => {
  const actions: NonNullable<AppHeaderProps['actions']>[number][] = [];
  if (onCatalogPress) {
    actions.push({ key: 'catalog', label: 'Open domain feature catalog', icon: LayoutGrid, onPress: onCatalogPress });
  }
  if (onNotificationsPress) {
    actions.push({
      key: 'notifications',
      label: 'Open notifications',
      icon: Bell,
      onPress: onNotificationsPress,
      ...(unreadCount > 0
        ? { badge: unreadCount, badgeTone: 'lamp' as const, badgeLabel: `${unreadCount} unread` }
        : {}),
    });
  }
  if (onSettingsPress) {
    actions.push({ key: 'settings', label: 'Open settings', icon: Settings, onPress: onSettingsPress });
  }
  return (
    <AppHeader
      compact
      ruled
      title={title}
      subtitle={subtitle}
      leading={onBackPress ? { kind: 'back', label: 'Go back to overview', onPress: onBackPress } : undefined}
      icons={{ back: ArrowLeft }}
      perspective={
        perspectivePill
          ? {
              label: perspectivePill.label,
              onPress: perspectivePill.onPress,
              switchLabel: 'Switch perspective',
              beside: true,
            }
          : undefined
      }
      actions={actions}
    />
  );
};
