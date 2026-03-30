import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, G, Circle } from 'react-native-svg';
import { useThemedColors, Theme } from '@repo/ui';
import { radarLayout } from '@repo/graphics';
import type { PerspectiveViewProps } from '@repo/graphics';

/**
 * VatyaView  The "Whirlwind" Radar Perspective (Native).
 * 
 * Visualizes multi-dimensional student resonance data.
 * Ideal for student potential analysis.
 */
export const VatyaView: React.FC<PerspectiveViewProps> = ({
    selectedNode,
}) => {
    const colors = useThemedColors();
    const { width, height } = useWindowDimensions();

    // Use selectedNode or a fallback demonstration node
    const activeNode = selectedNode || {
        id: 'demo',
        label: 'Student Potential',
        metadata: {
            attributes: {
                "Logic": 0.8,
                "Empathy": 0.6,
                "Resonance": 0.9,
                "Focus": 0.7,
                "Creative": 0.85
            }
        }
    };

    const layout = radarLayout(activeNode, { width, height: height * 0.7 });
    
    const polygonPoints = layout.points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <View style={styles.container}>
            <Svg width={width} height={height * 0.7}>
                <G>
                    {/* Concentric Circles (Scale) */}
                    {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
                        <Circle>
                            key={`circle-${scale}`}
                            cx={layout.center.x}
                            cy={layout.center.y}
                            r={layout.radius * scale}
                            fill="none"
                            stroke={colors.border}
                            strokeWidth={1}
                            opacity={0.2}
                        /
                    ))}

                    {/* Axes */}
                    {layout.axes.map((axis, i) => (
                        <G key={`axis-${i}`}>
                            <Line/>
                                x1={layout.center.x}
                                y1={layout.center.y}
                                x2={axis.x}
                                y2={axis.y}
                                stroke={colors.border}
                                strokeWidth={1}
                                opacity={0.3}
                            /
                            <SvgText>
                                x={axis.x}
                                y={axis.y + (axis.y > layout.center.y ? 20 : -10)}
                                fill={colors.textSecondary}
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="middle"
                            
                                {axis.attribute}
                            </SvgText>
                        </G>
                    ))}

                    {/* The Data Polygon */}
                    <Polygon>
                        points={polygonPoints}
                        fill={`${Theme.colors.sanctuarySaffron}40`}
                        stroke={Theme.colors.sanctuarySaffron}
                        strokeWidth={3}
                    /

                    {/* Data Points */}
                    {layout.points.map((p, i) => (
                        <Circle>
                            key={`point-${i}`}
                            cx={p.x}
                            cy={p.y}
                            r={5}
                            fill={Theme.colors.sanctuarySaffron}
                            stroke={colors.obsidian}
                            strokeWidth={2}
                        /
                    ))}
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    }
});
