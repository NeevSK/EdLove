import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { EyeOff, Info, MoveDiagonal2, Pin, Sparkles } from 'lucide-react-native';
import type { ResolvedWorkspaceSurface } from '@repo/core/workspace/canvas';
import { Theme } from '../../theme/Theme';
import { useThemedColors } from '../../hooks/useThemedColors';
import { Text } from '../../gluestack';

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
}: CanvasSurfaceCardProps<TSurfaceId, TCapabilityKey>) {
    const colors = useThemedColors();
    const ownerLabel = OWNER_LABELS[surface.ownerPackage] ?? surface.ownerPackage;
    const cardStyles = createStyles(colors);

    return (
        <Pressable
            accessibilityRole={onPress ? 'button' : undefined}
            disabled={!onPress}
            onPress={onPress ? () => onPress(surface) : undefined}
            style={({ pressed }) => [
                cardStyles.card,
                pressed && onPress ? cardStyles.cardPressed : null,
                surface.hidden ? cardStyles.cardHidden : null,
            ]}
        >
            <View style={cardStyles.cardGlow} />
            <View style={cardStyles.headerRow}>
                <View style={cardStyles.headerText}>
                    <Text style={cardStyles.kicker}>
                        {surface.zone.toUpperCase()}  {String.fromCharCode(8226)}  {ownerLabel.toUpperCase()}
                    </Text>
                    <Text style={cardStyles.title}>{title ?? surface.title}</Text>
                    <Text style={cardStyles.subtitle}>
                        {subtitle ?? surface.subtitle}
                    </Text>
                </View>
                <View style={cardStyles.badges}>
                    {temporalLabel ? (
                        <View style={[cardStyles.badge, cardStyles.temporalBadge, temporalToneStyles[temporalTone]]}>
                            <Text style={cardStyles.temporalText}>{temporalLabel}</Text>
                        </View>
                    ) : null}
                    {surface.pinned ? (
                        <View style={[cardStyles.badge, cardStyles.pinBadge]}>
                            <Pin size={12} color={Theme.colors.inkTruth} />
                            <Text style={cardStyles.badgeTextDark}>Pinned</Text>
                        </View>
                    ) : null}
                    <View style={cardStyles.badge}>
                        <MoveDiagonal2 size={12} color={colors.textSecondary} />
                        <Text style={cardStyles.badgeText}>Order {surface.order + 1}</Text>
                    </View>
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
                {content ?? (
                    <View style={cardStyles.placeholderPanel}>
                        <Sparkles size={18} color={Theme.colors.sanctuarySaffron} />
                        <Text style={cardStyles.placeholderTitle}>Renderer-ready surface</Text>
                        <Text style={cardStyles.placeholderBody}>
                            This shared card can host the package-owned workspace content when a live screen adopts the canvas renderer.
                        </Text>
                    </View>
                )}
            </View>
            {actions ? <View style={cardStyles.actionsRow}>{actions}</View> : null}

            <View style={cardStyles.footer}>
                <Text style={cardStyles.footerText}>
                    Default zone: {surface.defaultZone}  {String.fromCharCode(8226)}  Default order: {surface.defaultOrder}
                </Text>
                <View style={cardStyles.footerActions}>
                    {onPressInfo ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => onPressInfo?.(surface)}
                            style={({ pressed }) => [cardStyles.iconButton, pressed ? cardStyles.toggleButtonPressed : null]}
                        >
                            <Info size={14} color={colors.textSecondary} />
                        </Pressable>
                    ) : null}
                    {onToggleHidden ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => onToggleHidden?.(surface)}
                            style={({ pressed }) => [cardStyles.toggleButton, pressed ? cardStyles.toggleButtonPressed : null]}
                        >
                            <EyeOff size={14} color={surface.hidden ? Theme.colors.inkTruth : colors.textSecondary} />
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
        footerText: {
            flex: 1,
            fontSize: Theme.typography.fontSize.xs,
            color: colors.textSecondary,
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
