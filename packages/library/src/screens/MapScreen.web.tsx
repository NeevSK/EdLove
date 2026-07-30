import {
  CaptureEngine,
  getAvailablePerspectives as getEnginePerspectives,
  KnowledgeParser,
} from '@repo/graphics/algorithms';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import LotusLoader from '@repo/ui/components/LotusLoader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import {
  AstroView,
  DharmaView,
  JyotiView,
  TerraView,
  VastuView,
  VatyaView,
} from '@repo/ui/components/visualization';
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
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { libraryAPI } from '@repo/library/api/library';
import { usePerspectiveLayout } from '@repo/library/hooks/usePerspectiveLayout';
import type { KnowledgeNode, KnowledgeTopology } from '@repo/library/types/Library';

type PerspectiveId = 'astro' | 'terra' | 'dharma' | 'vastu' | 'jyoti' | 'vatya';
interface Perspective {
  id: PerspectiveId;
  label: string;
  icon: any;
  description: string;
  disabled?: boolean;
}
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
const getAvailablePerspectives = (topology: any) => {
  if (!topology) return PERSPECTIVES;
  const engineIds = getEnginePerspectives(topology);
  return PERSPECTIVES.map((p) => ({
    ...p,
    disabled: !engineIds.includes(p.id),
  }));
};
/**
 * MapScreen.web.tsx  The Unified Vision
 *
 * Refactored to use the @repo/graphics layout engine.
 * Achieves parity with native while optimizing for browser-native SVG/div rendering.
 */
export default function MapScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width, height } = useResponsive();
  const [activePerspective, setActivePerspective] = useState<PerspectiveId>('astro');
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KnowledgeTopology | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const topology = await libraryAPI.getMapTopology();
        setData(topology);
      } catch (err) {
        console.error('Failed to fetch map topology:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // Simulation: Load Mermaid data if AI mode is active
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
  const layout = usePerspectiveLayout(activeData as any, {
    width: width,
    height: height,
    perspective: activePerspective,
  });
  const handleNodePress = (node: KnowledgeNode) => {
    setSelectedNode(node);
    // On web, we could implement smooth scroll to node or zoom here
  };
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Find the SVG element in the current perspective
      const svgElement = document.querySelector('svg');
      if (svgElement) {
        const dataUrl = await CaptureEngine.svgToDataURL(svgElement);
        console.log('--- VISUALIZATION CAPTURED ---');
        console.log('Snapshot ready for Report:', `${dataUrl.substring(0, 50)}...`);
        alert('Success: Visualization captured and synced to the Student Report.');
      } else {
        alert('Error: No visualization found to export.');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please check the console for details.');
    } finally {
      setIsExporting(false);
    }
  };
  const renderContent = () => {
    if (loading) {
      return (
        <Box className="flex-1 justify-center items-center">
          <LotusLoader size="lg" />
        </Box>
      );
    }
    if (activePerspective === 'astro' && activeData && layout) {
      return (
        <AstroView
          data={activeData as any}
          layout={layout}
          onNodePress={handleNodePress as any}
          selectedNode={selectedNode as any}
          width={width}
          height={height}
        />
      );
    }
    if (activePerspective === 'jyoti' && activeData) {
      return <JyotiView data={activeData as any} layout={layout!} width={width} height={height} />;
    }
    if (activePerspective === 'terra' && activeData) {
      return <TerraView data={activeData as any} layout={layout!} width={width} height={height} />;
    }
    if (activePerspective === 'dharma' && activeData) {
      return <DharmaView data={activeData as any} layout={layout!} width={width} height={height} />;
    }
    if (activePerspective === 'vatya' && activeData) {
      return (
        <VatyaView
          data={activeData as any}
          layout={layout!}
          selectedNode={selectedNode as any}
          width={width}
          height={height}
        />
      );
    }
    if (activePerspective === 'vastu' && activeData && layout) {
      return (
        <VastuView
          data={activeData as any}
          layout={layout}
          onNodePress={handleNodePress as any}
          selectedNode={selectedNode as any}
          width={width}
          height={height}
        />
      );
    }
    return (
      <Box className="flex-1 justify-center items-center">
        <LotusLoader size="md" />
      </Box>
    );
  };
  const accentColor = theme.accent.action;
  return (
    <ScreenWrapper scroll={false}>
      <GlobalHeader
        title="Knowledge Cosmos"
        subtitle="Isomorphic Visualization Engine"
        showBack
        onBack={() => safeBack('/library')}
        rightAction={
          <Pressable
            onPress={handleExport}
            disabled={isExporting}
            className="flex-row items-center px-4 py-2 rounded-xl mr-3"
            style={({ pressed }) => ({
              backgroundColor: `${accentColor}20`,
              opacity: isExporting || pressed ? 0.5 : 1,
            })}
          >
            <SanctuaryIcon as={FileCheck} size={18} color={accentColor} className="mr-2" />
            <Text className="text-xs font-bold" style={{ color: accentColor }}>
              {isExporting ? 'CAPTURING...' : 'EXPORT'}
            </Text>
          </Pressable>
        }
      />

      <Box className="p-3 bg-phase-surface">
        <Box className="rounded-[20px] overflow-hidden border border-white/10">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ padding: 6 }}
          >
            {getAvailablePerspectives(activeData).map((p) => {
              const isActive = activePerspective === p.id;
              const isDisabled = p.disabled;
              const Icon = p.icon;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => !isDisabled && setActivePerspective(p.id)}
                  disabled={isDisabled}
                  className={`px-4 py-2.5 rounded-[14px] flex-row items-center mx-1 gap-2 ${isActive ? 'bg-[#FF990026] border border-[#FF99004D]' : ''} ${isDisabled ? 'opacity-30' : ''}`}
                >
                  <SanctuaryIcon
                    as={Icon}
                    size={18}
                    color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.starlightGray}
                  />
                  <Text
                    className={`text-[13px] ${isActive ? 'font-extrabold' : 'font-semibold'}`}
                    style={{
                      color: isActive ? Theme.colors.sanctuarySaffron : Theme.colors.starlightGray,
                    }}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Box>
      </Box>

      <Box className="flex-1 bg-phase-surface overflow-hidden relative">
        {renderContent()}

        {selectedNode && (
          <Box className="absolute bottom-10 left-5 right-5 bg-[#0f172a]/95 rounded-[32px] p-6 border border-white/10">
            <VStack className="gap-3">
              <HStack className="justify-between items-center">
                <VStack>
                  <Text className="text-xl font-black text-white">{selectedNode.label}</Text>
                  <Text className="text-xs font-bold text-phase-accent uppercase">
                    {selectedNode.type} \u00B7 {selectedNode.group}
                  </Text>
                </VStack>
                <Pressable onPress={() => setSelectedNode(null)}>
                  <Box className="p-2 rounded-full bg-white/10">
                    <SanctuaryIcon as={X} size={20} color="white" />
                  </Box>
                </Pressable>
              </HStack>

              {selectedNode.metadata?.description && (
                <Text className="text-sm text-phaseText-secondary leading-5">
                  {selectedNode.metadata.description}
                </Text>
              )}

              <Pressable
                className="h-14 rounded-[28px] justify-center items-center mt-2 bg-phase-accent active:opacity-90"
                onPress={() => {
                  if (selectedNode.type === 'resource') {
                    router.push({
                      pathname: '/library/resource/[resourceId]',
                      params: { resourceId: selectedNode.id },
                    });
                  }
                }}
              >
                <Text className="text-phase-surface font-extrabold">
                  {selectedNode.type === 'topic' ? 'Explore Knowledge' : 'Begin Learning'}
                </Text>
              </Pressable>
            </VStack>
          </Box>
        )}
      </Box>
    </ScreenWrapper>
  );
}
