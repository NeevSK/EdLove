import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
    Theme, 
    useThemedColors, 
    Box, 
    VStack, 
    HStack, 
    Text,
    SanctuaryStatsCard 
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
    const colors = useThemedColors();

    const nodeTypes = Array.from(new Set(data.nodes.map(n => n.type)));
    const typeDistribution = nodeTypes.map(type => ({
        type,
        count: data.nodes.filter(n => n.type === type).length
    }));

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <VStack spacing={32}>
                {/* Stats Cards */}
                <SanctuaryStatsCard 
                    title="Knowledge Resonance"
                    items={[
                        { label: "Total Nodes", value: data.nodes.length, icon: Network, color: colors.action },
                        { label: "Connections", value: data.links.length, icon: Orbit, color: colors.action },
                        { label: "Pathways", value: data.nodes.filter(n => n.path).length, icon: Route, color: colors.secondary }
                    ]}
                    progressLabel="Overall Discovery"
                    progressValue={Math.min(100, Math.floor((data.nodes.length / 100) * 100))}
                />

                {/* Distribution Chart (CSS-based Bar Chart for Web) */}
                <Box sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.03)', 
                    borderRadius: 24, 
                    padding: 32,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)'
                }}>
                    <Text sx={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 24 }}>
                        Knowledge Distribution
                    </Text>
                    <VStack spacing={20}>
                        {typeDistribution.map(item => (
                            <Box key={item.type} sx={{ width: '100%' }}>
                                <HStack sx={{ justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text sx={{ fontSize: 14, color: colors.textSecondary, textTransform: 'capitalize' }}>
                                        {item.type}
                                    </Text>
                                    <Text sx={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                                        {item.count}
                                    </Text>
                                </HStack>
                                <Box sx={{ 
                                    height: 8, 
                                    width: '100%', 
                                    backgroundColor: 'rgba(255,255,255,0.05)', 
                                    borderRadius: 4,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${(item.count / data.nodes.length) * 100}%`,
                                        backgroundColor: Theme.colors.sanctuarySaffron,
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
