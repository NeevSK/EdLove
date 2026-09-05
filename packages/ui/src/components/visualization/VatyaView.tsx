import type { PerspectiveViewProps } from '@repo/core/types';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { Box } from '@repo/ui/primitives';
import type React from 'react';
import { Circle, Path, Svg } from 'react-native-svg';

/**
 * VatyaView - The "Flow/Transition" Perspective.
 */
export const VatyaView: React.FC<PerspectiveViewProps> = ({ data, layout, onNodePress }) => {
  const { isDark } = useTheme();
  const colors = useThemedColors();

  return (
    <Box className="flex-1 bg-phase-surface">
      <Svg style={{ flex: 1 }}>
        {data.links.map((link: any, i: number) => {
          const sId = typeof link.source === 'string' ? link.source : link.source.id;
          const tId = typeof link.target === 'string' ? link.target : link.target.id;
          const s = layout.positions.get(sId);
          const t = layout.positions.get(tId);
          if (!s || !t) return null;
          const d = `M ${s.x} ${s.y} C ${s.x + 50} ${s.y}, ${t.x - 50} ${t.y}, ${t.x} ${t.y}`;
          return (
            <Path
              key={`link-${i}`}
              d={d}
              fill="none"
              stroke={colors.border}
              strokeWidth={2}
              opacity={isDark ? 0.3 : 0.1}
            />
          );
        })}
        {data.nodes.map((node: any, i: number) => {
          const pos = layout.positions.get(node.id);
          if (!pos) return null;
          return <Circle key={`node-${i}`} cx={pos.x} cy={pos.y} r={10} fill={colors.action} />;
        })}
      </Svg>
    </Box>
  );
};
