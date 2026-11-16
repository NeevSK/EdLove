import { Fragment } from 'react';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { RadarContract } from '../../../theme/contracts';
import { useWorld } from '../../../theme/native/WorldContext';
import { projectRadar } from '../../shared/radarGeometry';
import { EmptyState, ErrorState } from '../States/States';
import { Surface } from '../Surface/Surface';
import { Text } from '../Text/Text';
import { WorldLoading } from '../Waiting/Waiting';

export interface RadarProps extends RadarContract {
  style?: StyleProp<ViewStyle>;
}

const formatValue = (value: number | null, unit?: string) =>
  value === null ? 'Not recorded' : `${value}${unit ? ` ${unit}` : ''}`;

const formatRange = (min: number, max: number, unit?: string) =>
  `${min}–${max}${unit ? ` ${unit}` : ''}`;

/** A read-only native radar. It renders caller-supplied observations without fetching or editing them. */
export function Radar({ label, state, onRetry, retryLabel = 'Try again', style }: RadarProps) {
  const world = useWorld();
  const recipe = world.recipes.radar;

  if (state.kind === 'loading') {
    return <WorldLoading label={state.message ?? 'Loading radar observation'} style={style} />;
  }

  if (state.kind !== 'ready') {
    if (state.kind === 'error') {
      return (
        <ErrorState
          title="Could not load radar"
          message={state.message}
          retry={onRetry ? { label: retryLabel, onPress: onRetry } : undefined}
          style={style}
        />
      );
    }
    const title = {
      empty: 'No observation',
      unavailable: 'Radar unavailable',
      denied: 'Access unavailable',
    }[state.kind];
    return <EmptyState title={title} message={state.message} style={style} />;
  }

  const projection = projectRadar(state.observation);
  if (projection.kind === 'invalid') {
    return (
      <ErrorState
        title="Radar unavailable"
        message="The supplied observation cannot be displayed."
        style={style}
      />
    );
  }

  const observation = projection.observation;
  const metadata = [
    `${observation.perspective.label} (${observation.perspective.kind})`,
    observation.sourceLabel,
    observation.observedAt ? `Observed ${observation.observedAt}` : 'Observation time not supplied',
  ];

  return (
    <Surface tone="raised" style={[styles.card, style]}>
      <Text kind="title" accessibilityRole="header">{label}</Text>
      <Text kind="label">{observation.subject.label}</Text>
      <Text kind="body">
        {observation.measure.label} · {observation.measure.version}
      </Text>
      <Text kind="caption">{metadata.join(' · ')}</Text>
      {observation.synthetic ? <Text kind="label">Example data · synthetic</Text> : null}
      {observation.stale ? <Text kind="label">This observation may be out of date.</Text> : null}

      {projection.plot ? (
        <Svg
          width="100%"
          height={280}
          viewBox={projection.viewBox}
          preserveAspectRatio="xMidYMid meet"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.chart}
        >
          {[0.25, 0.5, 0.75, 1].map((fraction) => (
            <Circle
              key={`ring-${fraction}`}
              cx={projection.center.x}
              cy={projection.center.y}
              r={projection.radius * fraction}
              fill="none"
              stroke={recipe.grid}
              strokeWidth={recipe.gridWidth}
            />
          ))}
          {projection.axes.map((axis) => (
            <Line
              key={`spoke-${axis.id}`}
              x1={projection.center.x}
              y1={projection.center.y}
              x2={axis.end.x}
              y2={axis.end.y}
              stroke={recipe.grid}
              strokeWidth={recipe.gridWidth}
            />
          ))}
          {projection.polygonPoints ? (
            <Polygon
              points={projection.polygonPoints}
              fill={recipe.stroke}
              fillOpacity={0.16}
              stroke={recipe.stroke}
              strokeWidth={recipe.strokeWidth}
            />
          ) : null}
          {!projection.complete ? projection.edges.map((edge, index) => (
            <Line
              key={`edge-${index}`}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              stroke={recipe.stroke}
              strokeWidth={recipe.strokeWidth}
            />
          )) : null}
          {projection.axes.map((axis) => (
            <Fragment key={axis.id}>
              {axis.point ? (
                <Circle
                  key={`point-${axis.id}`}
                  cx={axis.point.x}
                  cy={axis.point.y}
                  r={recipe.pointRadius}
                  fill={recipe.point}
                />
              ) : null}
              <SvgText
                key={`label-${axis.id}`}
                x={axis.labelPoint.x}
                y={axis.labelPoint.y}
                fill={world.tokens.ink}
                fontSize={recipe.labelSize}
                textAnchor="middle"
              >
                {axis.index + 1}
              </SvgText>
            </Fragment>
          ))}
        </Svg>
      ) : projection.axes.length === 0 ? (
        <Text kind="caption">No dimensions recorded.</Text>
      ) : (
        <Text kind="caption">A plotted radar needs at least three axes. Values are listed below.</Text>
      )}

      <View style={styles.values}>
        {projection.axes.map((axis) => (
          <Text key={axis.id} kind="body">
            {axis.index + 1}. {axis.label}: {formatValue(axis.value, axis.unit)} · range {formatRange(axis.min, axis.max, axis.unit)}
          </Text>
        ))}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  chart: { alignSelf: 'center', overflow: 'visible' },
  values: { gap: 4 },
});
