'use client';

import type { CSSProperties, HTMLAttributes } from 'react';
import { useId } from 'react';
import type { RailContract } from '../../../theme/contracts';
import { cardWidth } from '../../../tokens/sizes';
import { cx } from '../cx';

export interface RailProps<T>
  extends RailContract<T>,
    Omit<HTMLAttributes<HTMLElement>, 'children'> {}

/**
 * A short horizontal run that scrolls and snaps. It is a named list; Tab
 * moves through its items and the browser scrolls each into view.
 */
export function Rail<T>({
  label,
  items,
  keyOf,
  renderItem,
  size = 'md',
  className,
  style,
  ...rest
}: RailProps<T>) {
  const id = useId();
  return (
    <section
      {...rest}
      aria-labelledby={`${id}-label`}
      className={cx('gd-rail', className)}
      style={{ ...style, '--gd-rail-item': `${cardWidth[size]}px` } as CSSProperties}
    >
      <p id={`${id}-label`} className="gd-text gd-rail-label" data-kind="label">
        {label}
      </p>
      <ul className="gd-rail-track" aria-labelledby={`${id}-label`}>
        {items.map((item, i) => (
          <li key={keyOf(item)} className="gd-rail-item">
            {renderItem(item, i)}
          </li>
        ))}
      </ul>
    </section>
  );
}
