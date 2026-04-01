/**
 * ResonancePatternCard
 *
 * Shows the user their own behavioral fingerprint — a shape that
 * emerges from how they actually use the app, not from a quiz answer.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
    VStack,
    HStack,
    Text,
    Theme,
    useThemedColors,
} from '@repo/ui';
import {
    Canvas,
    Circle,
    Group,
    Line,
    Path,
    Skia,
    vec,
} from '@shopify/react-native-skia';
import { Sparkles } from 'lucide-react-native';
import type { OrientationSeeds } from '@repo/profile';
import type { MoodLog, EnergyForecast } from '../types/Wellbeing';
import { useOrientationInference } from '../hooks/useOrientationInference';
import { usePermissions } from '@repo/core';

// —————————————————————————————————————————————————————————————————————————————
// CONSTANTS
// —————————————————————————————————————————————————————————————————————————————

const CHART_SIZE = 140;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 54;

const AXES = [
    { key: 'depth_breadth', lo: 'Deep', hi: 'Wide', angle: -90 },
    { key: 'reflect_act', lo: 'Reflect', hi: 'Act', angle: 0 },
    { key: 'solo_social', lo: 'Solo', hi: 'Social', angle: 90 },
    { key: 'steady_surge', lo: 'Steady', hi: 'Surge', angle: 180 },
] as const;

// —————————————————————————————————————————————————————————————————————————————
// HELPERS
// —————————————————————————————————————————————————————————————————————————————

function polar(angleDeg: number, radius: number): { x: number; y: number } {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return {
        x: CENTER + radius * Math.cos(rad),
        y: CENTER + radius * Math.sin(rad),
    };
}

function buildPoints(seeds: Record<string, number>): { x: number; y: number }[] {
    return AXES.map(axis => {
        const value = seeds[axis.key] ?? 50;
        const r = (value / 100) * MAX_RADIUS;
        return polar(axis.angle, r);
    });
}

// —————————————————————————————————————————————————————————————————————————————
// RADAR CHART
// —————————————————————————————————————————————————————————————————————————————

function RadarChart({ points, color }: { points: { x: number; y: number }[]; color: string }) {
    const gridRadii = [MAX_RADIUS * 0.33, MAX_RADIUS * 0.66, MAX_RADIUS];

    const polygonPath = useMemo(() => {
        const path = Skia.Path.Make();
        if (!points || points.length === 0 || !points[0]) return path;

        path.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const pt = points[i];
            if (pt) {
                path.lineTo(pt.x, pt.y);
            }
        }
        path.close();
        return path;
    }, [points]);

    const centerVec = vec(CENTER, CENTER);

    return (
        <View style={{ width: CHART_SIZE, height: CHART_SIZE }}>
            <Canvas style={StyleSheet.absoluteFill}>
                {gridRadii.map((r, i) => (
                    <Circle
                        key={`grid-${i}`}
                        cx={CENTER}
                        cy={CENTER}
                        r={r}
                        color={color}
                        style="stroke"
                        strokeWidth={1}
                        opacity={0.15}
                    />
                ))}

                {AXES.map((axis, i) => {
                    const tip = polar(axis.angle, MAX_RADIUS);
                    return (
                        <Line
                            key={`axis-${i}`}
                            p1={centerVec}
                            p2={vec(tip.x, tip.y)}
                            color={color}
                            strokeWidth={1}
                            opacity={0.1}
                        />
                    );
                })}

                <Group>
                    <Path
                        path={polygonPath}
                        color={color}
                        style="fill"
                        opacity={0.2}
                    />
                    <Path
                        path={polygonPath}
                        color={color}
                        style="stroke"
                        strokeWidth={2}
                        opacity={0.8}
                    />
                    {points.map((pt, i) => (
                        <Circle
                            key={`pt-${i}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={3}
                            color={color}
                        />
                    ))}
                </Group>

                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={2}
                    color={color}
                    opacity={0.5}
                />
            </Canvas>
        </View>
    );
}

// —————————————————————————————————————————————————————————————————————————————
// MAIN COMPONENT
// —————————————————————————————————————————————————————————————————————————————

export interface ResonancePatternCardProps {
    orientationSeeds?: OrientationSeeds | null;
    moodLogs?: MoodLog[];
    energyForecasts?: EnergyForecast[];
    gradeNumber?: number | null;
    onExplore?: () => void;
}

export function ResonancePatternCard({
    orientationSeeds,
    moodLogs,
    energyForecasts,
    gradeNumber,
    onExplore,
}: ResonancePatternCardProps) {
    const colors = useThemedColors();
    const { context } = usePermissions();
    const authority = context.roles[0];

    const { seeds: inferredSeeds, isDefault, confidence, dataQuality } = useOrientationInference({
        explicitSeeds: orientationSeeds,
        moodLogs,
        energyForecasts,
        authority,
        gradeNumber,
    });

    const seeds: Record<string, number> = {
        depth_breadth: inferredSeeds.depth_breadth,
        reflect_act: inferredSeeds.reflect_act,
        solo_social: inferredSeeds.solo_social,
        steady_surge: inferredSeeds.steady_surge,
    };

    const isForming = isDefault && confidence < 0.25;
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
                        Your Resonance Pattern
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
                        <RadarChart points={points} color={accentColor} />
                        <VStack space="sm" style={{ flex: 1 }}>
                            {AXES.map(axis => {
                                const value = seeds[axis.key] ?? 50;
                                return (
                                    <View key={axis.key}>
                                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{axis.lo}</Text>
                                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{axis.hi}</Text>
                                        </HStack>
                                        <View
                                            style={{
                                                height: 4,
                                                backgroundColor: colors.border,
                                                borderRadius: 2,
                                                marginTop: 2,
                                                position: 'relative'
                                            }}
                                        >
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    left: `${value}%`,
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

                <Text
                    style={{
                        color: colors.textTertiary,
                        fontSize: 10,
                        textAlign: 'center',
                        fontStyle: 'italic',
                    }}
                >
                    {dataQuality === 'strong' && orientationSeeds
                        ? 'Based on your orientation — shifts as you grow'
                        : dataQuality === 'strong'
                            ? 'Pattern confirmed across consistent data'
                            : dataQuality === 'emerging'
                                ? 'Still emerging — keeps refining as you log'
                                : 'Starting from your perspective — refines with use'}
                </Text>

                {!isForming && onExplore && (
                    <Pressable
                        onPress={onExplore}
                        style={({ pressed }) => ({
                            alignSelf: 'center',
                            paddingHorizontal: Theme.spacing.lg,
                            paddingVertical: Theme.spacing.sm,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: accentColor + '60',
                            backgroundColor: pressed ? `${accentColor}10` : 'transparent',
                        })}
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
