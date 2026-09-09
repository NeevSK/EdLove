import type { ResolvedWorkspaceSurface } from '@repo/core/types';
import { DEPTH_PRESETS } from '@repo/ui/components/workspace/shared';
import type {
  CanvasDepthPresetId,
  SurfaceCardLayoutMode,
} from '@repo/ui/components/workspace/types';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  GripVertical,
  Info,
  Lock,
  Pin,
  Sparkles,
} from '@repo/ui/icons';
import { Pressable, Text, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import type React from 'react';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

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
  depthPreset?: CanvasDepthPresetId;
  layoutMode?: SurfaceCardLayoutMode;
  energyVibe?: [string, string];
  emoji?: string;
  category?: string;
  metadata?: string[];
  content?: React.ReactNode;
  actions?: React.ReactNode;
  onPress?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onPressInfo?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onToggleHidden?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onTogglePin?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
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
  depthPreset = 'sanctuary-calm',
  layoutMode = 'card',
  energyVibe,
  emoji,
  category,
  metadata,
  content,
  actions,
  onPress,
  onPressInfo,
  onToggleHidden,
  onTogglePin,
  reorderEnabled = false,
  dragEnabled = reorderEnabled,
  reorderHint = 'Hold and drag to reorder',
  reorderControls,
}: CanvasSurfaceCardProps<TSurfaceId, TCapabilityKey>) {
  const colors = useThemedColors();
  const ownerLabel = OWNER_LABELS[surface.ownerPackage] ?? surface.ownerPackage;
  const preset = DEPTH_PRESETS[depthPreset] ?? DEPTH_PRESETS['sanctuary-calm'];
  const cardStyles = createStyles(colors, preset);

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

  const handleTogglePin = useCallback(() => {
    onTogglePin?.(surface);
  }, [onTogglePin, surface]);

  /* =========================================================================
   * 1. TILE MODE (Catalog Grid View: 2-Column Discovery Matrix)
   * ========================================================================= */
  if (layoutMode === 'tile') {
    return (
      <Pressable
        accessibilityRole={onPress || surface.isLocked ? 'button' : undefined}
        onPress={handlePress}
        style={({ pressed }) => [
          cardStyles.tile,
          pressed ? cardStyles.cardPressed : null,
          surface.hidden ? cardStyles.cardHidden : null,
        ]}
      >
        <View
          style={[cardStyles.tileHeader, { backgroundColor: energyVibe?.[0] ?? Theme.colors.silk }]}
        >
          <Text style={cardStyles.tileEmoji}>{emoji ?? '✨'}</Text>
          {onTogglePin ? (
            <Pressable
              onPress={handleTogglePin}
              accessibilityRole="button"
              accessibilityLabel={surface.pinned ? 'Unpin' : 'Pin'}
              style={[cardStyles.tilePinBtn, surface.pinned ? cardStyles.pinBtnActive : null]}
            >
              <Pin
                size={11}
                color={surface.pinned ? Theme.colors.sacredWhite : Theme.colors.inkTruth}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={cardStyles.tileBody}>
          <Text style={cardStyles.tileTitle} numberOfLines={1}>
            {title ?? surface.title}
          </Text>
          <Text style={cardStyles.tileMeta} numberOfLines={1}>
            {category ?? ownerLabel.toUpperCase()} · {surface.zone.toUpperCase()}
          </Text>
        </View>

        <View style={cardStyles.tileActionRow}>
          <Text style={cardStyles.tileActionText}>Launch ↗</Text>
        </View>
      </Pressable>
    );
  }

  /* =========================================================================
   * 2. HERO MODE (Carousel Slide: High-Impact Paging Banner)
   * ========================================================================= */
  if (layoutMode === 'hero') {
    return (
      <View style={[cardStyles.heroCard, surface.hidden ? cardStyles.cardHidden : null]}>
        <View
          style={[
            cardStyles.heroCardHeader,
            { backgroundColor: energyVibe?.[0] ?? Theme.colors.silk },
          ]}
        >
          <View style={cardStyles.heroTopRow}>
            <Text style={cardStyles.heroEmoji}>{emoji ?? '✨'}</Text>
            {onTogglePin ? (
              <Pressable
                onPress={handleTogglePin}
                accessibilityRole="button"
                accessibilityLabel={surface.pinned ? 'Unpin' : 'Pin'}
                style={[cardStyles.heroPinBtn, surface.pinned ? cardStyles.pinBtnActive : null]}
              >
                <Pin
                  size={11}
                  color={surface.pinned ? Theme.colors.sacredWhite : Theme.colors.inkTruth}
                />
                <Text
                  style={[cardStyles.heroPinText, surface.pinned ? cardStyles.pinTextActive : null]}
                >
                  {surface.pinned ? 'PINNED' : 'PIN'}
                </Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={cardStyles.heroLabel} numberOfLines={1}>
            {title ?? surface.title}
          </Text>
          <Text style={cardStyles.heroCategory}>
            {category ?? ownerLabel.toUpperCase()} · {surface.zone.toUpperCase()}
          </Text>
        </View>

        <View style={cardStyles.heroWidgetPreview}>
          {content ? (
            content
          ) : summary || snapshot ? (
            <View style={cardStyles.contentBody}>
              {summary ? <Text style={cardStyles.summaryText}>{summary}</Text> : null}
              {snapshot ? (
                <View style={cardStyles.snapshotRow}>
                  <View style={cardStyles.snapshotDot} />
                  <Text style={cardStyles.snapshotText}>{snapshot}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {onPress ? (
          <Pressable onPress={handlePress} style={cardStyles.heroOpenBtn}>
            <Text style={cardStyles.heroOpenText}>Open Space →</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  /* =========================================================================
   * 3. CARD MODE (Default Workbench Stream: Full In-Depth Card)
   * ========================================================================= */
  const cardContent = (
    <>
      {/* Lean Executive Header */}
      <View style={cardStyles.headerRow}>
        <View style={cardStyles.headerText}>
          <View style={cardStyles.kickerRow}>
            {emoji ? <Text style={cardStyles.streamEmoji}>{emoji}</Text> : null}
            <Text style={cardStyles.kicker}>
              {category ? `${category.toUpperCase()} · ` : ''}
              {surface.zone.toUpperCase()} · {ownerLabel.toUpperCase()}
            </Text>
            {temporalLabel ? (
              <View style={[cardStyles.temporalPill, temporalToneStyles[temporalTone]]}>
                <Text style={cardStyles.temporalText}>{temporalLabel}</Text>
              </View>
            ) : null}
            {surface.pinned ? (
              <View style={cardStyles.pinBadge}>
                <Pin size={11} color={Theme.colors.inkTruth} />
                <Text style={cardStyles.pinText}>PINNED</Text>
              </View>
            ) : null}
          </View>
          <Text style={cardStyles.title} numberOfLines={1}>
            {title ?? surface.title}
          </Text>
          {subtitle || surface.subtitle ? (
            <Text style={cardStyles.subtitle} numberOfLines={1}>
              {subtitle ?? surface.subtitle}
            </Text>
          ) : null}
        </View>

        {/* Action Controls in Header/Corner */}
        <View style={cardStyles.topActions}>
          {reorderControls ? (
            <View style={cardStyles.stepperGroup}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${title ?? surface.title} earlier`}
                accessibilityState={{ disabled: !reorderControls.canMoveUp }}
                disabled={!reorderControls.canMoveUp}
                onPress={reorderControls.onMoveUp}
                style={({ pressed }) => [
                  cardStyles.stepperBtn,
                  !reorderControls.canMoveUp ? cardStyles.controlDisabled : null,
                  pressed ? cardStyles.controlPressed : null,
                ]}
              >
                <ChevronUp size={15} color={colors.textSecondary} />
              </Pressable>
              <View style={cardStyles.stepperDivider} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${title ?? surface.title} later`}
                accessibilityState={{ disabled: !reorderControls.canMoveDown }}
                disabled={!reorderControls.canMoveDown}
                onPress={reorderControls.onMoveDown}
                style={({ pressed }) => [
                  cardStyles.stepperBtn,
                  !reorderControls.canMoveDown ? cardStyles.controlDisabled : null,
                  pressed ? cardStyles.controlPressed : null,
                ]}
              >
                <ChevronDown size={15} color={colors.textSecondary} />
              </Pressable>
            </View>
          ) : null}

          {onTogglePin ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={surface.pinned ? 'Unpin' : 'Pin'}
              onPress={handleTogglePin}
              style={[cardStyles.quietPillBtn, surface.pinned ? cardStyles.pinBtnActive : null]}
            >
              <Pin
                size={11}
                color={surface.pinned ? Theme.colors.sacredWhite : Theme.colors.inkTruth}
              />
              <Text
                style={[cardStyles.quietPillText, surface.pinned ? cardStyles.pinTextActive : null]}
              >
                {surface.pinned ? 'PINNED' : 'PIN'}
              </Text>
            </Pressable>
          ) : null}

          {onToggleHidden && !surface.isLocked ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${surface.hidden ? 'Show' : 'Hide'} ${title ?? surface.title}`}
              onPress={handleToggleHidden}
              style={({ pressed }) => [
                cardStyles.quietIconBtn,
                pressed ? cardStyles.controlPressed : null,
              ]}
            >
              <EyeOff
                size={14}
                color={surface.hidden ? Theme.colors.inkTruth : colors.textSecondary}
              />
            </Pressable>
          ) : null}

          {onPressInfo ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`More information about ${title ?? surface.title}`}
              onPress={handlePressInfo}
              style={({ pressed }) => [
                cardStyles.quietIconBtn,
                pressed ? cardStyles.controlPressed : null,
              ]}
            >
              <Info size={14} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Primary Content Body */}
      {surface.isLocked ? (
        <View style={cardStyles.lockedState}>
          <Lock size={20} color={Theme.colors.saffronMuted} />
          <View style={cardStyles.lockedCopy}>
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
        </View>
      ) : content ? (
        <View style={cardStyles.contentBody}>{content}</View>
      ) : summary || snapshot ? (
        <View style={cardStyles.contentBody}>
          {summary ? <Text style={cardStyles.summaryText}>{summary}</Text> : null}
          {snapshot ? (
            <View style={cardStyles.snapshotRow}>
              <View style={cardStyles.snapshotDot} />
              <Text style={cardStyles.snapshotText}>{snapshot}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Metadata & Actions Bar */}
      {metadata?.length || actions || (reorderEnabled && dragEnabled) ? (
        <View style={cardStyles.bottomBar}>
          <View style={cardStyles.metaRow}>
            {metadata?.map((item) => (
              <View key={item} style={cardStyles.metaChip}>
                <Text style={cardStyles.metaChipText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={cardStyles.actionsRow}>
            {actions}
            {reorderEnabled && dragEnabled ? (
              <View
                accessibilityRole="image"
                accessibilityLabel={reorderHint}
                style={cardStyles.dragHandle}
              >
                <GripVertical size={14} color={colors.textSecondary} />
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </>
  );

  if (onPress || surface.isLocked) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [
          cardStyles.card,
          pressed ? cardStyles.cardPressed : null,
          surface.hidden ? cardStyles.cardHidden : null,
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return (
    <View style={[cardStyles.card, surface.hidden ? cardStyles.cardHidden : null]}>
      {cardContent}
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useThemedColors>,
  preset: (typeof DEPTH_PRESETS)[keyof typeof DEPTH_PRESETS],
) {
  const isWeb = typeof window !== 'undefined';
  const rimBoxShadow =
    preset.rimOffset > 0 ? `0px ${preset.rimOffset}px 0px ${preset.rimColor}` : 'none';

  return StyleSheet.create({
    card: {
      borderRadius: preset.borderRadius,
      borderWidth: preset.borderWidth,
      borderColor: preset.borderColor,
      backgroundColor: colors.card,
      padding: Theme.spacing.md,
      gap: Theme.spacing.sm,
      ...(isWeb
        ? ({ boxShadow: rimBoxShadow } as any)
        : {
            elevation: preset.rimOffset > 0 ? 1 : 0,
            borderBottomWidth: preset.borderWidth + (preset.rimOffset > 0 ? 1 : 0),
          }),
    },
    cardPressed: {
      opacity: 0.96,
      transform: isWeb ? ([{ translateY: 1 }] as any) : undefined,
    },
    cardHidden: {
      opacity: 0.65,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Theme.spacing.sm,
    },
    headerText: {
      flex: 1,
      gap: 2,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    streamEmoji: {
      fontSize: 14,
    },
    kicker: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: Theme.colors.saffronMuted,
    },
    temporalPill: {
      borderRadius: Theme.corners.full,
      paddingHorizontal: 6,
      paddingVertical: 1,
    },
    temporalText: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.4,
      color: Theme.colors.inkTruth,
      textTransform: 'uppercase',
    },
    pinBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderRadius: Theme.corners.full,
      paddingHorizontal: 6,
      paddingVertical: 1,
      backgroundColor: Theme.colors.templeGold,
    },
    pinText: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: Theme.colors.inkTruth,
    },
    title: {
      fontSize: Theme.typography.fontSize.md,
      fontWeight: '700',
      lineHeight: 22,
      color: colors.text,
    },
    subtitle: {
      fontSize: Theme.typography.fontSize.xs,
      lineHeight: 16,
      color: colors.textSecondary,
    },
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    stepperGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: Theme.corners.full,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      backgroundColor: Theme.colors.silk,
      overflow: 'hidden',
    },
    stepperBtn: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperDivider: {
      width: 1,
      height: 12,
      backgroundColor: Theme.colors.border,
    },
    quietPillBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderRadius: Theme.corners.full,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      backgroundColor: Theme.colors.silk,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    quietPillText: {
      fontSize: 9,
      fontWeight: '800',
      color: Theme.colors.inkTruth,
    },
    quietIconBtn: {
      width: 26,
      height: 26,
      borderRadius: Theme.corners.full,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      backgroundColor: Theme.colors.silk,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinBtnActive: {
      backgroundColor: Theme.colors.inkTruth,
      borderColor: Theme.colors.inkTruth,
    },
    pinTextActive: {
      color: Theme.colors.sacredWhite,
    },
    controlPressed: {
      opacity: 0.65,
    },
    controlDisabled: {
      opacity: 0.3,
    },
    contentBody: {
      gap: 6,
      paddingVertical: 2,
    },
    summaryText: {
      fontSize: Theme.typography.fontSize.sm,
      lineHeight: 20,
      color: colors.text,
    },
    snapshotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 2,
    },
    snapshotDot: {
      width: 6,
      height: 6,
      borderRadius: 99,
      backgroundColor: Theme.colors.sanctuarySaffron,
    },
    snapshotText: {
      fontSize: Theme.typography.fontSize.xs,
      lineHeight: 16,
      color: colors.textSecondary,
      fontWeight: '500',
      flex: 1,
    },
    lockedState: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Theme.spacing.md,
      padding: Theme.spacing.md,
      borderRadius: Theme.corners.comfortable,
      backgroundColor: Theme.colors.silk,
      borderWidth: 1.25,
      borderColor: Theme.colors.border,
    },
    lockedCopy: {
      flex: 1,
      gap: 2,
    },
    lockedTitle: {
      fontSize: Theme.typography.fontSize.sm,
      fontWeight: '700',
      color: Theme.colors.inkTruth,
    },
    lockedBody: {
      fontSize: Theme.typography.fontSize.xs,
      lineHeight: 16,
      color: colors.textSecondary,
    },
    bottomBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Theme.spacing.sm,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: Theme.colors.border,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      flex: 1,
    },
    metaChip: {
      borderRadius: Theme.corners.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: Theme.colors.silk,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    metaChipText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dragHandle: {
      padding: 4,
      borderRadius: Theme.corners.full,
      backgroundColor: Theme.colors.silk,
    },

    /* Tile Layout Mode */
    tile: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '47%',
      minWidth: 140,
      borderRadius: 14,
      borderWidth: preset.borderWidth,
      borderColor: preset.borderColor,
      backgroundColor: colors.card,
      padding: Theme.spacing.sm,
      gap: Theme.spacing.xs,
      ...(isWeb
        ? ({ boxShadow: rimBoxShadow } as any)
        : {
            elevation: preset.rimOffset > 0 ? 1 : 0,
            borderBottomWidth: preset.borderWidth + (preset.rimOffset > 0 ? 1 : 0),
          }),
    },
    tileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 6,
      borderRadius: 8,
    },
    tileEmoji: {
      fontSize: 20,
    },
    tilePinBtn: {
      width: 22,
      height: 22,
      borderRadius: Theme.corners.full,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      backgroundColor: Theme.colors.silk,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileBody: {
      gap: 1,
      paddingHorizontal: 2,
    },
    tileTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: Theme.colors.inkTruth,
    },
    tileMeta: {
      fontSize: 9,
      fontWeight: '700',
      color: Theme.colors.willow,
    },
    tileActionRow: {
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    tileActionText: {
      fontSize: 10,
      fontWeight: '700',
      color: Theme.colors.saffronMuted,
    },

    /* Hero Layout Mode */
    heroCard: {
      width: 280,
      borderRadius: 14,
      borderWidth: preset.borderWidth,
      borderColor: preset.borderColor,
      backgroundColor: colors.card,
      overflow: 'hidden',
      ...(isWeb
        ? ({ boxShadow: rimBoxShadow } as any)
        : {
            elevation: preset.rimOffset > 0 ? 1 : 0,
            borderBottomWidth: preset.borderWidth + (preset.rimOffset > 0 ? 1 : 0),
          }),
    },
    heroCardHeader: {
      padding: Theme.spacing.md,
      gap: 4,
      borderBottomWidth: 1,
      borderBottomColor: Theme.colors.border,
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    heroEmoji: {
      fontSize: 24,
    },
    heroPinBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: Theme.corners.full,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      backgroundColor: Theme.colors.silk,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    heroPinText: {
      fontSize: 9,
      fontWeight: '800',
      color: Theme.colors.inkTruth,
    },
    heroLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: Theme.colors.inkTruth,
    },
    heroCategory: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: Theme.colors.saffronMuted,
    },
    heroWidgetPreview: {
      padding: Theme.spacing.md,
    },
    heroOpenBtn: {
      paddingVertical: 8,
      paddingHorizontal: Theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: Theme.colors.border,
      backgroundColor: Theme.colors.silk,
    },
    heroOpenText: {
      fontSize: 11,
      fontWeight: '700',
      color: Theme.colors.sanctuarySaffron,
    },
  });
}

const temporalToneStyles = StyleSheet.create({
  present: { backgroundColor: Theme.colors.templeGold },
  past: { backgroundColor: 'rgba(114, 105, 94, 0.16)' },
  future: { backgroundColor: 'rgba(125, 212, 192, 0.22)' },
  neutral: { backgroundColor: Theme.colors.silk },
});

export { CanvasSurfaceCard as WorkspaceSurfaceCard };
export default CanvasSurfaceCard;
