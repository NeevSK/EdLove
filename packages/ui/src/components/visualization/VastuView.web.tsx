import type { PerspectiveViewProps } from '@repo/core/types';
import type React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useThemedColors } from '../../hooks/useThemedColors';
import { Box } from '../../primitives';

/**
 * VastuView.web - Web-sovereign structural view.
 * Prevents skia dependency leakage on web.
 */
export const VastuView: React.FC<PerspectiveViewProps> = ({ data, layout, onNodePress }) => {
  const { isDark } = useTheme();
  const colors = useThemedColors();

  return (
    <Box className="flex-1 bg-phase-surface">
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        {data.links.map((link: any, i: number) => {
          const sId = typeof link.source === 'string' ? link.source : link.source.id;
          const tId = typeof link.target === 'string' ? link.target : link.target.id;
          const s = layout.positions.get(sId);
          const t = layout.positions.get(tId);
          if (!s || !t) return null;
          return (
            <line
              key={`link-${i}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={colors.border}
              strokeWidth={1}
              opacity={isDark ? 0.3 : 0.1}
            />
          );
        })}
        {data.nodes.map((node: any, i: number) => {
          const pos = layout.positions.get(node.id);
          if (!pos) return null;
          return (
            <circle
              key={`node-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={node.type === 'topic' ? 12 : 8}
              fill={node.type === 'topic' ? '#F6BF8C' : colors.action}
              style={{ cursor: 'pointer' }}
              onClick={() => onNodePress?.(node)}
            />
          );
        })}
      </svg>
    </Box>
  );
};
