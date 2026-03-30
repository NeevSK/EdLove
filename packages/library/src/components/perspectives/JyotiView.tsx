import React from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { 
    Theme, 
    useThemedColors,
    Box, 
    VStack, 
    HStack, 
    Text, 
    SanctuaryStatsCard 
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
    onNodePress,
}) => {
    const colors = useThemedColors();
    const { width: windowWidth } = useWindowDimensions();

    // 1. Calculate Metrics
    const totalNodes = data.nodes.length;
    const totalLinks = data.links.length;
    const avgConnectivity = totalNodes > 0 ? (totalLinks / totalNodes).toFixed(1) : '0';
    
    // 2. Node Type Distribution (for Bar Chart)
    const typeCounts = data.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(typeCounts).map(([type, count]) => ({
        value: count,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        frontColor: type === 'topic' ? Theme.colors.sanctuarySaffron : colors.action,
    }));

    // 3. Group Distribution (for Pie Chart)
    const groupCounts = data.nodes.reduce((acc, node) => {
        const group = node.group || 'Default';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(groupCounts).map(([group, count], index) => {
        return {
            value: count,
            text: group,
            color: index === 0 ? Theme.colors.sanctuarySaffron : (index === 1 ? colors.action : colors.success),
        };
    });

    return (
        <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 24, paddingTop: 100, paddingBottom: 100 }}>
        
            <VStack spacing={24}
                {/* Header Stats using Standard Sanctuary Component */}>
                <SanctuaryStatsCard 
                    title="Knowledge Resonance"
                    showTrophy={false}
                    items={[>
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
                            color: colors.action
                        }
                    ]}
                    progressLabel="Topology Density"
                    progressValue={Math.min(100, Math.round(Number(avgConnectivity) * 10))}
                /

                >{/* Type Distribution - Bar Chart */}
                <Box sx={{ 
                    padding: 24, 
                    backgroundColor: 'rgba(255,255,255,0.03)', 
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)'>
                }}
                    <HStack {...({ alignItems: 'center', mb: 20 } as any)}
                        <Layers size={18} color={Theme.colors.sanctuarySaffron} style={{ marginRight: 8 }} />
                        ><Text {...({ color: colors.text, bold: true, size: "md" } as any)}>Node Distribution</Text
                    ></HStack>
                    
                    <BarChart
                        data={barData}
                        barWidth={40}
                        noOfSections={3}
                        barBorderRadius={6}
                        frontColor={colors.action}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        hideRules
                        yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                        width={windowWidth - 100}
                    />
                </Box>

                {/* Group Distribution - Pie Chart */}
                <Box sx={{ 
                    padding: 24, 
                    backgroundColor: 'rgba(255,255,255,0.03)', 
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)'>
                }}
                    <HStack {...({ alignItems: 'center', mb: 20 } as any)}
                        <TrendingUp size={18} color={Theme.colors.sanctuarySaffron} style={{ marginRight: 8 }} />
                        ><Text {...({ color: colors.text, bold: true, size: "md" } as any)}>Domain Resonance</Text
                    ></HStack>

                    <View style={{ alignItems: 'center' }}
                        <PieChart
                            data={pieData}
                            donut
                            radius={80}
                            innerRadius={60}
                            centerLabelComponent={() => (
                                <VStack {...({ alignItems: 'center', justifyContent: 'center' } as any)}
                                    <Text {...({ size: "xl", bold: true, color: colors.text } as any)}>{totalNodes}</Text
                                    ><Text {...({ size: "xs", color: colors.textTertiary } as any)}>Total</Text
                                ></VStack>
                            )}
                        /
                    ></View>

                    <VStack spacing={8} sx={{ marginTop: 20 }}
                        {pieData.map((item, i) => (
                            <HStack key={i} {...({ alignItems: 'center' } as any)}
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 8 }} />
                                ><Text {...({ size: "xs", color: colors.textSecondary, sx: { flex: 1 } } as any)}>{item.text}</Text
                                ><Text {...({ size: "xs", bold: true, color: colors.text } as any)}>{item.value}</Text
                            ></HStack>
                        ))}
                    </VStack>
                </Box>
            </VStack>
        </ScrollView>
    );
};
