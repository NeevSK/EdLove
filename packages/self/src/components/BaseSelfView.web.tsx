import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { VStack, FeatureInfoIcon, TemporalNavigator } from '@repo/ui';
import { usePermissions, useTemporalStore } from '@repo/core';
import { BaseSelfViewProps, SelfViewFeature } from './BaseSelfView.types';
import { FEATURE_EMOJIS, FEATURE_DISCOVERY_DATA } from '../constants/selfRegistry';
import { useFeatureActivity } from '../hooks/useFeatureActivity';
import { useDynamicSelfFeatures } from '../hooks/useDynamicSelfFeatures';

const TEMPORAL_SCALES = ['day', 'week', 'month', 'year'] as const;

/**
 * BaseSelfView.web - Restores the richer control-center sanctuary while
 * adding a shell-owned temporal layer for feature history.
 */
export function BaseSelfView({
    domains,
    sideBar,
    reminders,
    morningRitual,
    nightRitual,
    voiceJournal,
}: BaseSelfViewProps) {
    const { can } = usePermissions();
    const surfaceBg = can('manage', 'StudentDashboard') ? '#F5F3FF' : '#FFF7ED';
    const { viewMode, setViewMode, viewScale, setScale } = useTemporalStore();
    const isHistoryMode = viewMode === 'timeline';

    const allFeatures = React.useMemo(
        () => [
            ...domains.flatMap((domain: any) =>
                (domain.features || []).map((feature: any) => ({
                    ...feature,
                    domainId: domain.id,
                    domainColor: domain.accentColor,
                }))
            ),
            ...(sideBar
                ? [
                      {
                          id: 'mirrors',
                          label: 'Reflections',
                          content: sideBar,
                          historyContent: sideBar,
                          domainId: 'reflections',
                          domainColor: '#8B5CF6',
                      },
                  ]
                : []),
            ...(reminders
                ? [
                      {
                          id: 'reminders',
                          label: 'Reminders',
                          content: reminders,
                          historyContent: reminders,
                          domainId: 'reminders',
                          domainColor: '#F59E0B',
                      },
                  ]
                : []),
        ],
        [domains, sideBar, reminders]
    );

    const { getPinnedFeatures, togglePin, trackFeatureAccess } = useFeatureActivity();
    const { topItems: sortedFeatures } = useDynamicSelfFeatures(allFeatures);
    const pinned = getPinnedFeatures();

    const [activeCategoryId, setActiveCategoryId] = React.useState(domains[0]?.id);
    const [focusedItemId, setFocusedItemId] = React.useState<string | null>(null);

    const activeDomain = domains.find((d: any) => d.id === activeCategoryId) || domains[0];
    const focusedFeature = activeDomain?.features?.find((f: any) => f.id === focusedItemId) || null;

    const renderFocusedFeature = (feature: SelfViewFeature | null) => {
        if (!feature) return null;
        if (!isHistoryMode) return feature.content;
        return feature.historyContent ?? <HistoryScaffold feature={feature} viewScale={viewScale} />;
    };

    const getActiveDomainContent = () => {
        if (!activeDomain) return null;
        if (!isHistoryMode) return activeDomain.content ?? null;
        return activeDomain.historyContent ?? activeDomain.content ?? null;
    };

    return (
        <View style={[webStyles.container, { backgroundColor: surfaceBg }]}>
            {/* @ts-ignore */}
            <View style={webStyles.hubHeader} className="sanctuary-glass-hub">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={webStyles.categoryTabs}
                >
                    {domains?.map((domain) => (
                        <Pressable
                            key={domain.id}
                            onPress={() => {
                                setActiveCategoryId(domain.id);
                                setFocusedItemId(null);
                            }}
                            style={[
                                webStyles.categoryCard,
                                activeCategoryId === domain.id && {
                                    backgroundColor: domain.accentColor + '15',
                                    borderColor: domain.accentColor,
                                },
                            ]}
                            // @ts-ignore
                            className={activeCategoryId === domain.id ? 'sanctuary-card interactive active' : 'sanctuary-card interactive'}
                        >
                            <View style={[webStyles.categoryIndicator, { backgroundColor: domain.accentColor }]} />
                            <Text
                                style={[
                                    webStyles.categoryTitle,
                                    { color: activeCategoryId === domain.id ? domain.accentColor : 'var(--text-muted)' },
                                ]}
                            >
                                {domain.title}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <View style={webStyles.temporalTopbar}>
                <TemporalNavigator />
                <View style={webStyles.temporalControls}>
                    <View style={webStyles.modeRow}>
                        <Pressable
                            onPress={() => setViewMode('spotlight')}
                            style={[webStyles.modeChip, !isHistoryMode && webStyles.modeChipActive]}
                        >
                            <Text style={[webStyles.modeChipText, !isHistoryMode && webStyles.modeChipTextActive]}>
                                Now
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setViewMode('timeline')}
                            style={[webStyles.modeChip, isHistoryMode && webStyles.modeChipActive]}
                        >
                            <Text style={[webStyles.modeChipText, isHistoryMode && webStyles.modeChipTextActive]}>
                                History
                            </Text>
                        </Pressable>
                    </View>
                    {isHistoryMode && (
                        <View style={webStyles.scaleRow}>
                            {TEMPORAL_SCALES.map((scale) => (
                                <Pressable
                                    key={scale}
                                    onPress={() => setScale(scale)}
                                    style={[webStyles.scaleChip, viewScale === scale && webStyles.scaleChipActive]}
                                >
                                    <Text
                                        style={[
                                            webStyles.scaleChipText,
                                            viewScale === scale && webStyles.scaleChipTextActive,
                                        ]}
                                    >
                                        {scale.toUpperCase()}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <View style={webStyles.contentWrapper}>
                <ScrollView
                    style={webStyles.mainColumn}
                    contentContainerStyle={webStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {focusedItemId && (
                        <View style={[styles.card, webStyles.focusCard]}>
                            <View style={webStyles.focusHeader}>
                                <Text style={[styles.sectionHeading, { color: activeDomain?.accentColor || '#000' }]}>
                                    {isHistoryMode ? 'Historical Context' : 'Focused Detail'}
                                </Text>
                                <Pressable onPress={() => setFocusedItemId(null)} style={webStyles.closeButton}>
                                    <Text style={{ fontSize: 20 }}>✕</Text>
                                </Pressable>
                            </View>
                            {renderFocusedFeature(focusedFeature)}
                        </View>
                    )}

                    {!focusedItemId && Boolean(getActiveDomainContent()) && (
                        <View style={webStyles.activeDomainContainer}>{getActiveDomainContent()}</View>
                    )}

                    {activeDomain?.features && !focusedItemId && !getActiveDomainContent() && (
                        <View style={webStyles.activeDomainContainer}>
                            <VStack space="xl">
                                {sortedFeatures
                                    .filter(
                                        (f: any) =>
                                            f.domainId === activeCategoryId ||
                                            (activeCategoryId === 'reflections' && f.id === 'mirrors')
                                    )
                                    .map((feature) => {
                                        const isPinned = pinned.includes(feature.id);
                                        const hasHistory = Boolean(feature.historyContent);

                                        return (
                                            <View
                                                key={feature.id}
                                                style={[
                                                    styles.card,
                                                    { borderLeftWidth: 6, borderLeftColor: feature.domainColor, marginBottom: 24 },
                                                ]}
                                                // @ts-ignore
                                                className="sanctuary-card"
                                            >
                                                <View style={webStyles.featureCardHeader}>
                                                    <View style={webStyles.featureMetaRow}>
                                                        <Text style={{ fontSize: 24 }}>
                                                            {FEATURE_EMOJIS[feature.id as keyof typeof FEATURE_EMOJIS] || '✨'}
                                                        </Text>
                                                        <VStack>
                                                            <Text
                                                                style={[
                                                                    styles.sectionHeading,
                                                                    { color: feature.domainColor, marginBottom: 2, opacity: 1 },
                                                                ]}
                                                            >
                                                                {feature.label}
                                                            </Text>
                                                        </VStack>
                                                        <FeatureInfoIcon
                                                            title={feature.label}
                                                            discoveryInfo={FEATURE_DISCOVERY_DATA[feature.id as keyof typeof FEATURE_DISCOVERY_DATA]}
                                                        />
                                                    </View>

                                                    <View style={webStyles.featureActionsRow}>
                                                        {hasHistory && (
                                                            <Pressable
                                                                onPress={() => {
                                                                    setViewMode('timeline');
                                                                    setFocusedItemId(feature.id);
                                                                }}
                                                                style={{ padding: 4, marginRight: 8, opacity: 0.7 }}
                                                            >
                                                                <Text style={{ fontSize: 16 }}>⏳</Text>
                                                            </Pressable>
                                                        )}
                                                        <Pressable onPress={() => togglePin(feature.id)} style={{ padding: 4 }}>
                                                            <Text
                                                                style={{
                                                                    fontSize: 16,
                                                                    color: isPinned ? feature.domainColor : 'rgba(0,0,0,0.1)',
                                                                }}
                                                            >
                                                                {isPinned ? '📌' : '📍'}
                                                            </Text>
                                                        </Pressable>
                                                        <Pressable
                                                            onPress={() => {
                                                                trackFeatureAccess(feature.id);
                                                                setFocusedItemId(feature.id);
                                                            }}
                                                        >
                                                            <Text style={{ fontSize: 11, color: 'rgba(0,0,0,0.2)', fontWeight: '700' }}>
                                                                {isHistoryMode ? 'OPEN HISTORY' : 'EXPAND'}
                                                            </Text>
                                                        </Pressable>
                                                    </View>
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

                {/* @ts-ignore */}
                <View style={webStyles.sideColumn} className="sanctuary-sidebar-glass">
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={webStyles.sideBarContent}>
                        <Text style={styles.sectionHeading}>Mirrors & Ripples</Text>
                        {sideBar}
                        {reminders}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

function HistoryScaffold({
    feature,
    viewScale,
}: {
    feature: SelfViewFeature & { domainColor?: string };
    viewScale: string;
}) {
    return (
        <View
            style={[
                webStyles.historyScaffold,
                { borderColor: feature.domainColor || '#8B5CF6', backgroundColor: 'rgba(255,252,247,0.84)' },
            ]}
        >
            <Text style={webStyles.historyScaffoldTitle}>{feature.label} history scaffold</Text>
            <Text style={webStyles.historyScaffoldBody}>
                {`This feature can now live inside the temporal shell. A dedicated ${viewScale} history renderer can be added without changing BaseSelf again.`}
            </Text>
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
    categoryTabs: {
        gap: 20,
        paddingRight: 40,
    } as any,
    categoryCard: {
        width: 'auto',
        minWidth: 160,
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    } as any,
    categoryIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    temporalTopbar: {
        paddingHorizontal: 40,
        paddingTop: 24,
        gap: 16,
    },
    temporalControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
    } as any,
    modeRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    modeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: 'rgba(255,252,247,0.82)',
        borderWidth: 1,
        borderColor: 'rgba(204,186,168,0.2)',
    },
    modeChipActive: {
        backgroundColor: '#DEF2E8',
        borderColor: 'rgba(41,161,125,0.24)',
    },
    modeChipText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6E594F',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    modeChipTextActive: {
        color: '#29A17D',
    },
    scaleRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
    } as any,
    scaleChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,252,247,0.82)',
        borderWidth: 1,
        borderColor: 'rgba(204,186,168,0.2)',
    },
    scaleChipActive: {
        backgroundColor: '#EBE5FA',
        borderColor: 'rgba(131,92,246,0.18)',
    },
    scaleChipText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#6E594F',
        letterSpacing: 0.6,
    },
    scaleChipTextActive: {
        color: '#5B3FD6',
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
        backgroundColor: 'rgba(255,255,255,0.15)',
    } as any,
    scrollContent: {
        padding: 40,
    } as any,
    sideBarContent: {
        padding: 40,
        gap: 32,
    } as any,
    featureCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    featureMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    } as any,
    featureActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    } as any,
    activeDomainContainer: {
        padding: 24,
    },
    focusCard: {
        marginBottom: 48,
        backgroundColor: '#FFF',
        elevation: 8,
    },
    focusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    closeButton: {
        cursor: 'pointer',
        padding: 4,
    } as any,
    ritualSection: {
        marginTop: 40,
        paddingHorizontal: 24,
    },
    ritualGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        marginTop: 16,
    } as any,
    ritualCard: {
        flex: 1,
        minWidth: 320,
    } as any,
    historyScaffold: {
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 22,
    },
    historyScaffoldTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2E2924',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    historyScaffoldBody: {
        fontSize: 13,
        lineHeight: 20,
        color: '#6E594F',
    },
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
    },
});
