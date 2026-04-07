import React from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureUpdateEvent, PinchGestureHandlerEventPayload, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { Theme, useThemedColors } from '@repo/ui';
import { 
    PerspectiveViewProps, 
    GraphNode, 
} from '@repo/graphics';

/**
 * VastuView  The "Mind Map / Structure" Perspective (Native).
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
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                <Svg 
                    width={layout.bounds.width + 1000} 
                    height={layout.bounds.height + 1000} 
                    viewBox={`${layout.bounds.minX - 500} ${layout.bounds.minY - 500} ${layout.bounds.width + 1000} ${layout.bounds.height + 1000}`}
                >
                    <G>
                        {renderLinks()}
                        
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
                                        r={isSelected ? 12 : 8}
                                        fill={colors.card}
                                        stroke={isSelected ? Theme.colors.sanctuarySaffron : colors.textTertiary}
                                        strokeWidth={isSelected ? 3 : 2}
                                    />
                                    <SvgText
                                        x={pos.x}
                                        y={pos.y + 25}
                                        fontSize="10"
                                        fill={colors.text}
                                        textAnchor="middle"
                                        fontWeight={isSelected ? "bold" : "normal"}
                                    >
                                        {node.label}
                                    </SvgText>
                                </G>
                            );
                        })}
                    </G>
                </Svg>
            </Animated.View>
        </GestureDetector>
    );
};
