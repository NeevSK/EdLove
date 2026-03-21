import React from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Theme, useThemedColors } from '@repo/ui';
import type { 
    PerspectiveViewProps, 
} from '@repo/graphics';

/**
 * VastuView — The "Mind Map / Structure" Perspective (Native).
 * 
 * Renders a hierarchical tree using react-native-svg.
 * Receives pre-computed layout positions from @repo/graphics/treeLayout.
 */
export const VastuView: React.FC<PerspectiveViewProps> = ({
    data,
    layout,
    onNodePress,
    selectedNode,
    width: containerWidth,
    height: containerHeight,
}) => {
    const colors = useThemedColors();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle: any = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }
        ] as any
    }));

    // Generate SVG path for tree links (curved connectors)
    const renderLinks = () => {
        return data.nodes
            .filter(node => node.parentId)
            .map((node, i) => {
                const childPos = layout.positions.get(node.id);
                const parentPos = layout.positions.get(node.parentId!);
                
                if (!childPos || !parentPos) return null;

                // Create a curved path between parent and child
                const midY = (childPos.y + parentPos.y) / 2;
                const pathData = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${midY}, ${childPos.x} ${midY}, ${childPos.x} ${childPos.y}`;

                return (
                    <Path
                        key={`link-${node.id}`}
                        d={pathData}
                        stroke={colors.textTertiary}
                        strokeWidth={2}
                        strokeOpacity={0.2}
                        fill="none"
                    />
                );
            });
    };

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[{ flex: 1 }, animatedStyle] as any}>
                <Svg 
                    width={layout.bounds.width + 1000} 
                    height={layout.bounds.height + 1000} 
                    viewBox={`${layout.bounds.minX - 500} ${layout.bounds.minY - 500} ${layout.bounds.width + 1000} ${layout.bounds.height + 1000}`}
                >
                    {renderLinks()}

                    {data.nodes.map((node) => {
                        const pos = layout.positions.get(node.id);
                        if (!pos) return null;

                        const isSelected = selectedNode?.id === node.id;
                        const isPrimary = node.type === 'topic' || !node.parentId;

                        return (
                            <G key={node.id} onPress={() => onNodePress?.(node as any)}>
                                <Circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={isPrimary ? 20 : 12}
                                    fill={isSelected ? Theme.colors.sanctuarySaffron : (isPrimary ? colors.secondary : colors.textPrimary)}
                                    fillOpacity={isSelected ? 0.3 : 0.1}
                                />
                                <Circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={isPrimary ? 6 : 4}
                                    fill={isPrimary ? Theme.colors.sanctuarySaffron : colors.textPrimary}
                                    stroke={colors.primary}
                                    strokeWidth={2}
                                />
                                <SvgText
                                    x={pos.x}
                                    y={pos.y + (isPrimary ? 34 : 24)}
                                    fill={colors.textPrimary}
                                    fontSize={isPrimary ? 12 : 10}
                                    fontWeight={isPrimary ? "bold" : "normal"}
                                    textAnchor="middle"
                                    opacity={isSelected || isPrimary ? 1 : 0.7}
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
