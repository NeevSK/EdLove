import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import type { GridContract } from '../../../theme/contracts';
import { gridMin } from '../../../tokens/sizes';
import { cx } from '../cx';

export interface GridProps extends GridContract, HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/** Equal columns that come and go with the width the grid is given (no script). */
export function Grid({
  min = 'md',
  max,
  gap = 'between',
  className,
  style,
  ref,
  ...rest
}: GridProps) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cx('gd-grid', className)}
      data-gap={gap}
      data-max={max === undefined ? undefined : ''}
      style={
        {
          ...style,
          '--gd-grid-min': `${gridMin[min]}px`,
          ...(max === undefined ? null : { '--gd-grid-max': max }),
        } as CSSProperties
      }
    />
  );
}
