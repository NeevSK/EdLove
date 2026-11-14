import type { CSSProperties, KeyboardEvent } from 'react';
import type { PebbleContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { PebbleCornerSlot } from './PebbleCornerSlot';

export interface PebbleProps extends PebbleContract {
  className?: string;
  style?: CSSProperties;
  titleAttr?: string;
  ariaLabel?: string;
  'aria-label'?: string;
}

/**
 * Pebble: A 1:1 squircle tactile instrument for focus tools and practices.
 * Supports autonomous corner slots (pins, 3-dot menus, counters, live status)
 * and discrete degradation gears (dropping 3rd-line text on compact/mobile).
 */
export function Pebble({
  title,
  emoji,
  media,
  icon: IconGlyph,
  rhythm,
  cornerBadge,
  gear = 'auto',
  selected,
  disabled = false,
  onPress,
  className,
  style,
  titleAttr,
  ariaLabel,
  'aria-label': ariaLabelProp,
}: PebbleProps) {
  const isCompact = gear === 'compact';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPress?.();
    }
  };

  const computedAriaLabel = ariaLabel || ariaLabelProp;

  return (
    <div
      className={cx('gd-pebble', className)}
      style={style}
      data-gear={gear}
      data-selected={selected ? '' : undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-pressed={selected}
      aria-label={computedAriaLabel}
      title={titleAttr || `${title} · Quick tap to launch`}
      onClick={disabled ? undefined : onPress}
      onKeyDown={handleKeyDown}
    >
      {/* Autonomous Corner Affordance Slot */}
      {cornerBadge && (
        <PebbleCornerSlot badge={cornerBadge} compact={isCompact} />
      )}

      {/* Central Illustration Area */}
      <div className="gd-pebble-top">
        {media ? (
          media
        ) : IconGlyph ? (
          <span className="gd-pebble-emoji" aria-hidden="true">
            <IconGlyph size={isCompact ? 24 : 32} color="currentColor" />
          </span>
        ) : emoji ? (
          <span className="gd-pebble-emoji" aria-hidden="true">
            {emoji}
          </span>
        ) : null}
      </div>

      {/* Bottom Words & Rhythm Area */}
      <div className="gd-pebble-bottom">
        <h4 className="gd-pebble-title">{title}</h4>
        {rhythm && !isCompact && (
          <div className="gd-pebble-rhythm" title={rhythm}>
            <span className="gd-pebble-dot" aria-hidden="true" />
            <span>{rhythm.length > 18 ? `${rhythm.slice(0, 16)}…` : rhythm}</span>
          </div>
        )}
      </div>
    </div>
  );
}

