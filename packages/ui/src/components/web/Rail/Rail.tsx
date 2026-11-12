'use client';

import type { CSSProperties, HTMLAttributes } from 'react';
import { useId } from 'react';
import type { RailContract } from '../../../theme/contracts';
import { cardWidth } from '../../../tokens/sizes';
import { Button } from '../Button/Button';
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
  seeAll,
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
      <div className="gd-rail-head">
        <p id={`${id}-label`} className="gd-text gd-rail-label" data-kind="label">
          {label}
        </p>
        {seeAll ? (
          <Button label={seeAll.label} variant="quiet" size="sm" onClick={seeAll.onPress} />
        ) : null}
      </div>
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
