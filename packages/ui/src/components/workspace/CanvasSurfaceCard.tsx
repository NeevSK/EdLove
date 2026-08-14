import type { ResolvedWorkspaceSurface } from '@repo/core/types';
import { ChevronDown, ChevronUp, EyeOff, GripVertical, Info, Lock, Pin, Sparkles } from '@repo/ui/icons';
import type React from 'react';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '@repo/ui/gluestack';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { Pressable, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';

export interface CanvasSurfaceCardProps<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> {
  surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>;
  title?: string;
  subtitle?: string;
  summary?: string;
  snapshot?: string;
  temporalLabel?: string;
  temporalTone?: 'present' | 'past' | 'future' | 'neutral';
  metadata?: string[];
  content?: React.ReactNode;
  actions?: React.ReactNode;
  onPress?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onPressInfo?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onToggleHidden?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  reorderEnabled?: boolean;
  dragEnabled?: boolean;
  reorderHint?: string;
  reorderControls?: {
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
  };
}

const OWNER_LABELS: Record<string, string> = {
  classroom: 'Classroom',
  admin: 'Admin',
  people: 'People',
  workforce: 'Workforce',
  core: 'Core',
  guardian: 'Guardian',
};

export function CanvasSurfaceCard<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>({
  surface,
  title,
  subtitle,
  summary,
  snapshot,
  temporalLabel,
  temporalTone = 'present',
  metadata,
  content,
  actions,
  onPress,
  onPressInfo,
  onToggleHidden,
  reorderEnabled = false,
  dragEnabled = reorderEnabled,
  reorderHint = 'Hold and drag to reorder',
  reorderControls,
}: CanvasSurfaceCardProps<TSurfaceId, TCapabilityKey>) {
  const colors = useThemedColors();
  const ownerLabel = OWNER_LABELS[surface.ownerPackage] ?? surface.ownerPackage;
  const cardStyles = createStyles(colors);

  const handlePress = useCallback(() => {
    if (surface.isLocked) {
      onPressInfo?.(surface);
      return;
    }
    onPress?.(surface);
  }, [onPress, onPressInfo, surface]);

  const handlePressInfo = useCallback(() => {
    onPressInfo?.(surface);
  }, [onPressInfo, surface]);

  const handleToggleHidden = useCallback(() => {
    onToggleHidden?.(surface);
  }, [onToggleHidden, surface]);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress && !surface.isLocked}
      onPress={handlePress}
      style={({ pressed }) => [
        cardStyles.card,
        pressed && (onPress || surface.isLocked) ? cardStyles.cardPressed : null,
        surface.hidden ? cardStyles.cardHidden : null,
      ]}
    >
      <View style={cardStyles.cardGlow} />
      <View style={cardStyles.headerRow}>
        <View style={cardStyles.headerText}>
          <Text style={cardStyles.kicker}>
            {surface.zone.toUpperCase()} {String.fromCharCode(8226)} {ownerLabel.toUpperCase()}
          </Text>
          <Text style={cardStyles.title}>{title ?? surface.title}</Text>
          <Text style={cardStyles.subtitle}>{subtitle ?? surface.subtitle}</Text>
        </View>
          <View style={cardStyles.badges}>
          {temporalLabel ? (
            <View
              style={[cardStyles.badge, cardStyles.temporalBadge, temporalToneStyles[temporalTone]]}
            >
              <Text style={cardStyles.temporalText}>{temporalLabel}</Text>
            </View>
          ) : null}
          {surface.pinned ? (
            <View style={[cardStyles.badge, cardStyles.pinBadge]}>
              <Pin size={12} color={Theme.colors.inkTruth} />
              <Text style={cardStyles.badgeTextDark}>Pinned</Text>
            </View>
          ) : null}
        </View>
      </View>
      {summary ? <Text style={cardStyles.summary}>{summary}</Text> : null}
      {snapshot ? (
        <View style={cardStyles.snapshotPanel}>
          <Text style={cardStyles.snapshotLabel}>Present snapshot</Text>
          <Text style={cardStyles.snapshotText}>{snapshot}</Text>
        </View>
      ) : null}

      {metadata?.length ? (
        <View style={cardStyles.metaRow}>
          {metadata.map((item) => (
            <View key={item} style={cardStyles.metaPill}>
              <Text style={cardStyles.metaText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={cardStyles.contentShell}>
        {surface.isLocked ? (
          <View style={cardStyles.lockedOverlay}>
            <Lock size={24} color={Theme.colors.saffronMuted} />
            <Text style={cardStyles.lockedTitle}>
              {surface.lockReason === 'citizenship'
                ? 'Elevation Required'
                : surface.lockReason === 'pro'
                  ? 'Pro-tier Capability'
                  : 'Capability Pending'}
            </Text>
            <Text style={cardStyles.lockedBody}>
              {surface.lockReason === 'citizenship'
                ? 'Establish your Sanctuary or join an institution to unlock this workspace.'
                : surface.lockReason === 'pro'
                  ? 'This institutional governance tool is available for Pro and Institutional citizens.'
                  : 'This capability is currently gated by your active bond status.'}
            </Text>
          </View>
        ) : (
          (content ?? (
            <View style={cardStyles.placeholderPanel}>
              <Sparkles size={18} color={Theme.colors.sanctuarySaffron} />
              <Text style={cardStyles.placeholderTitle}>Renderer-ready surface</Text>
              <Text style={cardStyles.placeholderBody}>
                This shared card can host the package-owned workspace content when a live screen
                adopts the canvas renderer.
              </Text>
            </View>
          ))
        )}
      </View>
      {actions && !surface.isLocked ? <View style={cardStyles.actionsRow}>{actions}</View> : null}

      <View style={cardStyles.footer}>
        <View style={cardStyles.footerSpacer} />
        <View style={cardStyles.footerActions}>
          {reorderEnabled && dragEnabled ? (
            <View
              accessibilityRole="image"
              accessibilityLabel={reorderHint}
              style={cardStyles.reorderAffordance}
            >
              <GripVertical size={16} color={colors.textSecondary} />
              <Text style={cardStyles.reorderText}>Reorder</Text>
            </View>
          ) : null}
          {reorderControls ? (
            <View accessibilityLabel="Keyboard and pointer reorder controls" style={cardStyles.reorderControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${title ?? surface.title} earlier`}
                accessibilityHint="Moves this surface one position earlier in its zone."
                accessibilityState={{ disabled: !reorderControls.canMoveUp }}
                disabled={!reorderControls.canMoveUp}
                onPress={reorderControls.onMoveUp}
                style={({ pressed }) => [
                  cardStyles.iconButton,
                  !reorderControls.canMoveUp ? cardStyles.controlDisabled : null,
                  pressed ? cardStyles.toggleButtonPressed : null,
                ]}
              >
                <ChevronUp size={14} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${title ?? surface.title} later`}
                accessibilityHint="Moves this surface one position later in its zone."
                accessibilityState={{ disabled: !reorderControls.canMoveDown }}
                disabled={!reorderControls.canMoveDown}
                onPress={reorderControls.onMoveDown}
                style={({ pressed }) => [
                  cardStyles.iconButton,
                  !reorderControls.canMoveDown ? cardStyles.controlDisabled : null,
                  pressed ? cardStyles.toggleButtonPressed : null,
                ]}
              >
                <ChevronDown size={14} color={colors.textSecondary} />
              </Pressable>
            </View>
          ) : null}
          {onPressInfo ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`More information about ${title ?? surface.title}`}
              onPress={handlePressInfo}
              style={({ pressed }) => [
                cardStyles.iconButton,
                pressed ? cardStyles.toggleButtonPressed : null,
              ]}
            >
              <Info size={14} color={colors.textSecondary} />
            </Pressable>
          ) : null}
          {onToggleHidden && !surface.isLocked ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${surface.hidden ? 'Show' : 'Hide'} ${title ?? surface.title}`}
              onPress={handleToggleHidden}
              style={({ pressed }) => [
                cardStyles.toggleButton,
                pressed ? cardStyles.toggleButtonPressed : null,
              ]}
            >
              <EyeOff
                size={14}
                color={surface.hidden ? Theme.colors.inkTruth : colors.textSecondary}
              />
              <Text style={surface.hidden ? cardStyles.toggleTextActive : cardStyles.toggleText}>
                {surface.hidden ? 'Show' : 'Hide'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ReturnType<typeof useThemedColors>) {
  return StyleSheet.create({
    card: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: Theme.corners.generous,
      borderWidth: 1,
      borderColor: Theme.colors.saffronWhisper,
      backgroundColor: colors.card,
      padding: Theme.spacing.lg,
      gap: Theme.spacing.md,
      ...Theme.shadows.md,
    },
    cardPressed: {
      transform: [{ translateY: 1 }],
    },
    cardHidden: {
      opacity: 0.75,
    },
    cardGlow: {
      position: 'absolute',
      top: -40,
      right: -20,
      width: 140,
      height: 140,
      borderRadius: 999,
      backgroundColor: 'rgba(246, 191, 140, 0.12)',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Theme.spacing.md,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    kicker: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '700',
      letterSpacing: 1.1,
      color: Theme.colors.saffronMuted,
    },
    title: {
      fontSize: Theme.typography.fontSize.xl,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'capitalize',
    },
    subtitle: {
      fontSize: Theme.typography.fontSize.sm,
      color: colors.textSecondary,
    },
    badges: {
      alignItems: 'flex-end',
      gap: Theme.spacing.xs,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: Theme.corners.full,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: 'rgba(42, 35, 24, 0.05)',
    },
    pinBadge: {
      backgroundColor: Theme.colors.templeGold,
    },
    temporalBadge: {
      borderWidth: 0,
    },
    temporalText: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '700',
      color: Theme.colors.inkTruth,
    },
    badgeText: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    badgeTextDark: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '700',
      color: Theme.colors.inkTruth,
    },
    summary: {
      fontSize: Theme.typography.fontSize.md,
      lineHeight: 22,
      color: colors.text,
    },
    snapshotPanel: {
      borderRadius: Theme.corners.comfortable,
      padding: Theme.spacing.md,
      backgroundColor: 'rgba(246, 191, 140, 0.10)',
      borderWidth: 1,
      borderColor: 'rgba(246, 191, 140, 0.18)',
      gap: 4,
    },
    snapshotLabel: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '700',
      letterSpacing: 1,
      color: Theme.colors.saffronMuted,
      textTransform: 'uppercase',
    },
    snapshotText: {
      fontSize: Theme.typography.fontSize.md,
      lineHeight: 22,
      color: colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Theme.spacing.xs,
    },
    metaPill: {
      borderRadius: Theme.corners.full,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: 'rgba(42, 35, 24, 0.05)',
    },
    metaText: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    contentShell: {
      borderRadius: Theme.corners.comfortable,
      borderWidth: 1,
      borderColor: Theme.colors.saffronWhisper,
      backgroundColor: 'rgba(250, 247, 237, 0.8)',
      padding: Theme.spacing.md,
      position: 'relative',
    },
    lockedOverlay: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: Theme.spacing.lg,
      gap: Theme.spacing.sm,
    },
    lockedTitle: {
      fontSize: Theme.typography.fontSize.md,
      fontWeight: '700',
      color: Theme.colors.inkTruth,
    },
    lockedBody: {
      fontSize: Theme.typography.fontSize.xs,
      lineHeight: 18,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Theme.spacing.sm,
    },
    placeholderPanel: {
      gap: Theme.spacing.xs,
    },
    placeholderTitle: {
      fontSize: Theme.typography.fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    placeholderBody: {
      fontSize: Theme.typography.fontSize.sm,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Theme.spacing.md,
    },
    footerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Theme.spacing.xs,
    },
    reorderAffordance: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: Theme.corners.full,
      paddingHorizontal: 8,
      paddingVertical: 7,
      backgroundColor: Theme.colors.silk,
    },
    reorderText: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    reorderControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Theme.spacing.xs,
    },
    controlDisabled: {
      opacity: 0.45,
    },
    footerSpacer: {
      flex: 1,
    },
    iconButton: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Theme.corners.full,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      backgroundColor: Theme.colors.silk,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: Theme.corners.full,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: Theme.colors.silk,
    },
    toggleButtonPressed: {
      opacity: 0.85,
    },
    toggleText: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    toggleTextActive: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '700',
      color: Theme.colors.inkTruth,
    },
  });
}

const temporalToneStyles = StyleSheet.create({
  present: { backgroundColor: Theme.colors.templeGold },
  past: { backgroundColor: 'rgba(114, 105, 94, 0.16)' },
  future: { backgroundColor: 'rgba(125, 212, 192, 0.22)' },
  neutral: { backgroundColor: 'rgba(42, 35, 24, 0.05)' },
});

export { CanvasSurfaceCard as WorkspaceSurfaceCard };
export default CanvasSurfaceCard;
