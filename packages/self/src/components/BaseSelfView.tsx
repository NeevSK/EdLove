import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';

/**
 * Two-Layer Harmonic Architecture Registry
 * Defines the core structure for every educator's 'Self' section.
 */
export interface BaseSelfViewProps {
    role: 'teacher' | 'principal' | 'founder' | 'admin' | 'student' | 'guest';
    description?: string;

    // Core Layers
    personalLayer: React.ReactNode;  // The Pulse (Original: Mood/Energy)
    workingLayer: React.ReactNode;   // The Rhythm (Role-specific)
    sideBar: React.ReactNode;        // The Mirror (Social/Narrative)

    // Exhaustive Base Expansion (Universal)
    sleepTracker?: React.ReactNode;
    voiceJournal?: React.ReactNode;
    fireJournal?: React.ReactNode;
    joyJar?: React.ReactNode;
    tomorrowPrep?: React.ReactNode;
    reminders?: React.ReactNode;
    breathGuide?: React.ReactNode;

    /** Optional accent for the entire view */
    accentColor?: string;
}

/**
 * BaseSelfView - The architectural kernel for GuruDevi Self sections.
 * This component enforces the separation of 'Personal Sanctuary' and 'Working Self'.
 */
export function BaseSelfView({
    role,
    description,
    personalLayer,
    workingLayer,
    sideBar,
    sleepTracker,
    voiceJournal,
    fireJournal,
    joyJar,
    tomorrowPrep,
    reminders,
    breathGuide,
}: BaseSelfViewProps) {
    const isWeb = Platform.OS === 'web';
    const hour = new Date().getHours();
    const isMorning = hour >= 5 && hour < 11;
    const isNight = hour >= 20 || hour < 5;

    // Sanctuary Surface (Warm/Lavender) vs Working Surface (Teal/Cool)
    const sanctuaryBg = role === 'student' ? '#F5F3FF' : '#FFF7ED';
    const workingBg = '#F0FDFA';

    if (isWeb) {
        return (
            <View style={[webStyles.container, { backgroundColor: sanctuaryBg }]}>
                {/* Main Content (65%) */}
                <ScrollView
                    style={webStyles.contentArea}
                    contentContainerStyle={webStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={webStyles.header}>
                        <Text style={webStyles.roleTag}>{role.toUpperCase()}</Text>
                        <Text style={webStyles.description}>{description}</Text>
                    </View>

                    {/* Dynamic Time-Based Prioritization */}
                    {isMorning && tomorrowPrep && (
                        <View style={webStyles.layerSpacer}>{tomorrowPrep}</View>
                    )}

                    <View style={webStyles.layerSpacer}>
                        <View style={styles.sanctuaryCard}>
                            <Text style={styles.sectionHeading}>Personal Sanctuary</Text>
                            {personalLayer}
                            {breathGuide}
                            {voiceJournal}
                            {fireJournal}
                        </View>
                    </View>

                    <View style={webStyles.layerSpacer}>
                        <View style={styles.workingCard}>
                            <Text style={styles.sectionHeading}>Working Self</Text>
                            {workingLayer}
                        </View>
                    </View>

                    {isNight && (sleepTracker || joyJar) && (
                        <View style={webStyles.layerSpacer}>
                            {sleepTracker}
                            {joyJar}
                        </View>
                    )}
                </ScrollView>

                {/* Sidebar (35%) */}
                <View style={[webStyles.sideBarArea, { backgroundColor: 'transparent' }]}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={webStyles.sideBarContent}
                    >
                        {sideBar}
                        {reminders}
                    </ScrollView>
                </View>
            </View>
        );
    }

    // Native implementation (Mobile) - Enhanced with logic and color surfaces
    return (
        <ScrollView style={[nativeStyles.container, { backgroundColor: sanctuaryBg }]} showsVerticalScrollIndicator={false}>
            <View style={nativeStyles.header}>
                <Text style={nativeStyles.roleTag}>{role.toUpperCase()}</Text>
                <Text style={nativeStyles.description}>{description}</Text>
            </View>

            {/* Layer 1: Personal Sanctuary (Warm Surface) */}
            <View style={[nativeStyles.section, { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 24, margin: 12 }]}>
                <Text style={[nativeStyles.sectionTitle, { color: '#C2410C' }]}>Personal Sanctuary</Text>

                {/* Morning Prioritization */}
                {isMorning && tomorrowPrep}

                {personalLayer}
                {breathGuide}
                {voiceJournal}
                {fireJournal}

                {/* Night Rituals */}
                {isNight && (
                    <View style={{ marginTop: 16 }}>
                        {sleepTracker}
                        {joyJar}
                    </View>
                )}
            </View>

            {/* Layer 2: Working Self (Cool Surface) */}
            <View style={[nativeStyles.section, { backgroundColor: workingBg, borderRadius: 24, margin: 12 }]}>
                <Text style={[nativeStyles.sectionTitle, { color: '#0D9488' }]}>Working Self</Text>
                {workingLayer}
            </View>

            {/* Layer 3: Mirror Surface */}
            <View style={nativeStyles.section}>
                <Text style={nativeStyles.sectionTitle}>Mirrors & Reminders</Text>
                {sideBar}
                {reminders}
            </View>
        </ScrollView>
    );
}

const webStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        height: '100%',
    } as any,
    contentArea: {
        flex: 0.65,
        height: '100%',
    } as any,
    scrollContent: {
        padding: 40,
        paddingRight: 60,
    } as any,
    sideBarArea: {
        flex: 0.35,
        height: '100%',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.08)',
    } as any,
    sideBarContent: {
        padding: 40,
        gap: 32,
    } as any,
    header: {
        marginBottom: 48,
    },
    roleTag: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        color: 'rgba(0,0,0,0.4)',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.6)',
        maxWidth: 500,
        lineHeight: 22,
    },
    layerSpacer: {
        marginBottom: 64,
    }
});

const nativeStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 10,
    },
    roleTag: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        color: 'rgba(0,0,0,0.3)',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: 'rgba(0,0,0,0.5)',
        lineHeight: 18,
    },
    section: {
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 20,
        letterSpacing: 1.5,
    }
});

const styles = StyleSheet.create({
    sanctuaryCard: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 24,
        padding: 24,
    },
    workingCard: {
        backgroundColor: '#F0FDFA',
        borderRadius: 24,
        padding: 24,
    },
    sectionHeading: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        color: 'rgba(0,0,0,0.2)',
        textTransform: 'uppercase',
        marginBottom: 24,
    }
});
