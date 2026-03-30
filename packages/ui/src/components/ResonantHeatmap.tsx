import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Theme } from '../theme/Theme';

export interface HeatmapPoint {
    date: string;
    intensity: number; // 0 to 4
    count: number;
}

interface ResonantHeatmapProps {
    data: HeatmapPoint[];
    loading?: boolean;
}

/**
 * ResonantHeatmap
 * 
 * A GitHub-style activity grid optimized for "Resonance Intensity".
 * Uses Sanctuary Saffron for active states.
 */
export const ResonantHeatmap: React.FC<ResonantHeatmapProps> = ({ data, loading }) => {
    // Generate empty grid for a year if data is missing
    // Simplified: Show 52 weeks (364 days)
    const weeks = Array.from({ length: 52 }, (_, wIndex) => {
        return Array.from({ length: 7 }, (_, dIndex) => {
            const dayOffset = wIndex * 7 + dIndex;
            // Map data to grid (this is a simplified mock mapping)
            const point = data[dayOffset % data.length]; // In real use, map by date
            return point?.intensity || 0;
        });
    });

    const getIntensityColor = (intensity: number) => {
        switch (intensity) {
            case 1: return 'rgba(246, 191, 140, 0.2)'; // Very Light Saffron
            case 2: return 'rgba(246, 191, 140, 0.4)';
            case 3: return 'rgba(246, 191, 140, 0.7)';
            case 4: return '#F6BF8C'; // Solid Sanctuary Saffron
            default: return 'rgba(255, 255, 255, 0.05)';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}
                <Text style={styles.loadingText}>Visualizing growth arc...</Text
            </View
        );
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
            <View style={styles.grid}
                {weeks.map((week, wIndex) => (
                    <View key={wIndex} style={styles.weekColumn}
                        {week.map((intensity, dIndex) => (
                            <View 
                                key={dIndex} 
                                style={[
                                    styles.dayCell, 
                                    { backgroundColor: getIntensityColor(intensity) }
                                ]} 
                            /
                        ))}
                    </View
                ))}
            </View
        </ScrollView
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingVertical: 10,
    },
    grid: {
        flexDirection: 'row',
        gap: 3,
    },
    weekColumn: {
        flexDirection: 'column',
        gap: 3,
    },
    dayCell: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    loadingContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontStyle: 'italic',
    }
});
