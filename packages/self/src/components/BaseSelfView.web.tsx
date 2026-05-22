import { usePermissions, useTemporalStore } from '@repo/core/logic';
import FeatureInfoIcon from '@repo/ui/components/FeatureInfoIcon';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';
import { TemporalNavigator } from '@repo/ui/components/TemporalNavigator';
import { Box, HStack, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { useEffect, useMemo, useState } from 'react';

import {
  FEATURE_DISCOVERY_DATA,
  FEATURE_EMOJIS,
  SANCTUARY_DOMAINS,
} from '../constants/selfRegistry';
import { useFeatureActivity } from '../hooks/useFeatureActivity';
import type { BaseSelfViewProps, SelfViewFeature } from './BaseSelfView.types';
import { FeatureErrorBoundary } from './FeatureErrorBoundary';

/**
 * BaseSelfView.web - Capability-Driven Sanctuary for Web.
 * Optimized for 2026: URL Resonance, Energy Sensing, and Fault Tolerance.
 */
export function BaseSelfView({ perspective, domains, sideBar, reminders }: BaseSelfViewProps) {
  const { context } = usePermissions();
  const isAnonymous = context.isAnonymous;

  const { viewMode, setViewMode, viewScale } = useTemporalStore();
  const isHistoryMode = viewMode === 'timeline';

  const allFeatures = useMemo(
    () => [
      ...domains.flatMap((domain) =>
        (domain.features || []).map((feature) => ({
          ...feature,
          domainId: domain.id,
          domainColor: domain.accentColor,
          energyVibe: SANCTUARY_DOMAINS[domain.id]?.energyVibe,
        })),
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
              energyVibe: ['#F5F3FF', '#EDE9FE'] as [string, string],
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
              energyVibe: ['#FFFBEB', '#FEF3C7'] as [string, string],
            },
          ]
        : []),
    ],
    [domains, sideBar, reminders],
  );

  const { getPinnedFeatures, togglePin, trackFeatureAccess } = useFeatureActivity();
  const pinned = getPinnedFeatures();

  const [focusedItemId, setFocusedItemId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.location.hash.replace('#', '') || null;
  });

  // URL Resonance: Sync focused feature with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      setFocusedItemId(newHash || null);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateFocusedId = (id: string | null) => {
    setFocusedItemId(id);
    window.location.hash = id || '';
    if (id) trackFeatureAccess(id);
  };

  const focusedFeature = useMemo(
    () => allFeatures.find((f) => f.id === focusedItemId) || null,
    [allFeatures, focusedItemId],
  );

  // Energy Sensing: Derive background from focused domain or perspective
  const backgroundStyle = useMemo(() => {
    const baseVibe = perspective === 'student' ? ['#F5F3FF', '#FAF5FF'] : ['#FFF7ED', '#FFFAF5'];
    const activeVibe = focusedFeature?.energyVibe || baseVibe;
    return {
      backgroundColor: activeVibe[0],
      transition: 'background 0.8s ease-in-out',
    };
  }, [focusedFeature, perspective]);

  const renderFocusedFeature = (feature: SelfViewFeature | null) => {
    if (!feature) return null;

    const content = isHistoryMode
      ? (feature.historyContent ?? <HistoryScaffold feature={feature} viewScale={viewScale} />)
      : feature.content;

    return <FeatureErrorBoundary featureName={feature.label}>{content}</FeatureErrorBoundary>;
  };

  return (
    <Box className="flex-1 flex-col h-full overflow-hidden" style={backgroundStyle}>
      {/* Temporal Control Bar */}
      <Box className="px-10 py-6 bg-white/30 backdrop-blur-md border-b border-black/5 sanctuary-glass-hub sticky top-0 z-30">
        <HStack className="justify-between items-center gap-6">
          <VStack>
            <Text className="text-2xl font-black tracking-tight text-[#1A1610]">Sadhana</Text>
            <Text className="text-xs font-bold text-black/40 uppercase tracking-widest">
              {isHistoryMode ? `History Hub / ${viewScale}` : `${perspective.toUpperCase()} Hub`}
            </Text>
          </VStack>

          <HStack className="gap-4 items-center">
            <TemporalNavigator />
            <Box className="h-8 w-px bg-black/5 mx-2" />
            <HStack className="gap-2.5 items-center">
              <Pressable
                onPress={() => {
                  setViewMode('spotlight');
                  updateFocusedId(null);
                }}
                accessibilityRole="button"
                className={`px-5 py-2.5 rounded-full border transition-all ${
                  !isHistoryMode
                    ? 'bg-white border-black/10 shadow-sm'
                    : 'bg-transparent border-transparent opacity-40'
                }`}
              >
                <Text className="text-[11px] font-black uppercase tracking-widest text-[#1A1610]">
                  Now
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewMode('timeline')}
                accessibilityRole="button"
                className={`px-5 py-2.5 rounded-full border transition-all ${
                  isHistoryMode
                    ? 'bg-white border-black/10 shadow-sm'
                    : 'bg-transparent border-transparent opacity-40'
                }`}
              >
                <Text className="text-[11px] font-black uppercase tracking-widest text-[#1A1610]">
                  History
                </Text>
              </Pressable>
            </HStack>
          </HStack>
        </HStack>
      </Box>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {focusedItemId ? (
          <Box className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Pressable
              onPress={() => updateFocusedId(null)}
              accessibilityRole="button"
              className="flex-row items-center gap-2 mb-8 group opacity-60 hover:opacity-100 transition-all"
            >
              <Text className="text-xl group-hover:-translate-x-1 transition-transform">←</Text>
              <Text className="text-xs font-black uppercase tracking-widest">
                Back to Sanctuary
              </Text>
            </Pressable>

            <SanctuaryCard
              className="p-10 border-l-[8px] sanctuary-glass-card shadow-2xl"
              style={{ borderLeftColor: focusedFeature?.domainColor ?? '#8B5CF6' }}
            >
              <HStack className="justify-between items-start mb-8">
                <HStack className="items-center gap-4">
                  <Text className="text-4xl">
                    {FEATURE_EMOJIS[focusedFeature?.id as keyof typeof FEATURE_EMOJIS] || '✨'}
                  </Text>
                  <VStack>
                    <Text className="text-2xl font-black tracking-tight">
                      {focusedFeature?.label}
                    </Text>
                    <Text className="text-xs font-bold text-black/40 uppercase tracking-widest">
                      Capability View
                    </Text>
                  </VStack>
                </HStack>
                <HStack className="gap-3">
                  <FeatureInfoIcon
                    title={focusedFeature?.label ?? 'Capability'}
                    discoveryInfo={
                      FEATURE_DISCOVERY_DATA[
                        focusedFeature?.id as keyof typeof FEATURE_DISCOVERY_DATA
                      ]
                    }
                    color={focusedFeature?.domainColor}
                  />
                  <Pressable
                    onPress={() => togglePin(focusedFeature?.id || '')}
                    accessibilityRole="button"
                    className="p-2 bg-black/5 rounded-full"
                  >
                    <Text>{pinned.includes(focusedFeature?.id || '') ? '📌' : '📍'}</Text>
                  </Pressable>
                </HStack>
              </HStack>
              <Box className="min-h-[500px]">{renderFocusedFeature(focusedFeature)}</Box>
            </SanctuaryCard>
          </Box>
        ) : (
          <VStack className="gap-16 max-w-[1400px] mx-auto w-full">
            {domains.map((domain) => (
              <VStack key={domain.id} className="gap-8">
                <HStack className="items-center gap-4">
                  <Box
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: domain.accentColor }}
                  />
                  <Text className="text-xl font-black tracking-tight text-[#1A1610]">
                    {domain.title}
                  </Text>
                </HStack>
                {domain.content && (
                  <Box className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {domain.content}
                  </Box>
                )}

                <Box className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {domain.features?.map((feature) => (
                    <SanctuaryCard
                      key={feature.id}
                      onPress={() => updateFocusedId(feature.id)}
                      className="hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 border-l-[4px] sanctuary-glass-card"
                      style={{ borderLeftColor: domain.accentColor }}
                    >
                      <HStack className="justify-between items-start mb-4">
                        <Text className="text-3xl">
                          {FEATURE_EMOJIS[feature.id as keyof typeof FEATURE_EMOJIS] || '✨'}
                        </Text>
                        {pinned.includes(feature.id) && <Text className="text-xs">📌</Text>}
                      </HStack>
                      <Text className="text-sm font-black uppercase tracking-wider mb-1">
                        {feature.label}
                      </Text>
                      <Text className="text-xs text-black/50 leading-relaxed line-clamp-2">
                        Engage with this sanctuary capability.
                      </Text>
                    </SanctuaryCard>
                  ))}
                </Box>
              </VStack>
            ))}

            {isAnonymous && (
              <Box className="mt-20 py-20 border-t border-black/5 flex items-center justify-center">
                <Box className="max-w-2xl w-full">
                  <PositiveInvitation context="self" onAction={() => {}} />
                </Box>
              </Box>
            )}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}

function HistoryScaffold({ feature, viewScale }: { feature: SelfViewFeature; viewScale: string }) {
  return (
    <Box
      className="border rounded-3xl px-8 py-8 bg-white/20"
      style={{ borderColor: feature.domainColor || '#8B5CF6' }}
    >
      <Text className="text-lg font-black mb-4 uppercase tracking-widest">
        {feature.label} history
      </Text>
      <Text className="text-sm leading-7 text-black/60">
        {`Viewing the ${viewScale} perspective. Analytics will surface as data builds.`}
      </Text>
    </Box>
  );
}
