import type { MouseEventHandler, ReactNode } from 'react';
import type { CardContract } from '../../../theme/contracts';
import { iconSize } from '../../../tokens/sizes';
import { cx } from '../cx';

export interface CardProps extends CardContract {
  /** Makes the card a link. */
  href?: string;
  /** Makes the card a button (when there is no `href`). */
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
}

/**
 * A held thing to open or choose. A link when it has `href`, a button when it
 * has `onClick` (a toggle when `selected` is given), otherwise a plain surface. A wide card stacks when its own
 * width is narrow (a container query, not the screen width).
 */
export function Card({
  title,
  meta,
  shape = 'tile',
  size = 'md',
  media,
  icon: Glyph,
  selected,
  disabled = false,
  href,
  onClick,
  className,
}: CardProps) {
  const glyph = Glyph ? (
    <span className="gd-card-icon" aria-hidden>
      <Glyph size={iconSize[size === 'lg' ? 'lg' : 'md']} color="currentColor" aria-hidden />
    </span>
  ) : null;
  const body: ReactNode = (
    <span className="gd-card-body">
      {media && shape !== 'pill' ? <span className="gd-card-media">{media}</span> : glyph}
      <span className="gd-card-words">
        <span className="gd-card-title">{title}</span>
        {meta && shape !== 'pill' ? <span className="gd-card-meta">{meta}</span> : null}
      </span>
    </span>
  );
  const common = {
    className: cx('gd-card', className),
    'data-shape': shape,
    'data-size': size,
    'data-selected': selected ? '' : undefined,
  };

  if (href !== undefined) {
    return (
      <a
        {...common}
        href={disabled ? undefined : href}
        onClick={onClick}
        aria-disabled={disabled || undefined}
        aria-current={selected ? 'true' : undefined}
      >
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        {...common}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
      >
        {body}
      </button>
    );
  }
  return <div {...common}>{body}</div>;
}
