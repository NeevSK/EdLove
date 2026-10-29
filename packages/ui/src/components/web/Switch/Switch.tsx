import type { ButtonHTMLAttributes, Ref } from 'react';
import type { SwitchContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface SwitchProps
  extends SwitchContract,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value' | 'onChange'> {
  ref?: Ref<HTMLButtonElement>;
}

/** An on/off setting. Lit with the world's lamp when on, a quiet line when off. */
export function Switch({
  value,
  onValueChange,
  label,
  className,
  onClick,
  ref,
  ...rest
}: SwitchProps) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      {...rest}
      className={cx('gd-switch', className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onValueChange(!value);
      }}
    >
      <span className="gd-switch-thumb" aria-hidden="true" />
    </button>
  );
}
