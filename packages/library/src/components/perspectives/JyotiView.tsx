import React, { useMemo } from 'react';

import { 
    Theme, 
    useTheme,
    Box, 
    VStack, 
    HStack, 
    Text, 
    SanctuaryStatsCard,
    ScrollView,
    useResponsive
} from '@repo/ui';
import { Network, Orbit, TrendingUp, Layers } from 'lucide-react-native';
import type { 
    PerspectiveViewProps, 
} from '@repo/graphics';

// The charts package ships runtime code correctly in this workspace, but some package-local
// TypeScript programs do not pick up its ambient typings consistently through transitive imports.
// Requiring it here keeps the dependency local to the native-only perspective while preserving type safety.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { BarChart, PieChart } = require('react-native-gifted-charts') as {
    BarChart: React.ComponentType<any>;
    PieChart: React.ComponentType<any>;
};

/**
 * JyotiView  The "Insight / Statistical" Perspective (Native).
 * 
 * Provides a Power BI style dashboard with analytics on the topology.
 * Uses react-native-gifted-charts for high-fidelity data visualization.
 */
export const JyotiView: React.FC<PerspectiveViewProps> = ({
    data,
}) => {
    const theme = useTheme();
    const { width: windowWidth } = useResponsive();

    const actionColor = theme.accent.action;
    const textPrimary = theme.text.primary;
    const textSecondary = theme.text.secondary;
    const textTertiary = theme.text.muted;

    // 1. Calculate Metrics
    const { totalNodes, totalLinks, avgConnectivity } = useMemo(() => {
        const nodes = data.nodes.length;
        const links = data.links.length;
        return {
            totalNodes: nodes,
            totalLinks: links,
            avgConnectivity: nodes > 0 ? (links / nodes).toFixed(1) : '0'
        };
    }, [data.nodes.length, data.links.length]);
    
    // 2. Node Type Distribution (for Bar Chart)
    const barData = useMemo(() => {
        const counts = data.nodes.reduce((acc, node) => {
            acc[node.type] = (acc[node.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([type, count]) => ({
            value: count,
            label: type.charAt(0).toUpperCase() + type.slice(1),
            frontColor: type === 'topic' ? Theme.colors.sanctuarySaffron : actionColor,
        }));
    }, [data.nodes, actionColor]);

    // 3. Group Distribution (for Pie Chart)
    const pieData = useMemo(() => {
        const counts = data.nodes.reduce((acc, node) => {
            const group = node.group || 'Default';
            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([group, count], index) => {
            return {
                value: count,
                text: group,
                color: index === 0 ? Theme.colors.sanctuarySaffron : (index === 1 ? actionColor : '#10b981'),
            };
        });
    }, [data.nodes, actionColor]);

    const centerLabel = useMemo(() => () => (
        <VStack className="items-center justify-center">
            <Text className="text-xl font-bold text-phaseText-primary">{totalNodes}</Text>
            <Text className="text-xs text-phaseText-tertiary">Total</Text>
        </VStack>
    ), [totalNodes]);

    return (
        <ScrollView 
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingTop: 100, paddingBottom: 100 }}
        >
            <VStack className="gap-6">
                {/* Header Stats using Standard Sanctuary Component */}
                <SanctuaryStatsCard 
                    title="Knowledge Resonance"
                    showTrophy={false}
                    items={[
                        {
                            label: "Total Nodes",
                            value: totalNodes,
                            icon: Network,
                            color: Theme.colors.sanctuarySaffron
                        },
                        {
                            label: "Connections",
                            value: totalLinks,
                            icon: Orbit,
                            color: actionColor
                        }
                    ]}
                    progressLabel="Topology Density"
                    progressValue={Math.min(100, Math.round(Number(avgConnectivity) * 10))}
                />

                {/* Type Distribution - Bar Chart */}
                <Box className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <HStack className="items-center mb-5">
                        <Layers size={18} color={Theme.colors.sanctuarySaffron} />
                        <Box className="ml-2">
                          <Text className="text-phaseText-primary font-bold text-md">Node Distribution</Text>
                        </Box>
                    </HStack>
                    
                    <BarChart
                        data={barData}
                        barWidth={40}
                        noOfSections={3}
                        barBorderRadius={6}
                        frontColor={actionColor}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        hideRules
                        yAxisTextStyle={{ color: textTertiary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: textSecondary, fontSize: 10 }}
                        width={windowWidth - 100}
                    />
                </Box>

                {/* Group Distribution - Pie Chart */}
                <Box className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <HStack className="items-center mb-5">
                        <TrendingUp size={18} color={Theme.colors.sanctuarySaffron} />
                        <Box className="ml-2">
                          <Text className="text-phaseText-primary font-bold text-md">Domain Resonance</Text>
                        </Box>
                    </HStack>

                    <Box className="items-center">
                        <PieChart
                            data={pieData}
                            donut
                            radius={80}
                            innerRadius={60}
                            centerLabelComponent={centerLabel}
                        />
                    </Box>

                    <VStack className="gap-2 mt-5">
                        {pieData.map((item, i) => (
                            <HStack key={i} className="items-center">
                                <Box 
                                    className="w-2 h-2 rounded-full mr-2" 
                                    style={{ backgroundColor: item.color }} 
                                />
                                <Box className="flex-1">
                                  <Text className="text-xs text-phaseText-secondary">{item.text}</Text>
                                </Box>
                                <Text className="text-xs font-bold text-phaseText-primary">{item.value}</Text>
                            </HStack>
                        ))}
                    </VStack>
                </Box>
            </VStack>
        </ScrollView>
    );
};
