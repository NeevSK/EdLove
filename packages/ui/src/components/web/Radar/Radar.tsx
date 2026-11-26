import type { RadarContract } from '../../../theme/contracts';
import { describeRadar, radarGeometry } from '../../shared/radar';
import { cx } from '../cx';

export interface RadarProps extends RadarContract {
  className?: string;
}

/**
 * Many dimensions of one person at once: their own areas, with `now` lit over a quiet `then`.
 * The same words as the native chart are offered to screen readers as a list. Below three axes
 * the list is all that shows.
 */
export function Radar({ axes, series, label, missingLabel, size = 280, className }: RadarProps) {
  const lines = describeRadar(axes, series, missingLabel);
  const geometry = radarGeometry(axes, series, size);
  const list = (
    <ul className={cx('gd-radar-list', geometry !== null && 'gd-visually-hidden')}>
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );

  return (
    <figure className={cx('gd-radar', className)} style={{ maxWidth: size }}>
      <figcaption className="gd-visually-hidden">{label}</figcaption>
      {geometry === null ? null : (
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" aria-hidden="true" focusable="false">
          {geometry.rings.map((points) => (
            <polygon key={points} points={points} className="gd-radar-ring" />
          ))}
          {geometry.spokes.map((s) => (
            <line
              key={s.axisId}
              x1={geometry.center}
              y1={geometry.center}
              x2={s.x}
              y2={s.y}
              className="gd-radar-ring"
            />
          ))}
          {geometry.shapes.map((shape) => (
            <polygon
              key={shape.seriesId}
              points={shape.points}
              className={`gd-radar-shape gd-radar-${shape.emphasis}`}
            />
          ))}
          {geometry.shapes
            .filter((shape) => shape.emphasis === 'now')
            .flatMap((shape) =>
              shape.vertices.map((v) => (
                <circle
                  key={`${shape.seriesId}-${v.axisId}`}
                  cx={v.x}
                  cy={v.y}
                  r={3}
                  className="gd-radar-dot"
                />
              )),
            )}
          {geometry.labels.map((l) => (
            <text
              key={l.axisId}
              x={l.x}
              y={l.y}
              textAnchor={l.anchor}
              dominantBaseline="middle"
              className="gd-radar-label"
            >
              {l.text}
            </text>
          ))}
        </svg>
      )}
      {list}
    </figure>
  );
}
