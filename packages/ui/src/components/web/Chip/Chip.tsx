import type { ButtonHTMLAttributes, HTMLAttributes, Ref } from 'react';
import type { ChipContract, ChipsContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface ChipProps
  extends ChipContract,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'lang'> {
  ref?: Ref<HTMLButtonElement>;
}

export function Chip({
  label,
  selected = false,
  kind = 'button',
  className,
  ref,
  ...rest
}: ChipProps) {
  const state =
    kind === 'button' ? { 'aria-pressed': selected } : { role: kind, 'aria-checked': selected };
  return (
    <button ref={ref} type="button" {...rest} {...state} className={cx('gd-chip', className)}>
      {label}
    </button>
  );
}

export interface ChipsProps extends ChipsContract, HTMLAttributes<HTMLDivElement> {}

export function Chips({ label, single = false, className, ...rest }: ChipsProps) {
  return (
    <div
      {...rest}
      role={single ? 'radiogroup' : 'group'}
      aria-label={label}
      className={cx('gd-chips', className)}
    />
  );
}
