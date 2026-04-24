import React from 'react';
import { 
    VStack, 
    GlobalHeader, 
    FeatureInfoIcon, 
    HStack, 
    TemporalNavigator, 
    Box, 
    Text, 
    ScrollView, 
    Pressable 
} from '@repo/ui';
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
    const surfaceBgClass = perspective === 'student' ? 'bg-[#F5F3FF]' : 'bg-[#FFF7ED]';
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
        <VStack className={`flex-1 ${surfaceBgClass}`}>
            <GlobalHeader isSelfView={true} subtitle={perspective.toUpperCase()} title="Sadhana" />

            <TemporalNavigator />

            <TemporalShellControls
                isHistoryMode={isHistoryMode}
                viewScale={viewScale}
                onModeChange={setViewMode}
                onScaleChange={setScale}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {voiceJournal && <Box className="px-lg pt-sm">{voiceJournal}</Box>}
                {morningRitual && <Box className="px-lg pt-sm">{morningRitual}</Box>}

                <Box className="py-md bg-transparent">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
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
                                    className="items-center w-[72px]"
                                >
                                    <Box
                                        className={`w-16 h-16 rounded-full p-[3px] justify-center items-center mb-1 border-2 ${
                                            isActive ? '' : 'border-black/5'
                                        }`}
                                        style={isActive ? { borderColor: feature.domainColor } : { borderStyle: isInsight ? 'dashed' : 'solid' }}
                                    >
                                        <Box
                                            className="w-full h-full rounded-[30px] bg-white justify-center items-center shadow-sm"
                                            style={isActive ? { shadowColor: feature.domainColor, shadowOpacity: 0.3 } : { shadowOpacity: 0.05 }}
                                        >
                                            <Text className="text-2xl">{getEmoji(feature)}</Text>
                                            {isPinned && (
                                                <Box
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full justify-center items-center border-2 border-white shadow-sm"
                                                    style={{ backgroundColor: feature.domainColor }}
                                                >
                                                    <Text className="text-[10px] text-white">📌</Text>
                                                </Box>
                                            )}
                                            {hasHistory && (
                                                <Box className="absolute -bottom-1.5 -right-0.5 w-[18px] h-[18px] rounded-full justify-center items-center bg-[#EBE5FA] border border-white">
                                                    <Text className="text-[8px] text-[#5B3FD6]">⏳</Text>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    <Box
                                        className={`w-1 h-1 rounded-full mb-1 ${isActive ? '' : 'bg-transparent'}`}
                                        style={isActive ? { backgroundColor: feature.domainColor } : {}}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        className={`text-[9px] text-center uppercase tracking-wider font-bold ${
                                            isActive ? 'text-black' : 'text-black/40'
                                        }`}
                                    >
                                        {feature.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </Box>

                <Box className="px-md pt-md min-h-[400px]">
                    {activeFeature && (
                        <VStack className="mb-4">
                            <HStack className="justify-between items-center mb-3">
                                <HStack className="items-center flex-1 gap-1">
                                    <Text className="text-lg font-extrabold text-[#1A1610] tracking-tighter">
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
                                            className="p-1 ml-1"
                                        >
                                            <Text className="text-lg">⏳</Text>
                                        </Pressable>
                                    )}
                                </HStack>
                                <Text className="text-[10px] text-black/35 font-bold tracking-widest uppercase">
                                    {isHistoryMode ? `${viewScale.toUpperCase()} VIEW` : 'PRESENT FOCUS'}
                                </Text>
                            </HStack>
                            {renderFeatureContent(activeFeature)}
                        </VStack>
                    )}
                </Box>

                {nightRitual && <Box className="px-lg pt-sm">{nightRitual}</Box>}
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
        <Box className="px-lg pt-sm pb-sm gap-2">
            <HStack className="gap-2 items-center">
                <Pressable
                    onPress={() => onModeChange('spotlight')}
                    className={`px-3.5 py-2 rounded-full border ${
                        !isHistoryMode ? 'bg-[#DEF2E8] border-[#29A17D40]' : 'bg-white/60 border-black/10'
                    }`}
                >
                    <Text className={`text-[11px] font-bold uppercase tracking-wider ${
                        !isHistoryMode ? 'text-[#29A17D]' : 'text-[#6E594F]'
                    }`}>
                        Now
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => onModeChange('timeline')}
                    className={`px-3.5 py-2 rounded-full border ${
                        isHistoryMode ? 'bg-[#EBE5FA] border-[#835CF630]' : 'bg-white/60 border-black/10'
                    }`}
                >
                    <Text className={`text-[11px] font-bold uppercase tracking-wider ${
                        isHistoryMode ? 'text-[#29A17D]' : 'text-[#6E594F]'
                    }`}>
                        History
                    </Text>
                </Pressable>
            </HStack>
            {isHistoryMode && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
                    {TEMPORAL_SCALES.map((scale) => (
                        <Pressable
                            key={scale}
                            onPress={() => onScaleChange(scale)}
                            className={`px-3 py-1.5 rounded-full border ${
                                viewScale === scale ? 'bg-[#EBE5FA] border-[#835CF630]' : 'bg-white/60 border-black/10'
                            }`}
                        >
                            <Text
                                className={`text-[10px] font-extrabold tracking-wider ${
                                    viewScale === scale ? 'text-[#5B3FD6]' : 'text-[#6E594F]'
                                }`}
                            >
                                {scale.toUpperCase()}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
        </Box>
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
        <Box
            className="border rounded-[20px] px-[18px] py-5"
            style={{ 
                borderColor: feature.domainColor || '#8B5CF6', 
                backgroundColor: 'rgba(255,255,255,0.72)' 
            }}
        >
            <Text className="text-sm font-extrabold text-[#2E2924] mb-2 uppercase tracking-wider">
                {feature.label} history scaffold
            </Text>
            <Text className="text-[13px] leading-5 text-[#6E594F]">
                {`The shell is ready to show ${viewScale}-range history here once this feature exposes its temporal view.`}
            </Text>
        </Box>
    );
}
