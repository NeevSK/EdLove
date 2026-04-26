import React from 'react';
import { useThemedColors, Theme, Box, useResponsive } from '@repo/ui';
import type { 
    PerspectiveViewProps 
} from '@repo/graphics';

/**
 * VastuView.web  The "Mind Map" Perspective (Web).
 * 
 * Renders hierarchical mind maps using web-standard SVG.
 */
export const VastuView: React.FC<PerspectiveViewProps> = ({
    data,
    layout,
    onNodePress,
}) => {
    const colors = useThemedColors();
    const { width, height } = useResponsive();

    return (
        <Box className="flex-1 w-full h-full">
            <svg 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${width} ${height}`}
            >
                {/* Connecting Links (Bezier Curves) */}
                {data.links.map((link, i) => {
                    const sourcePos = typeof link.source === 'string' ? layout.positions.get(link.source) : (link.source as any);
                    const targetPos = typeof link.target === 'string' ? layout.positions.get(link.target) : (link.target as any);
                    
                    if (sourcePos?.x == null || sourcePos?.y == null || targetPos?.x == null || targetPos?.y == null) return null;

                    return (
                        <path
                            key={`path-${i}`}
                            d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${targetPos.x - 50} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                            stroke={colors.action}
                            strokeWidth={2}
                            fill="none"
                            opacity={0.3}
                        />
                    );
                })}

                {/* Nodes */}
                {data.nodes.map((node) => {
                    const pos = layout.positions.get(node.id);
                    if (!pos) return null;

                    return (
                        <g 
                            key={node.id} 
                            onClick={() => onNodePress?.(node)}
                            style={{ cursor: 'pointer' }}
                        >
                            <rect
                                x={pos.x - 50}
                                y={pos.y - 15}
                                width={100}
                                height={30}
                                rx={15}
                                fill={colors.secondary}
                                stroke={colors.action}
                                strokeWidth={1}
                            />
                            <text
                                x={pos.x}
                                y={pos.y + 5}
                                textAnchor="middle"
                                fill={colors.text}
                                fontSize="12"
                                fontWeight="bold"
                            >
                                {node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </View>
    );
};


