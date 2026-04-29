import { Card, HStack, VStack } from '@repo/ui';
import { Theme } from '@repo/ui/theme';

import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

export interface SankeyDiagramProps {
  title: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  showLabels?: boolean;
}

export function SankeyDiagram({
  title,
  nodes,
  links,
  width = 350,
  height = 250,
  nodeWidth = 80,
  showLabels = true,
}: SankeyDiagramProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const actualWidth = Math.min(width, screenWidth - 40);

  const styles = StyleSheet.create({
    container: {
      padding: 16, // Use numeric value instead of Theme.spacing.md
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: '#333', // Use color instead of Theme.colors.text
      marginBottom: 16, // Use numeric value instead of Theme.spacing.md
      textAlign: 'center',
    },
    diagramContainer: {
      position: 'relative',
      backgroundColor: '#f9f9f9', // Use color instead of Theme.colors.background
    },
    linkContainer: {
      position: 'absolute',
    },
    linkPath: {
      position: 'absolute',
      borderRadius: 1,
    },
    linkLabel: {
      position: 'absolute',
      fontSize: 10,
      color: '#333', // Use color instead of Theme.colors.text
      backgroundColor: '#fff', // Use color instead of Theme.colors.silk
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4, // Use numeric value instead of Theme.corners.medium
    },
    node: {
      position: 'absolute',
      borderRadius: 8, // Use numeric value instead of Theme.corners.medium
      borderWidth: 2,
      borderColor: '#ddd', // Use color instead of Theme.colors.border
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    nodeLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#333', // Use color instead of Theme.colors.text
      textAlign: 'center',
    },
  });

  // Calculate node positions
  const nodePositions: { [key: string]: { x: number; y: number } } = {};
  const nodeIndex: { [key: string]: number } = {};

  nodes.forEach((node, index) => {
    nodePositions[node.id] = {
      x: 20,
      y: 50 + index * 60,
    };
    nodeIndex[node.id] = index;
  });

  // Calculate link paths
  const getLinkPath = (link: SankeyLink) => {
    const source = nodePositions[link.source];
    const target = nodePositions[link.target];

    if (!source || !target) return '';

    // Create curved path
    const midX = (source.x + nodeWidth + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    const controlOffset = Math.abs(target.y - source.y) / 4;

    return `M ${source.x + nodeWidth} ${source.y} Q ${midX} ${source.y - controlOffset} ${midX} ${target.y + controlOffset} ${target.x} ${target.y}`;
  };

  return (
    <Card style={[styles.container, { width: actualWidth, height }]}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.diagramContainer}>
        {/* Links */}
        {links.map((link, index) => (
          <View key={index} style={styles.linkContainer}>
            <View
              style={[
                styles.linkPath,
                {
                  backgroundColor: link.color || Theme.colors.gurudeviBlue,
                  height: 2,
                  width: Math.sqrt(
                    ((nodePositions[link.target]?.x ?? 0) -
                      ((nodePositions[link.source]?.x ?? 0) + nodeWidth)) **
                      2 +
                      ((nodePositions[link.target]?.y ?? 0) -
                        (nodePositions[link.source]?.y ?? 0)) **
                        2,
                  ),
                },
              ]}
            />
            {/* Link value label */}
            {showLabels && <Text style={styles.linkLabel}>{link.value}</Text>}
          </View>
        ))}

        {/* Nodes */}
        {nodes.map((node, index) => (
          <View
            key={node.id}
            style={[
              styles.node,
              {
                backgroundColor: node.color || Theme.colors.background,
                left: nodePositions[node.id]?.x,
                top: nodePositions[node.id]?.y,
                width: nodeWidth,
              },
            ]}
          >
            <Text style={styles.nodeLabel}>{showLabels ? node.label : ''}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
