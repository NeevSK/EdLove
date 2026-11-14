import type { MiniChartContract } from '../../../theme/contracts';
import { miniChartShape } from '../../../theme/miniChart';

export interface MiniChartProps extends MiniChartContract {
  width?: number;
  height?: number;
  className?: string;
}

/** A line or a few bars, small enough for a tile or a sentence; read as its summary. */
export function MiniChart({
  values,
  kind = 'line',
  summary,
  mark,
  range,
  width = 96,
  height = 28,
  className,
}: MiniChartProps) {
  const shape = miniChartShape(values, width, height, { mark, range });
  const markAt = mark ?? values.length - 1;
  return (
    <svg
      role="img"
      aria-label={summary}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={['gd-minichart', className].filter(Boolean).join(' ')}
      data-kind={kind}
    >
      {kind === 'line' ? (
        <>
          <path d={shape.line} className="gd-minichart-line" />
          {shape.mark ? (
            <circle cx={shape.mark.x} cy={shape.mark.y} r={3} className="gd-minichart-mark" />
          ) : null}
        </>
      ) : (
        shape.bars.map((b, i) => (
          <rect
            // biome-ignore lint/suspicious/noArrayIndexKey: bars are positions, not items
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={1}
            className={i === markAt ? 'gd-minichart-mark' : 'gd-minichart-bar'}
          />
        ))
      )}
    </svg>
  );
}
