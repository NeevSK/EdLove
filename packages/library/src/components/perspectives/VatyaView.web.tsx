import React from 'react';
import { useThemedColors, Theme, Box, useResponsive } from '@repo/ui';
import { radarLayout } from '@repo/graphics';
import type { PerspectiveViewProps } from '@repo/graphics';

/**
 * VatyaView.web  The "Whirlwind" Radar Perspective (Web).
 * 
 * Achieves isomorphic parity with the native version using standard SVG.
 */
export const VatyaView: React.FC<PerspectiveViewProps> = ({
    selectedNode,
}) => {
    const colors = useThemedColors();
    const { width, height } = useResponsive();

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
        <Box className="flex-1 w-full h-full items-center justify-center">
            <svg width="100%" height="70%" viewBox={`0 0 ${width} ${height * 0.7}`}>
                <g>
                    {/* Scale Circles */}
                    {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
                        <circle
                            key={`circle-${scale}`}
                            cx={layout.center.x}
                            cy={layout.center.y}
                            r={layout.radius * scale}
                            fill="none"
                            stroke={colors.border}
                            strokeWidth="1"
                            opacity="0.2"
                        />
                    ))}

                    {/* Axes */}
                    {layout.axes.map((axis, i) => (
                        <g key={`axis-${i}`}>
                            <line
                                x1={layout.center.x}
                                y1={layout.center.y}
                                x2={axis.x}
                                y2={axis.y}
                                stroke={colors.border}
                                strokeWidth="1"
                                opacity="0.3"
                            />
                            <text
                                x={axis.x}
                                y={axis.y + (axis.y > layout.center.y ? 20 : -10)}
                                fill={colors.textSecondary}
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {axis.attribute}
                            </text>
                        </g>
                    ))}

                    {/* Polygon */}
                    <polygon
                        points={polygonPoints}
                        fill={`${Theme.colors.sanctuarySaffron}40`}
                        stroke={Theme.colors.sanctuarySaffron}
                        strokeWidth="3"
                        style={{ transition: 'all 0.5s ease' }}
                    />

                    {/* Points */}
                    {layout.points.map((p, i) => (
                        <circle
                            key={`point-${i}`}
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill={Theme.colors.sanctuarySaffron}
                            stroke={colors.obsidian}
                            strokeWidth="2"
                        />
                    ))}
                </g>
            </svg>
        </View>
    );
};


