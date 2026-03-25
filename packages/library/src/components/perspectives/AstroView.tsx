import React from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring 
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureUpdateEvent, PinchGestureHandlerEventPayload, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { Theme, useThemedColors, Text } from '@repo/ui';
import type { 
    PerspectiveViewProps, 
    GraphNode, 
    GraphLink 
} from '@repo/graphics';

/**
 * AstroView — The "Knowledge Cosmos" Perspective (Native).
 * 
 * Renders a force-directed graph using react-native-svg.
 * Receives pre-computed layout positions from @repo/graphics.
 */
export const AstroView: React.FC<PerspectiveViewProps> = ({
    data,
    layout,
    onNodePress,
    selectedNode,
}) => {
    const colors = useThemedColors();
    const { width, height } = useWindowDimensions();

    // Zoom and Pan state
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Gestures
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e: GestureUpdateEvent<PinchGestureHandlerEventPayload>) => {
            scale.value = savedScale.value * (e.scale || 1);
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }
        ]
    }));

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                <Svg 
                    width={layout.bounds.width + 1000} 
                    height={layout.bounds.height + 1000} 
                    viewBox={`${layout.bounds.minX - 500} ${layout.bounds.minY - 500} ${layout.bounds.width + 1000} ${layout.bounds.height + 1000}`}
                >
                    {/* Render Links */}
                    {data.links.map((link, i) => {
                        const sourceId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
                        const targetId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
                        
                        const sourcePos = layout.positions.get(sourceId);
                        const targetPos = layout.positions.get(targetId);

                        if (!sourcePos || !targetPos) return null;

                        return (
                            <Line
                                key={`link-${i}`}
                                x1={sourcePos.x}
                                y1={sourcePos.y}
                                x2={targetPos.x}
                                y2={targetPos.y}
                                stroke={link.isPathway ? Theme.colors.sanctuarySaffron : colors.textTertiary}
                                strokeOpacity={link.isPathway ? 0.6 : 0.15}
                                strokeWidth={link.isPathway ? 3 : 1}
                                strokeDasharray={link.relationship === 'prerequisite' ? "4,4" : undefined}
                            />
                        );
                    })}

                    {/* Render Nodes */}
                    {data.nodes.map((node, i) => {
                        const pos = layout.positions.get(node.id);
                        if (!pos) return null;

                        const isSelected = selectedNode?.id === node.id;
                        
                        return (
                            <G 
                                key={`node-${node.id}`} 
                                onPress={() => onNodePress?.(node)}
                            >
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
                                    fontWeight={isSelected ? "bold" : "normal"}
                                >
                                    {node.label}
                                </SvgText>
                            </G>
                        );
                    })}
                </Svg>
            </Animated.View>
        </GestureDetector>
    );
};
