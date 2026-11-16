'use client';

import { useId } from 'react';
import type { RadarContract } from '../../../theme/contracts';
import { projectRadar } from '../../shared/radarGeometry';
import { EmptyState, ErrorState } from '../States/States';
import { Surface } from '../Surface/Surface';
import { Text } from '../Text/Text';
import { WorldLoading } from '../Waiting/Waiting';
import { cx } from '../cx';

export interface RadarProps extends RadarContract {
  className?: string;
}

export function Radar({ label, state, onRetry, retryLabel = 'Try again', className }: RadarProps) {
  const titleId = useId();
  const projection = state.kind === 'ready' ? projectRadar(state.observation) : null;
  if (state.kind !== 'ready' || projection?.kind !== 'ready') {
    const message =
      state.kind === 'ready'
        ? 'This observation cannot be displayed.'
        : state.kind === 'loading'
          ? (state.message ?? 'Loading observation…')
          : state.message;
    return (
      <Surface tone="raised" className={cx('gd-radar', className)} aria-labelledby={titleId}>
        <Text as="h2" kind="title" id={titleId}>
          {label}
        </Text>
        {state.kind === 'loading' ? (
          <WorldLoading label={message} />
        ) : state.kind === 'error' || state.kind === 'ready' ? (
          <ErrorState
            title="Observation unavailable"
            message={message}
            retry={
              state.kind === 'error' && onRetry
                ? { label: retryLabel, onPress: onRetry }
                : undefined
            }
          />
        ) : (
          <EmptyState
            title={
              state.kind === 'denied'
                ? 'Access unavailable'
                : state.kind === 'empty'
                  ? 'No observation yet'
                  : 'Measure unavailable'
            }
            message={message}
          />
        )}
      </Surface>
    );
  }
  const observation = projection.observation;
  return (
    <Surface tone="raised" className={cx('gd-radar', className)} aria-labelledby={titleId}>
      <Text as="h2" kind="title" id={titleId}>
        {label}
      </Text>
      <Text>
        {observation.subject.label} · {observation.measure.label} · Version{' '}
        {observation.measure.version}
      </Text>
      <Text kind="caption">
        {observation.perspective.label} ({observation.perspective.kind}) · {observation.sourceLabel}
      </Text>
      {observation.observedAt ? (
        <Text kind="caption">Observed: {observation.observedAt}</Text>
      ) : null}
      {observation.synthetic ? <Text kind="label">Example data</Text> : null}
      {observation.stale ? (
        <Text kind="label">Historical observation — may no longer reflect the present</Text>
      ) : null}
      {projection.plot ? (
        <svg
          className="gd-radar-plot"
          viewBox={projection.viewBox}
          aria-hidden="true"
          focusable="false"
        >
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon
              key={scale}
              className="gd-radar-grid"
              points={projection.axes
                .map(
                  (axis) => `${50 + (axis.end.x - 50) * scale},${50 + (axis.end.y - 50) * scale}`,
                )
                .join(' ')}
            />
          ))}
          {projection.polygonPoints ? <polygon className="gd-radar-area" points={projection.polygonPoints} /> : null}
          {projection.axes.map((axis) => (
            <g key={axis.id}>
              <line className="gd-radar-grid" x1="50" y1="50" x2={axis.end.x} y2={axis.end.y} />
              <text
                className="gd-radar-number"
                x={axis.labelPoint.x}
                y={axis.labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {axis.index + 1}
              </text>
              {axis.point ? (
                <circle className="gd-radar-point" cx={axis.point.x} cy={axis.point.y} r="1.3" />
              ) : null}
            </g>
          ))}
          {projection.edges.map((edge, index) => (
            <line
              key={index}
              className="gd-radar-value"
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
            />
          ))}
        </svg>
      ) : (
        <Text kind="caption">
          Values are shown below. Plotting requires at least three dimensions and an explicit
          measure-owned comparison policy.
        </Text>
      )}
      {projection.axes.length === 0 ? <Text>No dimensions recorded.</Text> : null}
      <table className="gd-radar-table">
        <caption>{label} — recorded values</caption>
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            <th scope="col">Value</th>
            <th scope="col">Range</th>
          </tr>
        </thead>
        <tbody>
          {projection.axes.map((axis) => (
            <tr key={axis.id}>
              <th scope="row">
                {axis.index + 1}. {axis.label}
              </th>
              <td>
                {axis.value === null
                  ? 'Not recorded'
                  : `${axis.value}${axis.unit ? ` ${axis.unit}` : ''}`}
              </td>
              <td>
                {axis.min}–{axis.max}
                {axis.unit ? ` ${axis.unit}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  );
}
