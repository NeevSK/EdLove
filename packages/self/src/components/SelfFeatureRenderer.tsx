import { FeatureErrorBoundary } from '@repo/self/components/FeatureErrorBoundary';
import { getFeatureDefinition } from '@repo/self/features/featureCatalog';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Box, Text } from '@repo/ui/primitives';
import React, { Suspense } from 'react';

export type SelfFeatureRendererProps = {
  componentId?: string;
  featureId: string;
  userId?: string;
  compact?: boolean;
};

// Lazy map — keeps initial bundle small, each feature code-split
const componentMap: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<SelfFeatureRendererProps>>
> = {
  JourneyTimeline: React.lazy(() =>
    import('@repo/self/components/TeachingHistoryTimeline').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  PulseDashboard: React.lazy(() =>
    import('@repo/self/components/PulseDashboard').then((m) => ({
      default: m.PulseDashboard as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  MoodLotus: React.lazy(() =>
    import('@repo/self/components/MoodLotus').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  WisdomSeeds: React.lazy(() =>
    import('@repo/self/components/WisdomSeeds').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  DailyRhythm: React.lazy(() =>
    import('@repo/self/components/DailyRhythm').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  StudentGoals: React.lazy(() =>
    import('@repo/self/components/StudentGoals').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  MyGradesView: React.lazy(() =>
    import('@repo/self/components/MyGradesView').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  SleepTracker: React.lazy(() =>
    import('@repo/self/components/SleepTracker').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  JoyJar: React.lazy(() =>
    import('@repo/self/components/JoyJar').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  GratitudeGlimmers: React.lazy(() =>
    import('@repo/self/components/GratitudeGlimmers').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  FireJournal: React.lazy(() =>
    import('@repo/self/components/FireJournal').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  VoiceJournaling: React.lazy(() =>
    import('@repo/self/components/VoiceJournaling').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  ReframeWizard: React.lazy(() =>
    import('@repo/self/components/ReframeWizard').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  TomorrowPrep: React.lazy(() =>
    import('@repo/self/components/TomorrowPrep').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  RemindersManager: React.lazy(() =>
    import('@repo/self/components/RemindersManager').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  DecisionJournalSection: React.lazy(() =>
    import('@repo/self/components/DecisionJournalSection').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  TeachingHistoryTimeline: React.lazy(() =>
    import('@repo/self/components/TeachingHistoryTimeline').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  ResonancePatternCard: React.lazy(() =>
    import('@repo/self/components/ResonancePatternCard').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  WarmMirrorCard: React.lazy(() =>
    import('@repo/self/components/WarmMirrorCard').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
  ProgressTree: React.lazy(() =>
    import('@repo/self/components/ProgressTree').then((m) => ({
      default: m.default as unknown as React.ComponentType<SelfFeatureRendererProps>,
    })),
  ),
};

function Fallback({ label }: { label: string }) {
  return (
    <Box className="py-6 items-center gap-2">
      <BrandPulse size={20} />
      <Text className="text-xs text-ink/50">Loading {label}…</Text>
    </Box>
  );
}

export function SelfFeatureRenderer({
  componentId,
  featureId,
  userId,
  compact,
}: SelfFeatureRendererProps) {
  const resolvedComponentId = componentId ?? getFeatureDefinition(featureId)?.componentId;
  const Lazy = resolvedComponentId ? componentMap[resolvedComponentId] : undefined;
  if (!Lazy) {
    return (
      <Box className="py-4 px-4 rounded-2xl bg-amber-50 border border-amber-200">
        <Text className="text-xs text-amber-800">
          Feature {featureId} ({resolvedComponentId ?? 'unknown'}) not yet mapped.
        </Text>
      </Box>
    );
  }
  return (
    <FeatureErrorBoundary featureName={featureId} featureId={featureId}>
      <Suspense fallback={<Fallback label={featureId} />}>
        <Lazy
          componentId={resolvedComponentId}
          featureId={featureId}
          userId={userId}
          compact={compact}
        />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
