import type { GraphNode, KnowledgeTopology, PerspectiveViewProps } from '@repo/graphics';
import { Box, useResponsive, useThemedColors } from '@repo/ui';
import type React from 'react';

/**
 * AstroView.web  The "Cosmos" Perspective (Web).
 *
 * Uses standard SVG but leverages d3-selection for high-performance
 * live physics if needed, or static rendering from our engine.
 */
export const AstroView: React.FC<PerspectiveViewProps> = ({
  data,
  layout,
  onNodePress,
  selectedNode,
}) => {
  const colors = useThemedColors();
  const { width, height } = useResponsive();

  return (
    <Box className="flex-1 w-full h-full">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Links */}
        {data.links.map((link, i) => {
          const sourcePos =
            typeof link.source === 'string'
              ? layout.positions.get(link.source)
              : (link.source as any);
          const targetPos =
            typeof link.target === 'string'
              ? layout.positions.get(link.target)
              : (link.target as any);

          if (
            sourcePos?.x == null ||
            sourcePos?.y == null ||
            targetPos?.x == null ||
            targetPos?.y == null
          )
            return null;

          return (
            <line
              key={`link-${i}`}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke={colors.action}
              strokeWidth={1}
              opacity={0.2}
            />
          );
        })}

        {/* Nodes */}
        {data.nodes.map((node) => {
          const pos = layout.positions.get(node.id);
          if (!pos) return null;

          const isSelected = selectedNode?.id === node.id;

          return (
            <g key={node.id} onClick={() => onNodePress?.(node)} style={{ cursor: 'pointer' }}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 10 : 6}
                fill={isSelected ? colors.action : colors.secondary}
                stroke={colors.action}
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y + 20}
                textAnchor="middle"
                fill={colors.text}
                fontSize="10"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
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
