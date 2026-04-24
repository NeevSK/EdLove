import React from 'react';
import { 
    VStack, 
    HStack, 
    Box, 
    Text, 
    ScrollView, 
    Pressable, 
    FeatureInfoIcon, 
    TemporalNavigator 
} from '@repo/ui';
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
    const surfaceBgClass = can('manage', 'StudentDashboard') ? 'bg-[#F5F3FF]' : 'bg-[#FFF7ED]';
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
        <Box className={`flex-1 flex-col h-full ${surfaceBgClass}`}>
            {/* Hub Header */}
            <Box className="p-10 pb-6 bg-white/40 border-b border-black/5 sanctuary-glass-hub">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 20, paddingRight: 40 }}
                >
                    {domains?.map((domain) => (
                        <Pressable
                            key={domain.id}
                            onPress={() => { 
                                setActiveCategoryId(domain.id);
                                setFocusedItemId(null);
                            }}
                            className={`min-w-[160px] px-6 py-4.5 rounded-3xl bg-white/60 border flex-row items-center gap-3 interactive ${
                                activeCategoryId === domain.id ? 'active border-transparent sanctuary-card bg-opacity-15' : 'border-white/30 sanctuary-card'
                            }`}
                            style={activeCategoryId === domain.id ? { 
                                backgroundColor: domain.accentColor + '15',
                                borderColor: domain.accentColor 
                            } : {}}
                        >
                            <Box className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: domain.accentColor }} />
                            <Text
                                className="text-[15px] font-bold tracking-tight"
                                style={{ color: activeCategoryId === domain.id ? domain.accentColor : 'var(--text-muted)' }}
                            >
                                {domain.title}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </Box>

            {/* Temporal Topbar */}
            <Box className="px-10 pt-6 gap-4">
                <TemporalNavigator />
                <Box className="flex-row justify-between items-center gap-4 flex-wrap">
                    <HStack className="gap-2.5 items-center">
                        <Pressable
                            onPress={() => setViewMode('spotlight')}
                            className={`px-4 py-2.5 rounded-full border ${
                                !isHistoryMode ? 'bg-[#DEF2E8] border-[#29A17D40]' : 'bg-[#FFF2F7D0] border-[#CCBAA833]'
                            }`}
                        >
                            <Text className={`text-[11px] font-bold uppercase tracking-wider ${
                                !isHistoryMode ? 'text-[#29A17D]' : 'text-[#6E594F]'
                            }`}>
                                Now
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setViewMode('timeline')}
                            className={`px-4 py-2.5 rounded-full border ${
                                isHistoryMode ? 'bg-[#DEF2E8] border-[#29A17D40]' : 'bg-[#FFF2F7D0] border-[#CCBAA833]'
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
                        <Box className="flex-row gap-2 items-center flex-wrap">
                            {TEMPORAL_SCALES.map((scale) => (
                                <Pressable
                                    key={scale}
                                    onPress={() => setScale(scale)}
                                    className={`px-3 py-1.5 rounded-full border ${
                                        viewScale === scale ? 'bg-[#EBE5FA] border-[#835CF630]' : 'bg-[#FFF2F7D0] border-[#CCBAA833]'
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
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box className="flex-1 flex-row">
                <ScrollView
                    className="flex-1 h-full"
                    contentContainerStyle={{ padding: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {focusedItemId && (
                        <Box className="mb-12 bg-white rounded-2xl p-7 shadow-sm sanctuary-card">
                            <Box className="flex-row justify-between mb-5">
                                <Text 
                                    className="text-xs font-extrabold tracking-[1.5px] uppercase opacity-80"
                                    style={{ color: activeDomain?.accentColor || '#000' }}
                                >
                                    {isHistoryMode ? 'Historical Context' : 'Focused Detail'}
                                </Text>
                                <Pressable onPress={() => setFocusedItemId(null)} className="p-1 cursor-pointer">
                                    <Text className="text-xl">✕</Text>
                                </Pressable>
                            </Box>
                            {renderFocusedFeature(focusedFeature)}
                        </Box>
                    )}

                    {!focusedItemId && Boolean(getActiveDomainContent()) && (
                        <Box className="p-6">{getActiveDomainContent()}</Box>
                    )}

                    {activeDomain?.features && !focusedItemId && !getActiveDomainContent() && (
                        <Box className="p-6">
                            <VStack className="gap-6">
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
                                            <Box
                                                key={feature.id}
                                                className="bg-white/60 rounded-3xl p-7 shadow-sm border-l-[6px] mb-6 sanctuary-card"
                                                style={{ borderLeftColor: feature.domainColor }}
                                            >
                                                <Box className="flex-row items-center justify-between mb-5">
                                                    <Box className="flex-row items-center gap-3 flex-1">
                                                        <Text className="text-2xl">
                                                            {FEATURE_EMOJIS[feature.id as keyof typeof FEATURE_EMOJIS] || '✨'}
                                                        </Text>
                                                        <VStack>
                                                            <Text
                                                                className="text-xs font-extrabold tracking-[1.5px] uppercase mb-0.5"
                                                                style={{ color: feature.domainColor }}
                                                            >
                                                                {feature.label}
                                                            </Text>
                                                        </VStack>
                                                        <FeatureInfoIcon
                                                            title={feature.label}
                                                            discoveryInfo={FEATURE_DISCOVERY_DATA[feature.id as keyof typeof FEATURE_DISCOVERY_DATA]}
                                                        />
                                                    </Box>

                                                    <Box className="flex-row items-center gap-3">
                                                        {hasHistory && (
                                                            <Pressable
                                                                onPress={() => {
                                                                    setViewMode('timeline');
                                                                    setFocusedItemId(feature.id);
                                                                }}
                                                                className="p-1 mr-2 opacity-70"
                                                            >
                                                                <Text className="text-base">⏳</Text>
                                                            </Pressable>
                                                        )}
                                                        <Pressable onPress={() => togglePin(feature.id)} className="p-1">
                                                            <Text
                                                                className={`text-base ${isPinned ? '' : 'text-black/10'}`}
                                                                style={isPinned ? { color: feature.domainColor } : {}}
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
                                                            <Text className="text-[11px] text-black/20 font-bold uppercase">
                                                                {isHistoryMode ? 'OPEN HISTORY' : 'EXPAND'}
                                                            </Text>
                                                        </Pressable>
                                                    </Box>
                                                </Box>
                                                {feature.content}
                                            </Box>
                                        );
                                    })}
                            </VStack>
                        </Box>
                    )}

                    {(morningRitual || voiceJournal || nightRitual) && !focusedItemId && (
                        <Box className="mt-10 px-6">
                            <Text className="text-xs font-extrabold tracking-[1.5px] uppercase mb-6 opacity-80">Daily Rituals</Text>
                            <Box className="flex-row flex-wrap gap-6 mt-4">
                                {voiceJournal && <Box className="flex-1 min-w-[320px]">{voiceJournal}</Box>}
                                {morningRitual && <Box className="flex-1 min-w-[320px]">{morningRitual}</Box>}
                                {nightRitual && <Box className="flex-1 min-w-[320px]">{nightRitual}</Box>}
                            </Box>
                        </Box>
                    )}
                </ScrollView>

                {/* Sidebar Column */}
                <Box className="w-[380px] h-full border-l border-black/5 bg-white/15 sanctuary-sidebar-glass">
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 40, gap: 32 }}>
                        <Text className="text-xs font-extrabold tracking-[1.5px] uppercase mb-6 opacity-80">Mirrors & Ripples</Text>
                        {sideBar}
                        {reminders}
                    </ScrollView>
                </Box>
            </Box>
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
            className="border rounded-3xl px-5 py-5.5"
            style={{ 
                borderColor: feature.domainColor || '#8B5CF6', 
                backgroundColor: 'rgba(255,252,247,0.84)' 
            }}
        >
            <Text className="text-sm font-extrabold text-[#2E2924] mb-2.5 uppercase tracking-wider">
                {feature.label} history scaffold
            </Text>
            <Text className="text-[13px] leading-5 text-[#6E594F]">
                {`This feature can now live inside the temporal shell. A dedicated ${viewScale} history renderer can be added without changing BaseSelf again.`}
            </Text>
        </Box>
    );
}
