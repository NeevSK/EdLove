import {
  Box,
  GitMerge,
  GlassCard,
  Heading,
  HStack,
  Icon,
  Share2,
  Shield,
  Text,
  VStack,
  Zap,
} from '@repo/ui';
import { Pressable, ScrollView } from '@repo/ui/primitives';

/**
 * FounderVisionScreen - Strategic App-Logic Visualization.
 *
 * Demonstrates the "Universal Perspective" for the Founder role.
 * Maps out the platform's architectural priorities as a mind-map/flowchart.
 */
export default function FounderVisionScreen() {
  // Theoretical topology for App Architecture
  const appLogicTopology = {
    nodes: [
      { id: 'core', label: 'Gurudevi Core', type: 'topic', group: 'foundation' },
      { id: 'auth', label: 'Auth & Identity', type: 'persona', group: 'security' },
      { id: 'library', label: 'Library Sphere', type: 'topic', group: 'resource' },
      { id: 'community', label: 'Community Weaving', type: 'topic', group: 'resonance' },
      { id: 'analytics', label: 'Resonance Metrics', type: 'topic', group: 'governance' },
      { id: 'mobile', label: 'Native Pulse', type: 'persona', group: 'deployment' },
      { id: 'web', label: 'Web Parity', type: 'persona', group: 'deployment' },
    ],
    links: [
      { source: 'core', target: 'auth', relationship: 'dependency' },
      { source: 'core', target: 'library', relationship: 'core_feature' },
      { source: 'core', target: 'community', relationship: 'core_feature' },
      { source: 'library', target: 'analytics', relationship: 'data_flow' },
      { source: 'community', target: 'analytics', relationship: 'data_flow' },
      { source: 'core', target: 'mobile', relationship: 'isomorphic' },
      { source: 'core', target: 'web', relationship: 'isomorphic' },
    ],
    context: { title: 'Strategic Resonance Topology' },
  };

  return (
    <Box className="flex-1 bg-phase-canvas">
      <Box className="pt-[60px] px-6 pb-5">
        <HStack className="justify-between items-center">
          <VStack>
            <Heading className="text-3xl font-black text-phaseText-primary tracking-tighter">
              Strategic Vision
            </Heading>
            <Text className="text-base text-phaseText-secondary">Mapping the App Topology</Text>
          </VStack>
          <Pressable className="w-11 h-11 rounded-full bg-phase-interactive/10 justify-center items-center active:opacity-70">
            <Icon as={Share2} size="md" className="text-phase-interactive" />
          </Pressable>
        </HStack>
      </Box>

      <Box className="mx-4 flex-1 rounded-[30px] overflow-hidden border border-white/5 bg-black/20 p-6">
        <VStack className="gap-4">
          <Heading className="text-xl font-black text-phaseText-primary">
            Architecture Pulse
          </Heading>
          <Text className="text-sm text-phaseText-secondary">
            The founder topology renderer is being refreshed for the new visualization contract.
            Until that lands, this screen summarizes the same strategic graph in a build-safe way.
          </Text>
          <VStack className="gap-3">
            {appLogicTopology.nodes.map((node) => (
              <GlassCard
                key={node.id}
                className="rounded-2xl border border-phase-border/10 px-4 py-3"
              >
                <HStack className="items-center justify-between gap-3">
                  <VStack className="flex-1">
                    <Text className="text-sm font-bold text-phaseText-primary">{node.label}</Text>
                    <Text className="text-xs uppercase tracking-wide text-phaseText-secondary">
                      {node.group}
                    </Text>
                  </VStack>
                  <Text className="text-xs font-semibold uppercase text-phaseText-secondary">
                    {node.type}
                  </Text>
                </HStack>
              </GlassCard>
            ))}
          </VStack>
        </VStack>
      </Box>

      <Box className="py-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
        >
          <StatusPill icon={GitMerge} label="7 Ecosystem Nodes" colorClass="text-phase-warning" />
          <StatusPill icon={Zap} label="High Resonance" colorClass="text-phase-reward" />
          <StatusPill icon={Shield} label="RLS Protected" colorClass="text-phase-interactive" />
        </ScrollView>
      </Box>
    </Box>
  );
}

const StatusPill = ({
  icon: LucideIcon,
  label,
  colorClass,
}: {
  icon: any;
  label: string;
  colorClass: string;
}) => {
  return (
    <GlassCard className="px-4 py-2 rounded-[20px] border border-phase-border/10">
      <HStack className="items-center gap-1.5">
        <Icon as={LucideIcon} size="sm" className={colorClass} />
        <Text className="text-xs font-semibold text-phaseText-primary/80">{label}</Text>
      </HStack>
    </GlassCard>
  );
};
