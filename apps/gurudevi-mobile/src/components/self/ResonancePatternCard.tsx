/**
 * ResonancePatternCard
 *
 * Shows the user their own behavioral fingerprint — a shape that
 * emerges from how they actually use the app, not from a quiz answer.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PHILOSOPHY:
 *   The card never shows a type label ("You are INTJ" or "Type 5").
 *   It shows a PATTERN — four axes, each labelled with two poles.
 *   The shape is the user's; the interpretation is left to them.
 *
 *   "Your pattern is not who you are. It is where you are now."
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Data sources (priority order):
 *  1. `orientation_seeds` from user profile (if onboarding step was done)
 *  2. Behavioral inference from mood timing, energy logs, app usage
 *  3. Neutral defaults (all 50) if no data yet → card shows "still forming"
 *
 * The SVG radar chart is rendered as a simple React Native custom shape
 * using absolute-positioned Views (no SVG library needed).
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
    VStack,
    HStack,
    Text,
    Box,
    Theme,
    useThemedColors,
} from '@repo/ui';
import { Sparkles } from 'lucide-react-native';
import type { OrientationSeeds } from '@repo/profile';

// ============================================================================
// TYPES
// ============================================================================

export interface ResonancePatternCardProps {
    orientationSeeds?: OrientationSeeds | null;
    /** Average mood score 1-5 from recent logs — used for behavioral inference */
    avgMood?: number;
    /** Average energy level 1-5 from recent logs */
    avgEnergy?: number;
    /** Number of solo features used vs social features */
    soloUsageRatio?: number;
    onExplore?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_SIZE = 140;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 54;

const AXES = [
    { key: 'depth_breadth',  lo: 'Deep',    hi: 'Wide',    angle: -90  },
    { key: 'reflect_act',    lo: 'Reflect', hi: 'Act',     angle: 0    },
    { key: 'solo_social',    lo: 'Solo',    hi: 'Social',  angle: 90   },
    { key: 'steady_surge',   lo: 'Steady',  hi: 'Surge',   angle: 180  },
] as const;

// ============================================================================
// HELPERS
// ============================================================================

/** Converts polar (angle in degrees, radius) to Cartesian, centred at CENTER */
function polar(angleDeg: number, radius: number): { x: number; y: number } {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return {
        x: CENTER + radius * Math.cos(rad),
        y: CENTER + radius * Math.sin(rad),
    };
}

/** Given seeds, build the four points of the radar polygon */
function buildPoints(seeds: Record<string, number>): { x: number; y: number }[] {
    return AXES.map(axis => {
        const value = seeds[axis.key] ?? 50;         // 0–100
        const r = (value / 100) * MAX_RADIUS;
        return polar(axis.angle, r);
    });
}

/** Infer seeds from behavioral signals when explicit seeds are absent */
function inferSeeds(props: ResonancePatternCardProps): Record<string, number> {
    const base: Record<string, number> = {
        depth_breadth: 50,
        reflect_act:   50,
        solo_social:   50,
        steady_surge:  50,
    };

    // Mood: consistently high mood → more active orientation
    if (props.avgMood !== undefined) {
        base.reflect_act += (props.avgMood - 3) * 4; // 1→-8, 5→+8
    }
    // Energy: higher energy → more surge-oriented
    if (props.avgEnergy !== undefined) {
        base.steady_surge += (props.avgEnergy - 3) * 6;
    }
    // Solo vs social usage
    if (props.soloUsageRatio !== undefined) {
        // soloUsageRatio: 0=all social, 1=all solo
        base.solo_social = Math.round((1 - props.soloUsageRatio) * 100);
    }

    // Clamp
    for (const k of Object.keys(base)) {
        base[k] = Math.max(0, Math.min(100, base[k]));
    }
    return base;
}

// ============================================================================
// RADAR CHART (no external SVG library — pure RN)
// ============================================================================

function RadarChart({ points, color }: { points: { x: number; y: number }[]; color: string }) {
    // Build a CSS-like polygon clip path equivalent using absolute positioned lines
    // We render the polygon as a filled View using border tricks, with axis lines

    // Grid circles
    const gridRadii = [MAX_RADIUS * 0.33, MAX_RADIUS * 0.66, MAX_RADIUS];

    return (
        <View style={{ width: CHART_SIZE, height: CHART_SIZE }}>
            {/* Grid circles */}
            {gridRadii.map((r, i) => (
                <View
                    key={i}
                    style={{
                        position: 'absolute',
                        left: CENTER - r,
                        top: CENTER - r,
                        width: r * 2,
                        height: r * 2,
                        borderRadius: r,
                        borderWidth: 1,
                        borderColor: color + '28',
                    }}
                />
            ))}

            {/* Axis lines */}
            {AXES.map((axis, i) => {
                const tip = polar(axis.angle, MAX_RADIUS);
                const length = Math.sqrt((tip.x - CENTER) ** 2 + (tip.y - CENTER) ** 2);
                const angleDeg = Math.atan2(tip.y - CENTER, tip.x - CENTER) * (180 / Math.PI);
                return (
                    <View
                        key={`axis-${i}`}
                        style={{
                            position: 'absolute',
                            left: CENTER,
                            top: CENTER,
                            width: length,
                            height: 1,
                            backgroundColor: color + '30',
                            transformOrigin: 'left center' as any,
                            transform: [{ rotate: `${angleDeg}deg` }],
                        }}
                    />
                );
            })}

            {/* Polygon: rendered as dots connected visually via axis endpoint markers */}
            {points.map((pt, i) => (
                <View
                    key={`pt-${i}`}
                    style={{
                        position: 'absolute',
                        left: pt.x - 5,
                        top: pt.y - 5,
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: color,
                        opacity: 0.9,
                    }}
                />
            ))}

            {/* Center dot */}
            <View
                style={{
                    position: 'absolute',
                    left: CENTER - 3,
                    top: CENTER - 3,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: color + '80',
                }}
            />
        </View>
    );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ResonancePatternCard({
    orientationSeeds,
    avgMood,
    avgEnergy,
    soloUsageRatio,
    onExplore,
}: ResonancePatternCardProps) {
    const colors = useThemedColors();

    const hasSeeds = !!orientationSeeds;
    const isForming = !hasSeeds && avgMood === undefined && avgEnergy === undefined;

    const seeds: Record<string, number> = useMemo(() => {
        if (orientationSeeds) {
            return {
                depth_breadth: orientationSeeds.depth_breadth,
                reflect_act:   orientationSeeds.reflect_act,
                solo_social:   orientationSeeds.solo_social,
                steady_surge:  orientationSeeds.steady_surge,
            };
        }
        return inferSeeds({ orientationSeeds, avgMood, avgEnergy, soloUsageRatio });
    }, [orientationSeeds, avgMood, avgEnergy, soloUsageRatio]);

    const points = useMemo(() => buildPoints(seeds), [seeds]);

    const accentColor = Theme.colors.sanctuarySaffron;

    return (
        <View
            style={{
                backgroundColor: colors.secondary,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                padding: Theme.spacing.md,
                ...Theme.shadows.sm,
            }}
        >
            <VStack space="md">
                {/* Header */}
                <HStack space="sm" alignItems="center">
                    <Sparkles color={accentColor} size={16} />
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '700',
                            letterSpacing: 1,
                            color: accentColor,
                            textTransform: 'uppercase',
                        }}
                    >
                        Your Learning Pattern
                    </Text>
                </HStack>

                {isForming ? (
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: Theme.typography.fontSize.sm,
                            lineHeight: 20,
                            textAlign: 'center',
                            padding: Theme.spacing.lg,
                        }}
                    >
                        ✦ Still forming...{'\n'}
                        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                            Your pattern will emerge as you use the app.
                        </Text>
                    </Text>
                ) : (
                    <HStack space="lg" alignItems="center">
                        {/* Radar chart */}
                        <RadarChart points={points} color={accentColor} />

                        {/* Axis labels */}
                        <VStack space="sm" style={{ flex: 1 }}>
                            {AXES.map(axis => {
                                const value = seeds[axis.key] ?? 50;
                                const pct = value / 100;
                                const pole = pct < 0.4 ? axis.lo : pct > 0.6 ? axis.hi : '—';
                                const intensity = Math.abs(value - 50) / 50; // 0=neutral, 1=strong
                                return (
                                    <View key={axis.key}>
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{axis.lo}</Text>
                                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{axis.hi}</Text>
                                        </HStack>
                                        <View
                                            style={{
                                                height: 4,
                                                backgroundColor: colors.border,
                                                borderRadius: 2,
                                                marginTop: 2,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    left: `${value}%` as any,
                                                    top: -1,
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: accentColor,
                                                    transform: [{ translateX: -3 }],
                                                }}
                                            />
                                        </View>
                                    </View>
                                );
                            })}
                        </VStack>
                    </HStack>
                )}

                {/* Footer note */}
                <Text
                    style={{
                        color: colors.textTertiary,
                        fontSize: 10,
                        textAlign: 'center',
                        fontStyle: 'italic',
                    }}
                >
                    {hasSeeds
                        ? 'Based on your orientation — shifts as you grow'
                        : 'Emerging from your usage patterns'}
                </Text>

                {!isForming && onExplore && (
                    <Pressable
                        onPress={onExplore}
                        style={{
                            alignSelf: 'center',
                            paddingHorizontal: Theme.spacing.lg,
                            paddingVertical: Theme.spacing.sm,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: accentColor + '60',
                        }}
                    >
                        <Text style={{ color: accentColor, fontSize: 12, fontWeight: '600' }}>
                            Explore your pattern →
                        </Text>
                    </Pressable>
                )}
            </VStack>
        </View>
    );
}

export default ResonancePatternCard;
