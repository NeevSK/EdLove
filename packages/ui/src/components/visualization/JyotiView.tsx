import type { PerspectiveViewProps } from '@repo/core';
import { Layers, Network, Orbit, TrendingUp } from 'lucide-react-native';
import type React from 'react';
import { useMemo } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useTheme } from '../../hooks/useTheme';
import { Box, HStack, ScrollView, Text, VStack } from '../../primitives';
import { Theme } from '../../theme/Theme';
import SanctuaryStatsCard from '../SanctuaryStatsCard';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { BarChart, PieChart } = require('react-native-gifted-charts') as {
  BarChart: React.ComponentType<any>;
  PieChart: React.ComponentType<any>;
};

export const JyotiView: React.FC<PerspectiveViewProps> = ({ data }) => {
  const theme = useTheme();
  const { width: windowWidth } = useResponsive();

  const actionColor = theme.accent.action;

  const { totalNodes, totalLinks, avgConnectivity } = useMemo(() => {
    const nodes = data.nodes.length;
    const links = data.links.length;
    return {
      totalNodes: nodes,
      totalLinks: links,
      avgConnectivity: nodes > 0 ? (links / nodes).toFixed(1) : '0',
    };
  }, [data.nodes.length, data.links.length]);

  const barData = useMemo(() => {
    const counts = data.nodes.reduce(
      (acc: any, node: any) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).map(([type, count]: any) => ({
      value: count,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      frontColor: type === 'topic' ? Theme.colors.sanctuarySaffron : actionColor,
    }));
  }, [data.nodes, actionColor]);

  const pieData = useMemo(() => {
    const counts = data.nodes.reduce(
      (acc: any, node: any) => {
        const group = node.group || 'Default';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).map(([group, count]: any, index: number) => ({
      value: count,
      text: group,
      color: index === 0 ? Theme.colors.sanctuarySaffron : index === 1 ? actionColor : '#10b981',
    }));
  }, [data.nodes, actionColor]);

  const CenterLabel = () => (
    <VStack className="items-center justify-center">
      <Text className="text-xl font-bold text-phaseText-primary">{totalNodes}</Text>
      <Text className="text-xs text-phaseText-tertiary">Total</Text>
    </VStack>
  );

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
      <VStack className="gap-6">
        <SanctuaryStatsCard
          title="Knowledge Resonance"
          showTrophy={false}
          items={[
            {
              label: 'Nodes',
              value: totalNodes,
              icon: Network,
              color: Theme.colors.sanctuarySaffron,
            },
            { label: 'Links', value: totalLinks, icon: Orbit, color: actionColor },
          ]}
          progressLabel="Topology Density"
          progressValue={Math.min(100, Math.round(Number(avgConnectivity) * 10))}
        />

        <Box className="p-6 bg-white/5 rounded-3xl border border-white/5">
          <HStack className="items-center mb-5">
            <Layers size={18} color={Theme.colors.sanctuarySaffron} />
            <Text className="ml-2 text-phaseText-primary font-bold">Node Distribution</Text>
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
            yAxisTextStyle={{ color: theme.text.muted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: theme.text.secondary, fontSize: 10 }}
            width={windowWidth - 100}
          />
        </Box>

        <Box className="p-6 bg-white/5 rounded-3xl border border-white/5">
          <HStack className="items-center mb-5">
            <TrendingUp size={18} color={Theme.colors.sanctuarySaffron} />
            <Text className="ml-2 text-phaseText-primary font-bold">Domain resonance</Text>
          </HStack>
          <Box className="items-center">
            <PieChart
              data={pieData}
              donut
              radius={80}
              innerRadius={60}
              centerLabelComponent={CenterLabel}
            />
          </Box>
        </Box>
      </VStack>
    </ScrollView>
  );
};
