/**
 * ResonancePatternCard
 *
 * Shows the user their own behavioral fingerprint \u2014 a shape that
 * emerges from how they actually use the app, not from a quiz answer.
 *
 * \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
 * PHILOSOPHY:
 *   The card never shows a type label ("You are INTJ" or "Type 5").
 *   It shows a PATTERN \u2014 four axes, each labelled with two poles.
 *   The shape is the user's; the interpretation is left to them.
 *
 *   "Your pattern is not who you are. It is where you are now."
 * \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
 *
 * Data sources (priority order):
 *  1. `orientation_seeds` from user profile (if onboarding step was done)
 *  2. Behavioral inference from mood timing, energy logs, app usage
 *  3. Neutral defaults (all 50) if no data yet \u2192 card shows "still forming"
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
import { useOrientationInference, type DataQuality } from '../hooks/useOrientationInference';
import { usePermissions } from '@repo/core';

// ============================================================================
// TYPES
// ============================================================================

export interface ResonancePatternCardProps {
    /** Explicit seeds from user profile \u2014 provided if onboarding was completed */
    orientationSeeds?: OrientationSeeds | null;
    /** Feed from useMoodLogs \u2014 used for behavioral inference */
    moodLogs?: MoodLog[];
    /** Feed from useEnergyForecast \u2014 used for behavioral inference */
    energyForecasts?: EnergyForecast[];
    /** Student grade number \u2014 narrows role-based default for students */
    gradeNumber?: number | null;
    onExplore?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_SIZE = 140;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 54;

const AXES = [
    { key: 'depth_breadth', lo: 'Deep', hi: 'Wide', angle: -90 },
    { key: 'reflect_act', lo: 'Reflect', hi: 'Act', angle: 0 },
    { key: 'solo_social', lo: 'Solo', hi: 'Social', angle: 90 },
    { key: 'steady_surge', lo: 'Steady', hi: 'Surge', angle: 180 },
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
        const value = seeds[axis.key] ?? 50;         // 0\u2013100
        const r = (value / 100) * MAX_RADIUS;
        return polar(axis.angle, r);
    });
}

/** Infer seeds from behavioral signals when explicit seeds are absent */
// ============================================================================
// RADAR CHART (no external SVG library \u2014 pure RN)
// ============================================================================

function RadarChart({ points, color }: { points: { x: number; y: number }[]; color: string }) {
    // Grid circles
    const gridRadii = [MAX_RADIUS * 0.33, MAX_RADIUS * 0.66, MAX_RADIUS];

    // Build path for the polygon
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
        <View style={{ width: CHART_SIZE, height: CHART_SIZE }}
            <Canvas style={StyleSheet.absoluteFill}>
                {/* Grid circles */}
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
                >))}

                {/* Axis lines */}
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
                    >);
                })}

                {/* The Resonance Polygon */}
                <Group
                    <Path
                        >path={polygonPath}
                        color={color}
                        style="fill"
                        opacity={0.2}
                    />
                    ><Path
                        path={polygonPath}
                        color={color}
                        style="stroke"
                        strokeWidth={2}
                        opacity={0.8}
                    />

                    >{/* Polygon corner glows */}
                    {points.map((pt, i) => (
                        <Circle
                            key={`pt-${i}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={3}
                            color={color}
                        />
                    >))}
                </Group>

                {/* Center dot */}
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={2}
                    color={color}
                    opacity={0.5}
                />
            ></Canvas>
        </View>
    );
}

// ============================================================================
// COMPONENT
// ============================================================================

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

    // useOrientationInference handles ALL fallback layers:
    // explicit seeds \u2192 behavioral signals \u2192 role defaults \u2192 neutral 50
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

    // "Still forming" only when role-only defaults AND very low confidence
    // (brand new user, no behavior yet \u2014 should be rare since role is always set)
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
                ...Theme.shadows.sm,>
            }}
        
            <VStack space="md"
                {/* Header */}>
                <HStack space="sm" alignItems="center"
                    <Sparkles color={accentColor} size={16} />
                    ><Text
                        style={{
                            fontSize: 11,
                            fontWeight: '700',
                            letterSpacing: 1,
                            color: accentColor,
                            textTransform: 'uppercase',>
                        }}
                    
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
                            padding: Theme.spacing.lg,>
                        }}
                    
                        \u2726 Still forming...{'\n'}
                        <Text style={{ color: colors.textTertiary, fontSize: 12 }}
                            Your pattern will emerge as you use the app.>
                        </Text>
                    </Text>
                ) : (
                    <HStack space="lg" alignItems="center"
                        {/* Radar chart */}>
                        <RadarChart points={points} color={accentColor} />
                        {/* Axis labels */}
                        ><VStack space="sm" style={{ flex: 1 }}
                            {AXES.map(axis => {
                                const value = seeds[axis.key] ?? 50;
                                const pct = value / 100;
                                const pole = pct < 0.4 ? axis.lo : pct > 0.6 ? axis.hi : '\u2014';
                                const intensity = Math.abs(value - 50) / 50; // 0=neutral, 1=strong
                                return (
                                    <View key={axis.key}
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{axis.lo}</Text
                                            ><Text style={{ color: colors.textTertiary, fontSize: 10 }}>{axis.hi}</Text
                                        ></HS>tack>
                                        ><View
                                            style={{
                                                height: 4,
                                                backgroundColor: colors.border,
                                                borderRadius: 2,
                                                marginTop: 2,>
                                            }}
                                        
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    left: `${value}%` as any,
                                                    top: -1,
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: accentColor,
                                                    transform: [{ translateX: -3 }],>
                                                }}
                                            /
                                        ></View>
                                    </Vi>ew>
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
                        fontStyle: 'italic',>
                    }}
                
                    {dataQuality === 'strong' && orientationSeeds
                        ? 'Based on your orientation \u2014 shifts as you grow'
                        : dataQuality === 'strong'
                            ? 'Pattern confirmed across consistent data'
                            : dataQuality === 'emerging'
                                ? 'Still emerging \u2014 keeps refining as you log'
                                : 'Starting from your perspective \u2014 refines with use'}
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
                            borderColor: accentColor + '60',>
                        }}
                    
                        <Text style={{ color: accentColor, fontSize: 12, fontWeight: '600' }}
                            Explore your pattern \u2192>
                        </Text>
                    </Pressable>
                )}
            </VStack>
        </View>
    );
}

export default ResonancePatternCard;
