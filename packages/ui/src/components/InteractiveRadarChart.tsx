import type React from 'react';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { View } from '../primitives';
import { Theme } from '../theme/Theme';

export interface RadarDimension {
  key: string;
  label: string;
  value: number; // 0-100
}

interface InteractiveRadarChartProps {
  dimensions: RadarDimension[];
  size?: number;
  editable?: boolean;
  onChange?: (key: string, newValue: number) => void;
}

/**
 * A beautiful, interactive Radar Chart for student analysis.
 * Uses the Sanctuary Saffron aesthetic with glassmorphic touches.
 */
export const InteractiveRadarChart: React.FC<InteractiveRadarChartProps> = ({
  dimensions,
  size = 300,
  editable = false,
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) * 0.7; // Leave space for labels
  const angleStep = (Math.PI * 2) / dimensions.length;

  // Calculate vertex positions for the background polygon (max values)
  const bgPoints = useMemo(() => {
    return dimensions.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
  }, [centerX, centerY, radius, angleStep, dimensions.map]);

  // Calculate vertex positions for the data polygon
  const dataPoints = useMemo(() => {
    return dimensions.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const distance = (d.value / 100) * radius;
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
      };
    });
  }, [dimensions, centerX, centerY, radius, angleStep]);

  const polygonPointsString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const bgPolygonPointsString = bgPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Grid - Circular Levels */}
        {[20, 40, 60, 80, 100].map((level) => (
          <Polygon
            key={`level-${level}`}
            points={bgPoints
              .map((p) => {
                const dist = level / 100;
                const x = centerX + (p.x - centerX) * dist;
                const y = centerY + (p.y - centerY) * dist;
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke={Theme.colors.border}
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Axis Lines */}
        {bgPoints.map((p, i) => {
          const dimensionKey = dimensions[i]?.key ?? `axis-${p.x}-${p.y}`;
          return (
            <Line
              key={`axis-${dimensionKey}`}
              x1={centerX}
              y1={centerY}
              x2={p.x}
              y2={p.y}
              stroke={Theme.colors.border}
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}

        {/* Background Full Polygon */}
        <Polygon points={bgPolygonPointsString} fill={Theme.colors.linen} opacity={0.1} />

        {/* Data Polygon */}
        <Polygon
          points={polygonPointsString}
          fill={Theme.colors.sanctuarySaffron}
          fillOpacity={0.3}
          stroke={Theme.colors.sanctuarySaffron}
          strokeWidth="2"
        />

        {/* Vertices and Labels */}
        {dataPoints.map((p, i) => {
          const dim = dimensions[i];
          if (!dim) return null;

          // Label positioning
          const labelDist = radius + 20;
          const angle = i * angleStep - Math.PI / 2;
          const labelX = centerX + Math.cos(angle) * labelDist;
          const labelY = centerY + Math.sin(angle) * labelDist;

          return (
            <G key={`vertex-group-${dim.key}`}>
              {/* Label */}
              <SvgText
                x={labelX}
                y={labelY}
                fill={Theme.colors.textSecondary}
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {dim.label}
              </SvgText>

              {/* Interaction point */}
              <Circle
                cx={p.x}
                cy={p.y}
                r={editable ? 6 : 4}
                fill={Theme.colors.sanctuarySaffron}
                stroke="white"
                strokeWidth="1"
              />
            </G>
          );
        })}
      </Svg>

      {/* Glow Effect Overlay (subtle) */}
      <View
        pointerEvents="none"
        style={[styles.glow, { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    backgroundColor: Theme.colors.sanctuarySaffron,
    opacity: 0.05,
    zIndex: -1,
  },
});
