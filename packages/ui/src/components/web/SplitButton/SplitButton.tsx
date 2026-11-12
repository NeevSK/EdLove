'use client';

import { useRef, useState } from 'react';
import type { KitIconProps, SplitButtonContract } from '../../../theme/contracts';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Menu } from '../Menu/Menu';

export interface SplitButtonProps extends SplitButtonContract {
  onClick: () => void;
  className?: string;
}

function Caret({ size = 20 }: KitIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path
        d="M5 7.5 L10 12.5 L15 7.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** The main action, and beside it an arrow that opens its close relatives. */
export function SplitButton({
  label,
  onClick,
  more,
  moreLabel,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
}: SplitButtonProps) {
  const arrow = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <div className={['gd-split', className].filter(Boolean).join(' ')}>
      <Button label={label} variant={variant} size={size} disabled={disabled} onClick={onClick} />
      <IconButton
        ref={arrow}
        icon={Caret}
        label={moreLabel}
        variant={variant}
        size={size}
        disabled={disabled || more.length === 0}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      />
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        label={moreLabel}
        items={more}
        anchorRef={arrow}
      />
    </div>
  );
}
