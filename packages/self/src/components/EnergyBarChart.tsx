/**
 * ENERGY BAR CHART
 * A visualizer for energy pulse levels over time.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import React from 'react';
import { 
    Box, 
    Text, 
    VStack, 
    HStack, 
    Icon,
    AnimatedView 
} from '@repo/ui';
import { Activity, Zap } from 'lucide-react-native';
import { MOOD_LABELS, ENERGY_COLORS } from '../constants/wellbeing';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';

interface EnergyBarChartProps {
    /** Energy forecast rows, already reversed so oldest→newest left→right. */
    bars: Array<{ id?: string; energy_level: number; forecast_date?: string }>;
    /** Colour palette to use. Defaults to ENERGY_COLORS. */
    colors?: readonly string[];
    /** Height of the chart container in px. Defaults to 100. */
    height?: number;
}

export function EnergyBarChart({ 
    bars, 
    colors = ENERGY_COLORS, 
    height = 100 
}: EnergyBarChartProps) {
    if (!bars || !bars.length) {
        return (
            <VStack className="items-center py-8 gap-3 opacity-30">
                <Icon as={Activity} size={32} className="text-mistGray" />
                <Text className="text-mistGray text-xs font-bold text-center max-w-[200px]">
                    No energy logs yet. Log your first reading to see your pulse.
                </Text>
            </VStack>
        );
    }

    return (
        <AnimatedView entering={FadeInUp.duration(800)}>
            <VStack className="w-full gap-4">
                <HStack className="items-center gap-2">
                    <Icon as={Zap} size={12} className="text-sanctuarySaffron" />
                    <Text className="text-mistGray/50 text-[10px] uppercase font-black tracking-widest leading-none">
                        Pulse Intensity · Last {bars.length} recorded days
                    </Text>
                </HStack>

                <Box className="flex-row items-end gap-2" style={{ height }}>
                    {bars.map((f, i) => {
                        const level = Math.max(0, Math.min(5, f.energy_level));
                        const pct = (level / 5) * 100;
                        const barColor = colors[level] ?? '#FCD34D'; // sanctuarySaffron fallback

                        return (
                            <AnimatedView 
                                key={f.id ?? i}
                                layout={LinearTransition}
                                entering={FadeInUp.delay(i * 50)}
                                className="flex-1"
                                style={{ height: `${pct}%` }}
                            >
                                <Box 
                                    className="w-full rounded-t-lg shadow-sm"
                                    style={{ 
                                        backgroundColor: barColor,
                                        opacity: 0.4 + (level / 5) * 0.6,
                                        minHeight: 4
                                    }}
                                />
                            </AnimatedView>
                        );
                    })}
                </Box>

                <HStack className="justify-between items-center px-1 border-t border-white/5 pt-3">
                    <Text className="text-mistGray/30 text-[9px] font-black uppercase tracking-widest">
                        Genesis
                    </Text>
                    <Box className="flex-row items-center gap-1.5 bg-emeraldGreen/10 px-2.5 py-1 rounded-full border border-emeraldGreen/10">
                        <Box className="w-1 h-1 rounded-full bg-emeraldGreen animate-pulse" />
                        <Text className="text-emeraldGreen text-[9px] font-black uppercase tracking-widest">
                            Today
                        </Text>
                    </Box>
                </HStack>
            </VStack>
        </AnimatedView>
    );
}

export default EnergyBarChart;
