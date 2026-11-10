import type { CSSProperties, ReactNode } from 'react';
import type { WaitingSignContract } from '../../../theme/contracts';
import { SIGN_CYCLE_MS, type SignKind } from '../../../theme/signs';

const ph = (phase: number) => ({ '--ph': phase }) as CSSProperties;

/** One drawing per sign; the motion lives in kitCss (`.gd-s-*`). */
const DRAW: Readonly<Record<SignKind, () => ReactNode>> = {
  flame: () => (
    <>
      <span className="gd-s-glow" />
      <span className="gd-s-flame" />
    </>
  ),
  ripple: () => (
    <>
      <span className="gd-s-ring" style={ph(0)} />
      <span className="gd-s-ring" style={ph(0.5)} />
      <span className="gd-s-core" />
    </>
  ),
  glint: () => (
    <span className="gd-s-gem">
      <span className="gd-s-facet" />
      <span className="gd-s-sweep" />
    </span>
  ),
  leaf: () => <span className="gd-s-leaf" />,
  rows: () => (
    <span className="gd-s-rows">
      {[0, 1, 2].map((i) => (
        <span key={i} className="gd-s-bar">
          <span className="gd-s-fill" />
        </span>
      ))}
    </span>
  ),
  band: () => (
    <span className="gd-s-band">
      <span className="gd-s-rule" style={ph(0)} />
      <span className="gd-s-diamond" />
      <span className="gd-s-rule" style={ph(0.1)} />
    </span>
  ),
  lamp: () => (
    <span className="gd-s-lampstand">
      <span className="gd-s-wick" />
      <span className="gd-s-stem" />
      <span className="gd-s-base" />
    </span>
  ),
  beat: () => (
    <span className="gd-s-dots">
      {(['lamp', 'ornament', 'lamp'] as const).map((ink, i) => (
        // A struck beat travels left to right: each dot lags the one before by a third.
        <span key={i} className="gd-s-dot" data-ink={ink} style={ph((3 - i) / 3)} />
      ))}
    </span>
  ),
  petal: () => (
    <>
      <span className="gd-s-bloom">
        {[0, 72, 144, 216, 288].map((turn) => (
          <span
            key={turn}
            className="gd-s-petal"
            style={{ '--turn': `${turn}deg` } as CSSProperties}
          />
        ))}
      </span>
      <span className="gd-s-heart" />
    </>
  ),
  signal: () => (
    <span className="gd-s-dots" data-square="">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="gd-s-dot" style={ph((4 - i) / 4)} />
      ))}
    </span>
  ),
  dots: () => (
    <span className="gd-s-dots">
      {[0, 1, 2].map((i) => (
        <span key={i} className="gd-s-dot" style={ph((3 - i) / 3)} />
      ))}
    </span>
  ),
  charge: () => (
    <span className="gd-s-charge">
      <span className="gd-s-cell">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="gd-s-seg" />
        ))}
      </span>
      <span className="gd-s-tip" />
    </span>
  ),
};

const ALL = Object.keys(SIGN_CYCLE_MS) as SignKind[];

export type WaitingSignProps = WaitingSignContract;

/**
 * The world's waiting sign. Decorative: put the words ("Loading") on the
 * element around it, as `WorldLoading` does. Without `kind` every sign is in
 * the markup and the stylesheet shows the active world's, so the sign follows
 * a world change on <html> with no JavaScript.
 */
export function WaitingSign({ size = 40, kind, still = false }: WaitingSignProps) {
  const kinds = kind ? [kind] : ALL;
  return (
    <span
      className="gd-sign"
      aria-hidden="true"
      data-auto={kind ? undefined : ''}
      data-still={still || undefined}
      style={{ '--s': `${size}px` } as CSSProperties}
    >
      {kinds.map((k) => (
        <span key={k} className="gd-s" data-sign={k}>
          {DRAW[k]()}
        </span>
      ))}
    </span>
  );
}
