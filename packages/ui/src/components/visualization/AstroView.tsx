import type { GraphLink, GraphNode, PerspectiveViewProps } from '@repo/core';
import React, { useCallback, useMemo } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { useResponsive } from '../../hooks/useResponsive';
import { useThemedColors } from '../../hooks/useThemedColors';
import { Theme } from '../../theme/Theme';

const GraphLinkItem = React.memo(
  ({
    link,
    sourcePos,
    targetPos,
    colors,
  }: {
    link: GraphLink;
    sourcePos: { x: number; y: number };
    targetPos: { x: number; y: number };
    colors: any;
  }) => {
    return (
      <Line
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        stroke={link.isPathway ? Theme.colors.sanctuarySaffron : colors.textTertiary}
        strokeOpacity={link.isPathway ? 0.6 : 0.15}
        strokeWidth={link.isPathway ? 3 : 1}
        strokeDasharray={link.relationship === 'prerequisite' ? '4,4' : undefined}
      />
    );
  },
);

const GraphNodeItem = React.memo(
  ({
    node,
    pos,
    isSelected,
    colors,
    onPress,
  }: {
    node: GraphNode;
    pos: { x: number; y: number };
    isSelected: boolean;
    colors: any;
    onPress: (node: GraphNode) => void;
  }) => {
    const handlePress = useCallback(() => onPress(node), [onPress, node]);

    return (
      <G onPress={handlePress}>
        <Circle
          cx={pos.x}
          cy={pos.y}
          r={isSelected ? 10 : 6}
          fill={isSelected ? Theme.colors.sanctuarySaffron : colors.gurudeviBlue}
          stroke={colors.card}
          strokeWidth={2}
        />
        <SvgText
          x={pos.x}
          y={pos.y + 20}
          fontSize="12"
          fill={colors.text}
          textAnchor="middle"
          fontWeight={isSelected ? 'bold' : 'normal'}
        >
          {node.label}
        </SvgText>
      </G>
    );
  },
);

export const AstroView: React.FC<PerspectiveViewProps> = ({
  data,
  layout,
  onNodePress,
  selectedNode,
}) => {
  const colors = useThemedColors();
  const { width: _w, height: _h } = useResponsive();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(100);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(100);

  const combinedGesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .onUpdate((e: any) => {
        scale.value = savedScale.value * e.scale;
      })
      .onEnd(() => {
        savedScale.value = scale.value;
      });

    const pan = Gesture.Pan()
      .onUpdate((e: any) => {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    return Gesture.Simultaneous(pinch, pan);
  }, [scale, savedScale, translateX, savedTranslateX, translateY, savedTranslateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ] as any,
  }));

  const handleNodePress = useCallback(
    (node: GraphNode) => {
      onNodePress?.(node);
    },
    [onNodePress],
  );

  const renderLinks = useMemo(() => {
    return data.links.map((link, _i) => {
      const sourceId =
        typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const targetId =
        typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;

      const sourcePos = layout.positions.get(sourceId);
      const targetPos = layout.positions.get(targetId);

      if (!sourcePos || !targetPos) return null;

      return (
        <GraphLinkItem
          key={`link-${sourceId}-${targetId}`}
          link={link}
          sourcePos={sourcePos}
          targetPos={targetPos}
          colors={colors}
        />
      );
    });
  }, [data.links, layout.positions, colors]);

  const renderNodes = useMemo(() => {
    return data.nodes.map((node) => {
      const pos = layout.positions.get(node.id);
      if (!pos) return null;
      const isSelected = selectedNode?.id === node.id;

      return (
        <GraphNodeItem
          key={`node-${node.id}`}
          node={node}
          pos={pos}
          isSelected={isSelected}
          colors={colors}
          onPress={handleNodePress}
        />
      );
    });
  }, [data.nodes, layout.positions, selectedNode?.id, colors, handleNodePress]);

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Svg
          width={layout.bounds.width + 1000}
          height={layout.bounds.height + 1000}
          viewBox={`${layout.bounds.minX - 500} ${layout.bounds.minY - 500} ${layout.bounds.width + 1000} ${layout.bounds.height + 1000}`}
        >
          {renderLinks}
          {renderNodes}
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
};
