import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { MiniChartContract } from '../../../theme/contracts';
import { miniChartShape } from '../../../theme/miniChart';
import { useWorld } from '../../../theme/native/WorldContext';

export interface MiniChartProps extends MiniChartContract {
  width?: number;
  height?: number;
  testID?: string;
}

/**
 * A line or a few bars, small enough for a tile or a sentence. It is one
 * image to a screen reader, read as its summary; the marked value is lit, the
 * rest in soft ink, so colour is never the only thing that tells them apart
 * (the mark is also larger).
 */
export function MiniChart({
  values,
  kind = 'line',
  summary,
  mark,
  range,
  width = 96,
  height = 28,
  testID,
}: MiniChartProps) {
  const t = useWorld().tokens;
  const shape = miniChartShape(values, width, height, { mark, range });
  const markAt = mark ?? values.length - 1;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
      style={{ width, height }}
      testID={testID}
    >
      <Svg width={width} height={height} pointerEvents="none">
        {kind === 'line' ? (
          <>
            <Path
              d={shape.line}
              stroke={t.inkSoft}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {shape.mark ? <Circle cx={shape.mark.x} cy={shape.mark.y} r={3} fill={t.lamp} /> : null}
          </>
        ) : (
          shape.bars.map((b, i) => (
            <Rect
              // biome-ignore lint/suspicious/noArrayIndexKey: bars are positions, not items
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={1}
              fill={i === markAt ? t.lamp : t.inkSoft}
            />
          ))
        )}
      </Svg>
    </View>
  );
}
