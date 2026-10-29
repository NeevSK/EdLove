import type { CSSProperties } from 'react';
import type { RowContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface RowProps extends RowContract {
  /** Link rows render as <a>. */
  href?: string;
  className?: string;
  style?: CSSProperties;
}

export function Row({
  label,
  detail,
  note,
  accessory,
  onPress,
  href,
  signal = false,
  signalLabel,
  chevron,
  className,
  style,
}: RowProps) {
  const pressable = !!onPress || !!href;
  const showChevron = chevron ?? (pressable && !accessory);
  const body = (
    <>
      <span className="gd-row-line">
        <span className="gd-row-label">{label}</span>
        {accessory ??
          (detail || showChevron || signal ? (
            <span className="gd-row-detail">
              {signal ? <span className="gd-row-signal" aria-hidden="true" /> : null}
              {detail ? <span>{detail}</span> : null}
              {signal && signalLabel ? <span className="gd-sr">{signalLabel}</span> : null}
              {showChevron ? (
                <span className="gd-row-chevron" aria-hidden="true">
                  ›
                </span>
              ) : null}
            </span>
          ) : null)}
      </span>
      {note ? <span className="gd-row-note">{note}</span> : null}
    </>
  );
  const common = {
    className: cx('gd-row', className),
    style,
    'data-signal': signal || undefined,
  };
  if (href) {
    return (
      <a href={href} {...common} data-pressable="">
        {body}
      </a>
    );
  }
  if (onPress) {
    return (
      <button type="button" onClick={onPress} {...common} data-pressable="">
        {body}
      </button>
    );
  }
  return <div {...common}>{body}</div>;
}
