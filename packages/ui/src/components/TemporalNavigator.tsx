import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react-native';
import { useTemporalStore } from '@repo/core';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Theme } from '../theme/Theme';

/**
 * TemporalNavigator
 * 
 * A premium UI component that allows users to travel through "Time".
 * Updates the global useTemporalStore which in turn refreshes data across the app.
 */
export const TemporalNavigator = () => {
    const { 
        viewDate, 
        setViewDate, 
        resetToToday, 
        phase,
    } = useTemporalStore();

    const adjustDate = (days: number) => {
        const date = new Date(viewDate);
        date.setDate(date.getDate() + days);
        const dateStr = date.toISOString().split('T')[0] || '';
        setViewDate(dateStr);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dateStr === todayStr) return 'Today';
        if (dateStr === yesterdayStr) return 'Yesterday';

        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    const isToday = phase === 'present';

    return (
        <Animated.View 
            layout={Layout} 
            entering={FadeIn}
            style={styles.container}
        >
            <View style={styles.leftGroup}>
                <TouchableOpacity 
                    accessibilityRole="button" 
                    style={styles.actionBtn} 
                    onPress={() => adjustDate(-1)}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={20} color={Theme.colors.textSecondary} />
                </TouchableOpacity>
                
                {!isToday && (
                    <TouchableOpacity 
                        accessibilityRole="button" 
                        style={styles.resetBtn} 
                        onPress={resetToToday}
                        activeOpacity={0.7}
                    >
                        <RotateCcw size={14} color={Theme.colors.gurudeviBlue} />
                        <Text style={styles.resetText}>Today</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity 
                accessibilityRole="button" 
                style={styles.dateDisplay}
                onPress={() => {/* In a real app, this triggers a DatePicker modal */}}
                activeOpacity={0.7}
            >
                <Calendar size={16} color={Theme.colors.gurudeviBlue} style={{ marginRight: 6 }} />
                <View>
                    <Text style={styles.dateText}>
                        {formatDate(viewDate)}
                    </Text>
                    {/* Temporal pulse (Phase 2 delighter) */}
                    <View style={styles.pulseDot} />
                </View>
            </TouchableOpacity>

            <View style={styles.rightGroup}>
                <TouchableOpacity 
                    accessibilityRole="button" 
                    style={[styles.actionBtn, { opacity: isToday ? 0.2 : 1 }]} 
                    onPress={() => !isToday && adjustDate(1)}
                    disabled={isToday}
                    activeOpacity={0.7}
                >
                    <ChevronRight size={20} color={Theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Theme.colors.glass.light.surface,
        marginHorizontal: Theme.spacing.medium,
        marginVertical: Theme.spacing.small,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        borderColor: Theme.colors.glass.light.border,
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.shadowAmbient,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 3,
            },
            default: {
                boxShadow: `0 4px 12px ${Theme.colors.shadowAmbient}`,
            }
        } as any),
    },
    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    dateText: {
        fontSize: Theme.typography.fontSize.md,
        fontWeight: Theme.typography.fontWeight.bold as any,
        color: Theme.colors.textPrimary,
        letterSpacing: Theme.typography.letterSpacing.tight,
    },
    pulseDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#F6BF8C', // Sanctuary Saffron
        position: 'absolute',
        bottom: -8,
        alignSelf: 'center',
        shadowColor: '#F6BF8C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Theme.colors.silk,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: `${Theme.colors.gurudeviBlue}15`,
    },
    resetText: {
        fontSize: Theme.typography.fontSize.xs,
        fontWeight: Theme.typography.fontWeight.semibold as any,
        color: Theme.colors.gurudeviBlue,
        marginLeft: 4,
    }
});
