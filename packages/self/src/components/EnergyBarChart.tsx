import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MOOD_LABELS, ENERGY_COLORS } from '../constants/wellbeing';

interface EnergyBarChartProps {
    /** Energy forecast rows, already reversed so oldest\u2192newest left\u2192right. */
    bars: Array<{ id?: string; energy_level: number; forecast_date?: string }>;
    /** Colour palette to use. Defaults to ENERGY_COLORS. */
    colors?: readonly string[];
    /** Height of the chart container in px. Defaults to 100. */
    height?: number;
}

/**
 * EnergyBarChart
 * 
 * A 7-day energy pulse visualizer. Uses platform-agnostic primitives.
 */
export function EnergyBarChart({ bars, colors = ENERGY_COLORS, height = 100 }: EnergyBarChartProps) {
    if (!bars.length) {
        return (
            <Text style={styles.emptyText}
                No energy logs yet. Log your first energy reading to see your pulse.
            </Text
        );
    }

    return (
        <View style={styles.container}
            <Text style={styles.subtitle}
                Your energy over the last {bars.length} recorded day{bars.length !== 1 ? 's' : ''}.
            </Text
            <View style={[styles.chartArea, { height }]}
                {bars.map((f, i) => (
                    <View
                        key={f.id ?? i}
                        style={[
                            styles.bar,
                            {
                                backgroundColor: colors[f.energy_level] ?? '#8B5CF6',
                                height: `${(f.energy_level / 5) * 100}%`,
                                opacity: 0.7 + (f.energy_level / 5) * 0.3,
                            },
                        ]}
                    /
                ))}
            </View
            <View style={styles.footer}
                <Text style={styles.footerText}>Oldest</Text
                <Text style={styles.footerText}>Today</Text
            </View
        </View
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        marginBottom: 24,
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    bar: {
        flex: 1,
        borderRadius: 4,
        minHeight: '10%',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    footerText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
    }
});
