import React from 'react';
import { StyleSheet } from 'react-native';
import { 
    useTheme, 
    Box, 
    VStack, 
    HStack, 
    Text,
    SanctuaryStatsCard,
    ScrollView
} from '@repo/ui';
import { Network, Orbit, Route } from 'lucide-react-native';
import type { 
    PerspectiveViewProps 
} from '@repo/graphics';

/**
 * JyotiView.web  The "Insight" Perspective (Web).
 * 
 * An analytical dashboard showing knowledge metrics.
 * Parity with native version but using standard web layout.
 */
export const JyotiView: React.FC<PerspectiveViewProps> = ({
    data,
}) => {
    const { accent, text, textOnAccent } = useTheme();

    const nodeTypes = Array.from(new Set(data.nodes.map(n => n.type)));
    const typeDistribution = nodeTypes.map(type => ({
        type,
        count: data.nodes.filter(n => n.type === type).length
    }));

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <VStack className="gap-8">
                {/* Stats Cards */}
                <SanctuaryStatsCard 
                    title="Knowledge Resonance"
                    items={[
                        { label: "Total Nodes", value: data.nodes.length, icon: Network, color: accent.action },
                        { label: "Connections", value: data.links.length, icon: Orbit, color: accent.action },
                        { label: "Pathways", value: data.nodes.filter(n => n.path).length, icon: Route, color: accent.reward }
                    ]}
                    progressLabel="Overall Discovery"
                    progressValue={Math.min(100, Math.floor((data.nodes.length / 100) * 100))}
                />

                {/* Distribution Chart (CSS-based Bar Chart for Web) */}
                <Box className="bg-white/5 rounded-[24px] p-8 border border-white/5">
                    <Text className="text-lg font-extrabold text-phase-text-primary mb-6">
                        Knowledge Distribution
                    </Text>
                    <VStack className="gap-5">
                        {typeDistribution.map(item => (
                            <Box key={item.type} className="w-full">
                                <HStack className="justify-between mb-2">
                                    <Text className="text-sm text-phase-text-secondary capitalize">
                                        {item.type}
                                    </Text>
                                    <Text className="text-sm font-bold text-phase-text-primary">
                                        {item.count}
                                    </Text>
                                </HStack>
                                <Box className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${(item.count / data.nodes.length) * 100}%`,
                                        backgroundColor: accent.action,
                                        borderRadius: 4,
                                        transition: 'width 1s ease-out'
                                    }} />
                                </Box>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            </VStack>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Obsidian/Ink
    },
    content: {
        padding: 40,
        paddingTop: 120,
    }
});
