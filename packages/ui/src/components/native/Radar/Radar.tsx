import { Text as RNText, type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import type { RadarContract } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { describeRadar, radarGeometry } from '../../shared/radar';

export interface RadarProps extends RadarContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * Many dimensions of one person at once: their own areas, with `now` lit over a quiet `then`.
 * Below three axes it becomes a list, so it never draws a broken shape.
 */
export function Radar({ axes, series, label, missingLabel, size = 280, style }: RadarProps) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const caption = typeStyle(world.recipes.text.caption, language, world);
  const lines = describeRadar(axes, series, missingLabel);
  const geometry = radarGeometry(axes, series, size);

  if (geometry === null) {
    return (
      <View accessible accessibilityLabel={[label, ...lines].join('. ')} style={style}>
        {lines.map((line) => (
          <RNText key={line} style={[caption, { color: t.inkSoft }]}>
            {line}
          </RNText>
        ))}
      </View>
    );
  }

  return (
    <View
      accessible
      role="img"
      accessibilityLabel={[label, ...lines].join('. ')}
      style={[{ width: size, height: size }, style]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {geometry.rings.map((points) => (
          <Polygon key={points} points={points} fill="none" stroke={t.line} strokeWidth={1} />
        ))}
        {geometry.spokes.map((s) => (
          <Line
            key={s.axisId}
            x1={geometry.center}
            y1={geometry.center}
            x2={s.x}
            y2={s.y}
            stroke={t.line}
            strokeWidth={1}
          />
        ))}
        {geometry.shapes.map((shape) =>
          shape.emphasis === 'then' ? (
            <Polygon
              key={shape.seriesId}
              points={shape.points}
              fill="none"
              stroke={t.inkSoft}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          ) : (
            <Polygon
              key={shape.seriesId}
              points={shape.points}
              fill={t.lamp}
              fillOpacity={0.22}
              stroke={t.lamp}
              strokeWidth={2}
            />
          ),
        )}
        {geometry.shapes
          .filter((shape) => shape.emphasis === 'now')
          .flatMap((shape) =>
            shape.vertices.map((v) => (
              <Circle key={`${shape.seriesId}-${v.axisId}`} cx={v.x} cy={v.y} r={3} fill={t.lamp} />
            )),
          )}
        {geometry.labels.map((l) => (
          <SvgText
            key={l.axisId}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor}
            alignmentBaseline="middle"
            fill={t.ink}
            fontSize={caption.fontSize}
            fontFamily={caption.fontFamily}
          >
            {l.text}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
