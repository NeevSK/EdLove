import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { VStack, GlobalHeader, FeatureInfoIcon, HStack, TemporalNavigator } from '@repo/ui';
import { useTemporalStore, type TemporalScale } from '@repo/core';
import { BaseSelfViewProps, SelfViewFeature } from './BaseSelfView.types';
import { FEATURE_DISCOVERY_DATA, FEATURE_EMOJIS } from '../constants/selfRegistry';
import { useFeatureActivity } from '../hooks/useFeatureActivity';
import { useDynamicSelfFeatures } from '../hooks/useDynamicSelfFeatures';

const TEMPORAL_SCALES = ['day', 'week', 'month', 'year'] as const;

/**
 * BaseSelfView - The architectural kernel for GuruDevi Self sections on Mobile.
 * Present-focused by default, with a shell-owned temporal layer that can surface
 * feature history when a domain or feature opts in.
 */
export function BaseSelfView({
    perspective,
    domains,
    sideBar,
    reminders,
    morningRitual,
    nightRitual,
    voiceJournal,
}: BaseSelfViewProps) {
    const surfaceBg = perspective === 'student' ? '#F5F3FF' : '#FFF7ED';
    const { viewMode, setViewMode, viewScale, setScale } = useTemporalStore();
    const isHistoryMode = viewMode === 'timeline';

    const allFeatures = React.useMemo(
        () => [
            ...domains.flatMap((domain) =>
                (domain.features || []).map((feature) => ({
                    ...feature,
                    domainId: domain.id,
                    domainColor: domain.accentColor,
                }))
            ),
            ...(domains.some((domain) => domain.content)
                ? [
                      {
                          id: 'holistic_history',
                          label: 'Journey',
                          content: domains.find((domain) => domain.content)?.content,
                          historyContent:
                              domains.find((domain) => domain.historyContent)?.historyContent ??
                              domains.find((domain) => domain.content)?.content,
                          domainId: 'journey',
                          domainColor: '#8B5CF6',
                          supportedScales: [...TEMPORAL_SCALES] as TemporalScale[],
                      },
                  ]
                : []),
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

    const [activeFeatureId, setActiveFeatureId] = React.useState(
        sortedFeatures.find((f) => f.id === 'energy_pulse' || f.id === 'mood_checkin')?.id || sortedFeatures[0]?.id
    );

    React.useEffect(() => {
        if (!sortedFeatures.length) return;
        const hasActiveFeature = sortedFeatures.some((feature) => feature.id === activeFeatureId);
        if (!hasActiveFeature) {
            setActiveFeatureId(sortedFeatures[0]?.id);
        }
    }, [sortedFeatures, activeFeatureId]);

    const activeFeature = sortedFeatures.find((f) => f.id === activeFeatureId) || sortedFeatures[0];

    const getEmoji = (feature: SelfViewFeature) =>
        FEATURE_EMOJIS[feature.id as keyof typeof FEATURE_EMOJIS] || '\u2728';

    const handleFeaturePress = (featureId: string) => {
        setActiveFeatureId(featureId);
        trackFeatureAccess(featureId);
    };

    const renderFeatureContent = (feature?: SelfViewFeature & { domainColor?: string }) => {
        if (!feature) return null;
        if (!isHistoryMode) return feature.content;
        return feature.historyContent ?? <HistoryScaffold feature={feature} viewScale={viewScale} />;
    };

    return (
        <VStack style={[nativeStyles.container, { backgroundColor: surfaceBg }]}>
            <GlobalHeader isSelfView={true} subtitle={perspective.toUpperCase()} title="Sadhana" />

            <TemporalNavigator />

            <TemporalShellControls
                isHistoryMode={isHistoryMode}
                viewScale={viewScale}
                onModeChange={setViewMode}
                onScaleChange={setScale}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {voiceJournal && <View style={nativeStyles.ritualWrapper}>{voiceJournal}</View>}
                {morningRitual && <View style={nativeStyles.ritualWrapper}>{morningRitual}</View>}

                <View style={nativeStyles.carouselContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={nativeStyles.carouselContent}
                    >
                        {sortedFeatures.map((feature) => {
                            const isActive = activeFeatureId === feature.id;
                            const isPinned = pinned.includes(feature.id);
                            const isInsight = feature.id === 'mirrors' || feature.id === 'reminders';
                            const hasHistory = Boolean(feature.historyContent);

                            return (
                                <Pressable
                                    key={feature.id}
                                    onPress={() => handleFeaturePress(feature.id)}
                                    onLongPress={() => togglePin(feature.id)}
                                    style={nativeStyles.circleItem}
                                >
                                    <View
                                        style={[
                                            nativeStyles.circleRing,
                                            {
                                                borderColor: isActive ? feature.domainColor : 'rgba(0,0,0,0.05)',
                                                borderWidth: 2,
                                                borderStyle: isInsight && !isActive ? 'dashed' : 'solid',
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                nativeStyles.circle,
                                                {
                                                    backgroundColor: 'white',
                                                    shadowColor: feature.domainColor,
                                                    shadowOpacity: isActive ? 0.3 : 0.05,
                                                },
                                            ]}
                                        >
                                            <Text style={nativeStyles.circleIcon}>{getEmoji(feature)}</Text>
                                            {isPinned && (
                                                <View
                                                    style={[
                                                        nativeStyles.pinIndicator,
                                                        { backgroundColor: feature.domainColor },
                                                    ]}
                                                >
                                                    <Text style={{ fontSize: 10, color: 'white' }}>\uD83D\uDCCC</Text>
                                                </View>
                                            )}
                                            {hasHistory && (
                                                <View style={nativeStyles.historyDot}>
                                                    <Text style={nativeStyles.historyDotText}>\u23F3</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            nativeStyles.activeIndicator,
                                            { backgroundColor: isActive ? feature.domainColor : 'transparent' },
                                        ]}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            nativeStyles.circleLabel,
                                            {
                                                color: isActive ? '#000' : 'rgba(0,0,0,0.4)',
                                                fontWeight: isActive ? '800' : '600',
                                            },
                                        ]}
                                    >
                                        {feature.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={nativeStyles.activeFeatureContainer}>
                    {activeFeature && (
                        <VStack style={{ marginBottom: 16 }}>
                            <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <HStack style={{ alignItems: 'center', flex: 1 }}>
                                    <Text style={nativeStyles.activeLabel}>
                                        {activeFeature.label}
                                        {isHistoryMode ? ' History' : ''}
                                    </Text>
                                    <FeatureInfoIcon
                                        title={activeFeature.label}
                                        discoveryInfo={FEATURE_DISCOVERY_DATA[activeFeature.id as keyof typeof FEATURE_DISCOVERY_DATA]}
                                        color={activeFeature.domainColor}
                                    />
                                    {activeFeature.id !== 'holistic_history' && (
                                        <Pressable
                                            onPress={() => {
                                                setViewMode('timeline');
                                                handleFeaturePress('holistic_history');
                                            }}
                                            style={{ padding: 4, marginLeft: 4 }}
                                        >
                                            <Text style={{ fontSize: 16 }}>\u23F3</Text>
                                        </Pressable>
                                    )}
                                </HStack>
                                <Text style={nativeStyles.modeBadge}>
                                    {isHistoryMode ? `${viewScale.toUpperCase()} VIEW` : 'PRESENT FOCUS'}
                                </Text>
                            </HStack>
                            {renderFeatureContent(activeFeature)}
                        </VStack>
                    )}
                </View>

                {nightRitual && <View style={nativeStyles.ritualWrapper}>{nightRitual}</View>}
            </ScrollView>
        </VStack>
    );
}

function TemporalShellControls({
    isHistoryMode,
    viewScale,
    onModeChange,
    onScaleChange,
}: {
    isHistoryMode: boolean;
    viewScale: string;
    onModeChange: (mode: 'spotlight' | 'timeline') => void;
    onScaleChange: (scale: any) => void;
}) {
    return (
        <View style={nativeStyles.temporalControls}>
            <HStack style={nativeStyles.modeRow}>
                <Pressable
                    onPress={() => onModeChange('spotlight')}
                    style={[nativeStyles.modeChip, !isHistoryMode && nativeStyles.modeChipActive]}
                >
                    <Text style={[nativeStyles.modeChipText, !isHistoryMode && nativeStyles.modeChipTextActive]}>
                        Now
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => onModeChange('timeline')}
                    style={[nativeStyles.modeChip, isHistoryMode && nativeStyles.modeChipActive]}
                >
                    <Text style={[nativeStyles.modeChipText, isHistoryMode && nativeStyles.modeChipTextActive]}>
                        History
                    </Text>
                </Pressable>
            </HStack>
            {isHistoryMode && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={nativeStyles.scaleRow}>
                    {TEMPORAL_SCALES.map((scale) => (
                        <Pressable
                            key={scale}
                            onPress={() => onScaleChange(scale)}
                            style={[nativeStyles.scaleChip, viewScale === scale && nativeStyles.scaleChipActive]}
                        >
                            <Text
                                style={[
                                    nativeStyles.scaleChipText,
                                    viewScale === scale && nativeStyles.scaleChipTextActive,
                                ]}
                            >
                                {scale.toUpperCase()}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
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
                nativeStyles.historyScaffold,
                { borderColor: feature.domainColor || '#8B5CF6', backgroundColor: 'rgba(255,255,255,0.72)' },
            ]}
        >
            <Text style={nativeStyles.historyScaffoldTitle}>{feature.label} history scaffold</Text>
            <Text style={nativeStyles.historyScaffoldBody}>
                {`The shell is ready to show ${viewScale}-range history here once this feature exposes its temporal view.`}
            </Text>
        </View>
    );
}

const nativeStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    ritualWrapper: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    temporalControls: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
        gap: 8,
    },
    modeRow: {
        gap: 8,
        alignItems: 'center',
    },
    modeChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.58)',
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
        gap: 8,
        paddingRight: 20,
    },
    scaleChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.58)',
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
    carouselContainer: {
        paddingVertical: 16,
        backgroundColor: 'transparent',
    },
    carouselContent: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        gap: 12,
    },
    circleItem: {
        alignItems: 'center',
        width: 72,
    },
    circleRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    circle: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    circleIcon: {
        fontSize: 24,
    },
    pinIndicator: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    historyDot: {
        position: 'absolute',
        bottom: -6,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EBE5FA',
        borderWidth: 1,
        borderColor: 'white',
    },
    historyDotText: {
        fontSize: 8,
        color: '#5B3FD6',
    },
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginBottom: 4,
    },
    circleLabel: {
        fontSize: 9,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    activeFeatureContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        minHeight: 400,
    },
    activeLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1610',
        letterSpacing: -0.5,
        marginRight: 8,
    },
    modeBadge: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.35)',
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    historyScaffold: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 20,
    },
    historyScaffoldTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2E2924',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    historyScaffoldBody: {
        fontSize: 13,
        lineHeight: 20,
        color: '#6E594F',
    },
});
