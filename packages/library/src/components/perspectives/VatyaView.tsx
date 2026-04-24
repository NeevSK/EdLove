import React from 'react';
import { 
    useTheme, 
    Box, 
    VStack, 
    Text 
} from '@repo/ui';
import { Svg, Polygon, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { PerspectiveViewProps } from '@repo/graphics';

/**
 * VatyaView  The "Radar / Cyclical" Perspective (Native).
 * 
 * Visualizes the topology as a Radar chart (Vatya = Whirlwind/Vortex).
 * Excellent for seeing multidimensional strengths of the dataset.
 */
export const VatyaView: React.FC<PerspectiveViewProps> = ({
    data,
}) => {
    const theme = useTheme();

    const actionColor = theme.accent.action;
    const textPrimary = theme.text.primary;
    const textSecondary = theme.text.secondary;

    // Radar Logic
    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;
    
    // Aggregate data into dimensions
    const dims = ['Nodes', 'Links', 'Topic', 'Resource', 'Concept'];
    const values = dims.map(d => {
        if (d === 'Nodes') return Math.min(100, (data.nodes.length / 20) * 100);
        if (d === 'Links') return Math.min(100, (data.links.length / 30) * 100);
        return Math.random() * 60 + 40; // Simulated metrics for others
    });

    // Calculate points
    const points = values.map((v, i) => {
        const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
        const r = (radius * v) / 100;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    });

    const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <VStack className="flex-1 items-center justify-center p-6 bg-transparent">
            <Box className="relative">
                <Svg height={size} width={size}>
                    <G>
                        {/* Background Circles (Webs) */}
                        {[0.2, 0.4, 0.6, 0.8, 1].map((p, i) => (
                            <Circle 
                                key={i}
                                cx={center}
                                cy={center}
                                r={radius * p}
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Axis Lines */}
                        {dims.map((_, i) => {
                            const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
                            return (
                                <Line 
                                    key={i}
                                    x1={center}
                                    y1={center}
                                    x2={center + radius * Math.cos(angle)}
                                    y2={center + radius * Math.sin(angle)}
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* The Data Polygon */}
                        <Polygon 
                            points={polygonPath}
                            fill={actionColor + '33'}
                            stroke={actionColor}
                            strokeWidth="3"
                        />

                        {/* Labels */}
                        {dims.map((d, i) => {
                            const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
                            const lx = center + (radius + 20) * Math.cos(angle);
                            const ly = center + (radius + 20) * Math.sin(angle);
                            return (
                                <SvgText
                                    key={i}
                                    x={lx}
                                    y={ly}
                                    fill={textPrimary}
                                    fontSize="12"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {d}
                                </SvgText>
                            );
                        })}
                    </G>
                </Svg>
            </Box>

            <VStack className="mt-8 items-center gap-2">
                <Text className="text-phaseText-primary font-bold text-xl uppercase tracking-widest text-center">
                    Vortex Resonance
                </Text>
                <Text className="text-sm text-phaseText-secondary text-center px-8">
                    Analyzing the high-dimensional balance of the current knowledge topology.
                </Text>
            </VStack>
        </VStack>
    );
};
