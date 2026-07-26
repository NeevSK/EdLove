import type { PerspectiveViewProps } from '@repo/core/types';
import { Canvas, Circle, Line } from '@shopify/react-native-skia';
import type React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useThemedColors } from '@/hooks/useThemedColors';
import { Box } from '@/primitives';

/**
 * VastuView - The "Structural/Tree" Perspective.
 */
export const VastuView: React.FC<PerspectiveViewProps> = ({ data, layout, onNodePress }) => {
  const { isDark } = useTheme();
  const colors = useThemedColors();

  return (
    <Box className="flex-1 bg-phase-surface">
      <Canvas style={{ flex: 1 }}>
        {data.links.map((link: any, i: number) => {
          const sId = typeof link.source === 'string' ? link.source : link.source.id;
          const tId = typeof link.target === 'string' ? link.target : link.target.id;
          const s = layout.positions.get(sId);
          const t = layout.positions.get(tId);
          if (!s || !t) return null;
          return (
            <Line
              key={`link-${i}`}
              p1={{ x: s.x, y: s.y }}
              p2={{ x: t.x, y: t.y }}
              color={colors.border}
              strokeWidth={1}
              opacity={isDark ? 0.3 : 0.1}
            />
          );
        })}
        {data.nodes.map((node: any, i: number) => {
          const pos = layout.positions.get(node.id);
          if (!pos) return null;
          return (
            <Circle
              key={`node-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={node.type === 'topic' ? 12 : 8}
              color={node.type === 'topic' ? '#F6BF8C' : colors.action}
            />
          );
        })}
      </Canvas>
    </Box>
  );
};
