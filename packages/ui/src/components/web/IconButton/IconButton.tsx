import type { ButtonHTMLAttributes, Ref } from 'react';
import type { IconButtonContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { Tooltip } from '../Tooltip/Tooltip';

export interface IconButtonProps
  extends IconButtonContract,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  ref?: Ref<HTMLButtonElement>;
}

/**
 * An action shown only as an icon. Same variants as Button, as a square; quiet
 * ones are bare icons. The label is its accessible name and its tooltip.
 */
export function IconButton({
  icon: Icon,
  label,
  variant = 'quiet',
  size = 'md',
  type = 'button',
  className,
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip label={label}>
      <button
        ref={ref}
        type={type}
        aria-label={label}
        {...rest}
        className={cx('gd-icon-button', className)}
        data-variant={variant}
        data-size={size}
      >
        <Icon size={size === 'sm' ? 18 : size === 'lg' ? 24 : 20} aria-hidden />
      </button>
    </Tooltip>
  );
}
