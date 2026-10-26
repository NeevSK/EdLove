import { useStore } from '@repo/core/logic';
import { SanctuaryGuard } from '@repo/ui';
import {
  CaptureEngine,
  getAvailablePerspectives as getEnginePerspectives,
  KnowledgeParser,
} from '@repo/graphics/algorithms';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import {
  AstroView,
  DharmaView,
  JyotiView,
  TerraView,
  VastuView,
  VatyaView,
} from '@repo/ui/components/visualization';
import { useVisualCapabilities } from '@repo/ui/context';
import { useResponsive } from '@repo/ui/hooks';
import { ChartColumn, FileCheck, Globe, Network, Orbit, Route, Wind, X } from '@repo/ui/icons';
import {
  Box,
  HStack,
  Pressable,
  Icon as SanctuaryIcon,
  ScrollView,
  Text,
  useTheme,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { safeBack } from '@repo/ui/utils/navigation';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { libraryAPI } from '@repo/library/api/library';
import { usePerspectiveLayout } from '@repo/library/hooks/usePerspectiveLayout';
import type { KnowledgeNode, KnowledgeTopology } from '@repo/library/types/Library';

const StyledBlurView = styled(BlurView as React.ComponentType<any>);

function AdaptiveBlurView({
  children,
  className,
  intensity,
  tint,
}: React.PropsWithChildren<{ className?: string; intensity: number; tint: 'dark' | 'light' }>) {
  const { allowBlur } = useVisualCapabilities();
  if (!allowBlur) return <Box className={className}>{children}</Box>;
  return (
    <StyledBlurView className={className} intensity={intensity} tint={tint}>
      {children}
    </StyledBlurView>
  );
}
type PerspectiveId = 'astro' | 'terra' | 'dharma' | 'vastu' | 'jyoti' | 'vatya';
interface Perspective {
  id: PerspectiveId;
  label: string;
  icon: any;
  description: string;
  disabled?: boolean;
}
// --- Perspective Metadata (Stabilized outside component or memoized) ---
const PERSPECTIVES: Perspective[] = [
  {
    id: 'astro',
    label: 'Cosmos',
    icon: Orbit,
    description: 'Interconnected topology of wisdom',
  },
  {
    id: 'terra',
    label: 'Geo',
    icon: Globe,
    description: 'Geographical maps of knowledge',
  },
  {
    id: 'dharma',
    label: 'Path',
    icon: Route,
    description: 'Sequential learning pathways',
  },
  {
    id: 'vastu',
    label: 'Structure',
    icon: Network,
    description: 'Mind maps & hierarchies',
  },
  {
    id: 'jyoti',
    label: 'Insight',
    icon: ChartColumn,
    description: 'Analytic charts & metrics',
  },
  {
    id: 'vatya',
    label: 'Vatya',
    icon: Wind,
    description: 'Dynamic flow of knowledge',
  },
];
export default function MapScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width, height } = useResponsive();
  const showToast = useStore((state) => state.showToast);
  const { deviceTier } = useVisualCapabilities();
  const isOnline = useStore((state) => state.isOnline);
  const [activePerspective, setActivePerspective] = useState<PerspectiveId>('astro');
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KnowledgeTopology | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  // Zoom and Pan state for layout reference (though views handle their own state)
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
      try {
        const topology = await libraryAPI.getMapTopology();
        setData(topology);
      } catch (err) {
        console.error('Failed to fetch map topology:', err);
        setLoadError('The knowledge map is unavailable right now.');
      } finally {
        setLoading(false);
      }
  }, []);
  useEffect(() => {
    void fetchData();
  }, [fetchData]);
  const availablePerspectives = useMemo(() => {
    if (!data) return PERSPECTIVES;
    const engineIds = getEnginePerspectives(data);
    const isDeviceConstrained = deviceTier === 'low' || !isOnline;
    return PERSPECTIVES.map((p) => {
      let isDisabled = !engineIds.includes(p.id);
      // Throttle heavy 'vatya' perspective on constrained devices
      if (p.id === 'vatya' && isDeviceConstrained) {
        isDisabled = true;
      }
      return { ...p, disabled: isDisabled };
    });
  }, [data, deviceTier, isOnline]);
  const activeData = useMemo(() => {
    if (activePerspective === 'astro' && !data?.nodes?.length) {
      return KnowledgeParser.fromMermaid(`
                graph TD
                A[Retina Engine] --> B[Astro View]
                A --> C[Vastu View]
                A --> D[Terra View]
                B --> E[High Performance]
                C --> F[Hierarchical]
                D --> G[Geographical]
            `);
    }
    return data;
  }, [data, activePerspective]);
  // --- State Excellence: Memoized Layout ---
  const layout = usePerspectiveLayout(activeData as any, {
    width: width * 3,
    height: height * 3,
    perspective: activePerspective,
  });
  const handleExport = React.useCallback(async () => {
    setIsExporting(true);
    try {
      const snapshot = CaptureEngine.prepareForCapture(activeData as any);
      console.log('--- NATIVE VISUALIZATION CAPTURED ---');
      console.log('Snapshot Nodes:', snapshot.nodes.length);
      showToast('Visualization logic captured for the Student Report.', 'success');
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [activeData, showToast]);
  const handleNodePress = React.useCallback(
    (node: KnowledgeNode) => {
      setSelectedNode(node);
      const pos = layout?.positions.get(node.id);
      if (pos) {
        translateX.value = withSpring(width / 2 - pos.x);
        translateY.value = withSpring(height / 2.5 - pos.y);
        scale.value = withSpring(2);
      }
    },
    [layout, width, height, translateX, translateY, scale],
  );
  const visualizationContent = useMemo(() => {
    if (loading) {
      return (
        <Box className="flex-1 justify-center items-center">
          <BrandPulse size={40} tintColor={theme.accent.action} accessibilityLabel="Loading knowledge map" />
        </Box>
      );
    }
    if (activePerspective === 'astro' && data && layout) {
      return (
        <AstroView
          data={data as any}
          layout={layout}
          onNodePress={handleNodePress as any}
          selectedNode={selectedNode as any}
          width={width}
          height={height}
        />
      );
    }
    if (activePerspective === 'jyoti' && data) {
      return <JyotiView data={data as any} layout={layout!} width={width} height={height} />;
    }
    if (activePerspective === 'terra' && data) {
      return <TerraView data={data as any} layout={layout!} width={width} height={height} />;
    }
    if (activePerspective === 'dharma' && data) {
      return <DharmaView data={data as any} layout={layout!} width={width} height={height} />;
    }
    if (activePerspective === 'vastu' && data && layout) {
      return (
        <VastuView
          data={data as any}
          layout={layout}
          onNodePress={handleNodePress as any}
          selectedNode={selectedNode as any}
          width={width}
          height={height}
        />
      );
    }
    if (activePerspective === 'vatya' && data && layout) {
      return <VatyaView data={data as any} layout={layout} width={width} height={height} />;
    }
    if (loadError) {
      return (
        <BrandedErrorState
          title={!isOnline ? 'You are offline' : 'Map unavailable'}
          message={!isOnline ? 'Reconnect to explore the knowledge map.' : loadError}
        >
          <Pressable accessibilityRole="button" accessibilityLabel="Retry loading knowledge map" onPress={() => void fetchData()}>
            <Text className="font-bold text-phaseText-primary">Retry</Text>
          </Pressable>
        </BrandedErrorState>
      );
    }
    return (
      <Box className="flex-1 justify-center items-center">
        <BrandedEmptyState title="No map view yet" message="Choose another perspective to continue exploring." />
      </Box>
    );
  }, [loading, activePerspective, data, layout, handleNodePress, selectedNode, width, height]);
  const accentColor = theme.accent.action;
  return (
    <ScreenWrapper scroll={false}>
      <GlobalHeader
        title="Knowledge Cosmos"
        subtitle="Isomorphic Visualization Engine"
        showBack
        onBack={() => safeBack('/library')}
        rightAction={
          <SanctuaryGuard
            action="export"
            subject="LibraryMap"
            requirement={{ citizenshipRequired: 2, entitlementTier: 'PRO' }}
          >
            <Pressable
              onPress={() => {
                void handleExport();
              }}
              disabled={isExporting}
              className="flex-row items-center px-4 py-2 rounded-xl mr-3"
              style={({ pressed }) => ({
                backgroundColor: `${accentColor}20`,
                opacity: isExporting || pressed ? 0.5 : 1,
              })}
            >
              <FileCheck size={20} className="text-phase-accent mr-2" />
              <Text className="text-sm font-semibold text-phase-accent">
                {isExporting ? 'Exporting...' : 'Export Map'}
              </Text>
            </Pressable>
          </SanctuaryGuard>
        }
      />

      <Box className="p-3 bg-phase-surface">
        <Box className="rounded-[20px] overflow-hidden border border-phase-border">
          <AdaptiveBlurView intensity={30} tint="dark" className="flex-row bg-phase-surface/80">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ padding: 6 }}
            >
              {availablePerspectives.map((p) => {
                const isActive = activePerspective === p.id;
                const isDisabled = p.disabled;
                const PerspectiveIcon = p.icon;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => !isDisabled && setActivePerspective(p.id)}
                    disabled={isDisabled}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.label} perspective`}
                    accessibilityHint={p.description}
                    accessibilityState={{ selected: isActive, disabled: isDisabled }}
                    className={`px-4 py-2.5 rounded-2xl flex-row items-center mx-1 gap-2 border ${isActive ? 'bg-amber-500/15 border-amber-500/30' : 'border-transparent'} ${isDisabled ? 'opacity-30' : 'active:opacity-80'}`}
                  >
                    <SanctuaryIcon
                      as={PerspectiveIcon}
                      size={18}
                      color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.starlightGray}
                    />
                    <Text
                      className={`text-[13px] ${
                        isActive
                          ? 'font-extrabold text-amber-500'
                          : 'font-semibold text-phaseText-tertiary'
                      }`}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </AdaptiveBlurView>
        </Box>
      </Box>

      <GestureHandlerRootView style={{ flex: 1 }}>
        <Box className="flex-1 bg-phase-surface overflow-hidden">
          {visualizationContent}

          {selectedNode && (
            <Box className="absolute bottom-10 left-5 right-5 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
              <AdaptiveBlurView intensity={25} tint="dark" className="p-5 bg-black/40">
                <VStack className="gap-3">
                  <HStack className="justify-between items-center">
                    <VStack className="flex-1 mr-4">
                      <Text className="text-xl font-black text-white" numberOfLines={1}>
                        {selectedNode.label}
                      </Text>
                      <Text className="text-[10px] font-extrabold text-phase-accent uppercase tracking-widest mt-0.5">
                        {selectedNode.type} \u00B7 {selectedNode.group}
                      </Text>
                    </VStack>
                    <Pressable
                      onPress={() => setSelectedNode(null)}
                      accessibilityRole="button"
                      accessibilityLabel="Close selected knowledge node"
                      className="p-2 rounded-full bg-white/10 active:bg-white/20"
                    >
                      <SanctuaryIcon as={X} size={20} color="white" />
                    </Pressable>
                  </HStack>

                  {selectedNode.metadata?.description && (
                    <Text className="text-sm text-white/70 leading-5" numberOfLines={3}>
                      {selectedNode.metadata.description}
                    </Text>
                  )}

                  <Pressable
                    className="h-14 rounded-[28px] justify-center items-center mt-2 bg-phase-accent active:bg-phase-accent/90 shadow-lg"
                    onPress={() => {
                      if (selectedNode.type === 'resource') {
                        router.push({
                          pathname: '/library/resource/[resourceId]',
                          params: { resourceId: selectedNode.id },
                        });
                      } else {
                        router.push('/library');
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={selectedNode.type === 'topic' ? 'Explore knowledge' : 'Begin learning'}
                  >
                    <Text className="text-white font-black uppercase tracking-widest">
                      {selectedNode.type === 'topic' ? 'Explore Knowledge' : 'Begin Learning'}
                    </Text>
                  </Pressable>
                </VStack>
              </AdaptiveBlurView>
            </Box>
          )}
        </Box>
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
}
function _StatCardNative({
  label,
  value,
  icon: IconComponent,
}: {
  label: string;
  value: number;
  icon: any;
}) {
  return (
    <Box className="flex-1 bg-white/5 p-4 rounded-3xl flex-row items-center gap-3 border border-white/5">
      <SanctuaryIcon as={IconComponent} size={20} color={Theme.colors.sanctuarySaffron} />
      <VStack>
        <Text className="text-[10px] uppercase font-bold tracking-widest text-phaseText-tertiary">
          {label}
        </Text>
        <Text className="text-lg font-black text-white">{value}</Text>
      </VStack>
    </Box>
  );
}
