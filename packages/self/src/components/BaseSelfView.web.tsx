import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { VStack, HStack, WebScreenHeader, FeatureInfoIcon } from '@repo/ui';
import { BaseSelfViewProps } from './BaseSelfView.types';
import { FEATURE_EMOJIS } from './BaseSelfView';
import { useFeatureActivity } from '../hooks/useFeatureActivity';
import { useDynamicSelfFeatures } from '../hooks/useDynamicSelfFeatures';
import { FEATURE_DISCOVERY_DATA } from '../constants/selfRegistry';

/**
 * BaseSelfView.web - The architectural kernel for GuruDevi Self sections on Web.
 * This component implements the "Control Center" hub.
 */
export function BaseSelfView({
    role,
    title = 'Inner Sanctuary',
    description,
    domains,
    sideBar,
    reminders,
    morningRitual,
    nightRitual,
    voiceJournal,
}: BaseSelfViewProps) {
    const surfaceBg = role === 'student' ? '#F5F3FF' : '#FFF7ED';
    
    const allFeatures = React.useMemo(() => [
        ...domains.flatMap((domain: any) =>
            (domain.features || []).map((feature: any) => ({
                ...feature,
                domainId: domain.id,
                domainColor: domain.accentColor
            }))
        ),
        // Inject Mirrors as "Reflections" if provided
        ...(sideBar ? [{
            id: 'mirrors',
            label: 'Reflections',
            content: sideBar,
            domainId: 'reflections',
            domainColor: '#8B5CF6'
        }] : []),
        // Inject Reminders if provided
        ...(reminders ? [{
            id: 'reminders',
            label: 'Reminders',
            content: reminders,
            domainId: 'reminders',
            domainColor: '#F59E0B'
        }] : [])
    ], [domains, sideBar, reminders]);

    const { getPinnedFeatures, togglePin, trackFeatureAccess } = useFeatureActivity();
    const { topItems: sortedFeatures } = useDynamicSelfFeatures(allFeatures);
    const pinned = getPinnedFeatures();

    const [activeCategoryId, setActiveCategoryId] = React.useState(domains[0]?.id);
    const [focusedItemId, setFocusedItemId] = React.useState<string | null>(null);

    const activeDomain = domains.find((d: any) => d.id === activeCategoryId) || domains[0];

    const handleFeaturePress = (featureId: string) => {
        setFocusedItemId(featureId);
        trackFeatureAccess(featureId);
    };

    return (
        <View style={[webStyles.container, { backgroundColor: surfaceBg }]}>
            {/* Fixed Control Panel (Top Hub) - Category Navigation */}
            <View style={webStyles.hubHeader}>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={webStyles.categoryTabs}
                >
                    {domains?.map((domain) => (
                        <View
                            key={domain.id}
                            onPointerDown={() => {
                                setActiveCategoryId(domain.id);
                                setFocusedItemId(null);
                            }}
                            style={[
                                webStyles.categoryCard,
                                activeCategoryId === domain.id && {
                                    backgroundColor: domain.accentColor + '15',
                                    borderColor: domain.accentColor
                                }
                            ]}
                        >
                            <View style={[webStyles.categoryIndicator, { backgroundColor: domain.accentColor }]} />
                            <Text style={[
                                webStyles.categoryTitle,
                                { color: activeCategoryId === domain.id ? domain.accentColor : 'rgba(0,0,0,0.4)' }
                            ]}>
                                {domain.title}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
            {/* Main Content Area - Multi-column based on active domain */}
            <View style={webStyles.contentWrapper}>
                {/* Primary Focus Area */}
                <ScrollView
                    style={webStyles.mainColumn}
                    contentContainerStyle={webStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Featured Detail View (Conditional) */}
                    {focusedItemId && (
                        <View style={[styles.card, { marginBottom: 48, backgroundColor: '#FFF', elevation: 8 }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Text style={[styles.sectionHeading, { color: activeDomain?.accentColor || '#000' }]}>
                                    Focused Detail
                                </Text>
                                <View onPointerDown={() => setFocusedItemId(null)} style={{ cursor: 'pointer', padding: 4 }}>
                                    <Text style={{ fontSize: 20 }}>✕</Text>
                                </View>
                            </View>
                            {/* Render the selected feature content */}
                            {activeDomain?.features?.find((f: any) => f.id === focusedItemId)?.content || null}
                        </View>
                    )}

                    {activeDomain?.content && !focusedItemId && (
                        <View style={webStyles.activeDomainContainer}>
                            {activeDomain?.content}
                        </View>
                    )}

                    {activeDomain?.features && !focusedItemId && !activeDomain.content && (
                        <View style={webStyles.activeDomainContainer}>
                            <VStack space="xl">
                                {sortedFeatures
                                    .filter((f: any) => f.domainId === activeCategoryId || (activeCategoryId === 'reflections' && f.id === 'mirrors'))
                                    .map((feature) => {
                                        const isPinned = pinned.includes(feature.id);
                                        return (
                                            <View
                                                key={feature.id}
                                                style={[styles.card, { borderLeftWidth: 6, borderLeftColor: feature.domainColor, marginBottom: 24 }]}
                                            >
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <HStack sx={{ alignItems: 'center', space: 'sm' } as any}>
                                                        <Text style={{ fontSize: 20 }}>
                                                            {FEATURE_EMOJIS[feature.id as keyof typeof FEATURE_EMOJIS] || '✨'}
                                                        </Text>
                                                        <Text style={[styles.sectionHeading, { color: feature.domainColor, marginBottom: 0 }]}>
                                                            {feature.label}
                                                        </Text>
                                                    </HStack>
                                                    
                                                    <HStack sx={{ alignItems: 'center', space: 'md' } as any}>
                                                        <Pressable 
                                                            onPress={() => togglePin(feature.id)}
                                                            style={{ padding: 4 }}
                                                        >
                                                            <Text style={{ 
                                                                fontSize: 16, 
                                                                color: isPinned ? feature.domainColor : 'rgba(0,0,0,0.1)' 
                                                            }}>
                                                                {isPinned ? '📌' : '📍'}
                                                            </Text>
                                                        </Pressable>
                                                        <Pressable onPress={() => handleFeaturePress(feature.id)}>
                                                            <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.2)', fontWeight: '700' }}>EXPAND</Text>
                                                        </Pressable>
                                                    </HStack>
                                                </View>
                                                {feature.content}
                                            </View>
                                        );
                                    })}
                            </VStack>
                        </View>
                    )}

                    {(morningRitual || voiceJournal || nightRitual) && !focusedItemId && (
                        <View style={webStyles.ritualSection}>
                            <Text style={styles.sectionHeading}>Daily Rituals</Text>
                            <View style={webStyles.ritualGrid}>
                                {voiceJournal && <View style={webStyles.ritualCard}>{voiceJournal}</View>}
                                {morningRitual && <View style={webStyles.ritualCard}>{morningRitual}</View>}
                                {nightRitual && <View style={webStyles.ritualCard}>{nightRitual}</View>}
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Support Sidebar (Unified Feedback) */}
                <View style={webStyles.sideColumn}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={webStyles.sideBarContent}
                    >
                        <Text style={styles.sectionHeading}>Mirrors & Ripples</Text>
                        {sideBar}
                        {reminders}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const webStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FDFCF6',
    } as any,
    hubHeader: {
        padding: 40,
        paddingBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    } as any,
    headerInfo: {
        marginBottom: 32,
    },
    categoryTabs: {
        gap: 16,
        paddingRight: 40,
    } as any,
    categoryCard: {
        width: 200,
        padding: 20,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderWidth: 2,
        borderColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    } as any,
    featureCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        position: 'relative',
    },
    pinButton: {
        position: 'absolute',
        top: 0,
        right: 24,
        cursor: 'pointer',
        fontSize: 14,
        padding: 4,
    },
    activeDomainContainer: {
        padding: 20,
    },
    categoryIndicator: {
        width: 4,
        height: 20,
        borderRadius: 2,
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    contentWrapper: {
        flex: 1,
        flexDirection: 'row',
    } as any,
    mainColumn: {
        flex: 1,
        height: '100%',
    } as any,
    sideColumn: {
        width: 380,
        height: '100%',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.05)',
        backgroundColor: 'rgba(255,255,255,0.2)',
    } as any,
    scrollContent: {
        padding: 40,
    } as any,
    sideBarContent: {
        padding: 40,
        gap: 32,
    } as any,
    ritualSection: {
        marginTop: 20,
    },
    ritualGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        marginTop: 8,
    } as any,
    ritualCard: {
        flex: 1,
        minWidth: 300,
    } as any,
    roleTag: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
        color: 'rgba(0,0,0,0.3)',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: 'rgba(0,0,0,0.5)',
        lineHeight: 22,
        maxWidth: 600,
    }
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 20,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
    },
    sectionHeading: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 24,
        opacity: 0.8,
    }
});
