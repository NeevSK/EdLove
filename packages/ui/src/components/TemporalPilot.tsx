import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { Calendar, Search, Wifi, WifiOff, Zap, Layout } from 'lucide-react-native';
import { useTemporalStore } from '@repo/core';
import { Theme } from '../theme/Theme';


import { TemporalScrubber } from './TemporalScrubber';

/**
 * TemporalPilot
 * 
 * The ultimate temporal command center. 
 * Merges the intuitive flow of the Scrubber with the tactical precision of a Calendar.
 */
export const TemporalPilot: React.FC = () => {
    const { 
        viewScale, setScale, 
        viewMode, setViewMode,
        timelineFocus, setTimelineFocus,
        isOffline, setOffline 
    } = useTemporalStore();
    const [isCalendarVisible, setCalendarVisible] = useState(false);



    return (
        <View style={styles.container}>
            {/* Tactical Switcher */}
            <View style={styles.header}>
                <View style={styles.scales}>
                    {(['day', 'week', 'month'] as const).map((s) => (
                        <TouchableOpacity
                            accessibilityRole="button"
                            key={s}
                            onPress={() => setScale(s)}
                            style={[styles.scaleButton, viewScale === s && styles.scaleButtonActive]}
                        >
                            <Text style={[styles.scaleText, viewScale === s && styles.scaleTextActive]}>
                                {s.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.actions}>
                    {/* View Mode Toggle */}
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => setViewMode(viewMode === 'spotlight' ? 'timeline' : 'spotlight')}
                        style={[styles.iconButton, viewMode === 'timeline' && styles.iconButtonActive]}
                    >
                        {viewMode === 'spotlight' ? (
                            <Zap size={20} color={Theme.colors.resonance.present} />
                        ) : (
                            <Layout size={20} color={Theme.colors.resonance.present} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => setOffline(!isOffline)}
                        style={styles.iconButton}
                    >
                        {isOffline ? (
                            <WifiOff size={20} color="#FF6B6B" />
                        ) : (
                            <Wifi size={20} color={Theme.colors.resonance.present} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => setCalendarVisible(true)}
                        style={styles.iconButton}
                    >
                        <Calendar size={20} color={Theme.colors.resonance.present} />
                    </TouchableOpacity>

                    <TouchableOpacity accessibilityRole="button" style={styles.iconButton}>
                        <Search size={20} color={Theme.colors.resonance.present} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Focus Selector (Only in Timeline Mode) */}
            {viewMode === 'timeline' && (
                <View style={styles.focusContainer}>
                    {(['all', 'mood', 'journal'] as const).map((f) => (
                        <TouchableOpacity
                            accessibilityRole="button"
                            key={f}
                            onPress={() => setTimelineFocus(f)}
                            style={[styles.focusButton, timelineFocus === f && styles.focusButtonActive]}
                        >
                            <Text style={[styles.focusText, timelineFocus === f && styles.focusTextActive]}>
                                {f.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Intuitive Flow */}
            <TemporalScrubber />


            {/* Tactical Calendar Modal (Mock for now, to be populated with real library) */}
            <Modal visible={isCalendarVisible} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.calendarContainer}>
                        <Text style={styles.modalTitle}>Select Temporal Point</Text>
                        {/* Placeholder for real calendar component */}
                        <View style={styles.calendarPlaceholder}>
                            <Text style={{ color: '#fff', opacity: 0.5 }}>[Tactical Calendar Utility]</Text>
                        </View>
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={() => setCalendarVisible(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>LOCK TEMPORAL VIEW</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 16,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    scales: {
        flexDirection: 'row',
        gap: 8,
    },
    scaleButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    scaleButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    scaleText: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.4)',
    },
    scaleTextActive: {
        color: '#fff',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: '#F6BF8C',
        borderWidth: 1,
    },
    focusContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        justifyContent: 'center',
    },
    focusButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    focusButtonActive: {
        backgroundColor: 'rgba(246, 191, 140, 0.1)',
        borderColor: '#F6BF8C',
    },
    focusText: {
        fontSize: 9,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.3)',
        letterSpacing: 1,
    },
    focusTextActive: {
        color: '#F6BF8C',
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        width: '90%',
        backgroundColor: '#1A1A1A',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 24,
        textAlign: 'center',
    },
    calendarPlaceholder: {
        height: 300,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    closeButton: {
        backgroundColor: '#F6BF8C',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#000',
        fontWeight: '800',
        letterSpacing: 1,
    }
});
