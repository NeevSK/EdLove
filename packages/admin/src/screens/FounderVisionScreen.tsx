import React from 'react';
import { 
    Text, 
    HStack, 
    VStack, 
    Box, 
    GlassCard,
    Pressable,
    ScrollView,
    Icon,
    Heading,
    View
} from '@repo/ui';
import { UniversalPerspective } from '@repo/library';
import { GitMerge, Zap, Shield, Share2 } from 'lucide-react-native';

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
            { id: 'web', label: 'Web Parity', type: 'persona', group: 'deployment' }
        ],
        links: [
            { source: 'core', target: 'auth', relationship: 'dependency' },
            { source: 'core', target: 'library', relationship: 'core_feature' },
            { source: 'core', target: 'community', relationship: 'core_feature' },
            { source: 'library', target: 'analytics', relationship: 'data_flow' },
            { source: 'community', target: 'analytics', relationship: 'data_flow' },
            { source: 'core', target: 'mobile', relationship: 'isomorphic' },
            { source: 'core', target: 'web', relationship: 'isomorphic' }
        ],
        context: { title: 'Strategic Resonance Topology' }
    };

    return (
        <View className="flex-1 bg-phase-canvas">
            <View className="pt-[60px] px-6 pb-5">
                <HStack className="justify-between items-center">
                    <VStack>
                        <Heading className="text-3xl font-black text-phase-text-primary tracking-tighter">Strategic Vision</Heading>
                        <Text className="text-base text-phase-text-secondary">Mapping the App Topology</Text>
                    </VStack>
                    <Pressable className="w-11 h-11 rounded-full bg-phase-accent/10 justify-center items-center active:opacity-70">
                        <Icon as={Share2} size="md" className="text-phase-accent" />
                    </Pressable>
                </HStack>
            </View>

            <View className="flex-1 rounded-[30px] mx-4 overflow-hidden bg-black/20 border border-white/5">
                <UniversalPerspective 
                    topology={appLogicTopology as any}
                    initialPerspective="vastu" // Start as a Mind-map
                    title="Architecture Pulse"
                />
            </View>

            <View className="py-6">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
                    <StatusPill icon={GitMerge} label="7 Ecosystem Nodes" colorClass="text-phase-warning" />
                    <StatusPill icon={Zap} label="High Resonance" colorClass="text-phase-reward" />
                    <StatusPill icon={Shield} label="RLS Protected" colorClass="text-phase-accent" />
                </ScrollView>
            </View>
        </View>
    );
}

const StatusPill = ({ icon: LucideIcon, label, colorClass }: { icon: any, label: string, colorClass: string }) => {
    return (
        <GlassCard className="px-4 py-2 rounded-[20px]">
            <HStack className="items-center gap-1.5">
                <Icon as={LucideIcon} size="sm" className={colorClass} />
                <Text className="text-xs font-semibold text-phase-text-primary/80">{label}</Text>
            </HStack>
        </GlassCard>
    );
};
