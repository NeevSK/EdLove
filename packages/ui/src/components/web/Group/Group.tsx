'use client';

import { Children, type HTMLAttributes, isValidElement, type Ref, useId } from 'react';
import type { GroupContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface GroupProps extends GroupContract, HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Rows that belong together on one held surface. Only the outer corners
 * round; hairlines start at the row inset so the group reads as one thing.
 */
export function Group({ label, footer, children, className, ref, ...rest }: GroupProps) {
  const id = useId();
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={label ? `${id}-label` : undefined}
      aria-describedby={footer ? `${id}-footer` : undefined}
      {...rest}
      className={cx('gd-group', className)}
    >
      {label ? (
        <p id={`${id}-label`} className="gd-text gd-group-label" data-kind="label">
          {label}
        </p>
      ) : null}
      <div className="gd-group-body">
        {rows.map((row, i) => (
          <div key={row.key ?? i} className="gd-group-row">
            {row}
          </div>
        ))}
      </div>
      {footer ? (
        <p id={`${id}-footer`} className="gd-text" data-kind="caption">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
