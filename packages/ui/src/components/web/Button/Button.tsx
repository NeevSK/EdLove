import type { ButtonHTMLAttributes, Ref } from 'react';
import type { ButtonContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface ButtonProps
  extends ButtonContract,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={cx('gd-button', className)}
      data-variant={variant}
      data-size={size}
      data-full={fullWidth || undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {Icon && !loading ? <Icon size={18} aria-hidden /> : null}
      {loading ? <span className="gd-button-pulse" aria-hidden="true" /> : null}
      <span>{label}</span>
    </button>
  );
}
