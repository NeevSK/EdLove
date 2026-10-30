import type { HTMLAttributes, Ref } from 'react';
import type { InlineContract, StackContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface StackProps extends StackContract, HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}
export interface InlineProps extends InlineContract, HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/** One above another, spaced by their relation. */
export function Stack({
  gap = 'between',
  density = 'comfortable',
  align = 'stretch',
  className,
  ref,
  ...rest
}: StackProps) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cx('gd-stack', className)}
      data-gap={gap}
      data-density={density}
      data-align={align}
    />
  );
}

/** Side by side, wrapping when there is no room. */
export function Inline({
  gap = 'between',
  density = 'comfortable',
  align = 'center',
  justify = 'start',
  wrap = true,
  className,
  ref,
  ...rest
}: InlineProps) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cx('gd-inline', className)}
      data-gap={gap}
      data-density={density}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? undefined : 'no'}
    />
  );
}
