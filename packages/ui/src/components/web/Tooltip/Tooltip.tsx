'use client';

import { cloneElement, type KeyboardEvent, type ReactElement, useId, useState } from 'react';
import type { TooltipContract } from '../../../theme/contracts';

interface DescribedChildProps {
  'aria-describedby'?: string;
}

export interface TooltipProps extends TooltipContract {
  /** One focusable control (an icon button). It is described by the tip. */
  children: ReactElement<DescribedChildProps>;
}

/**
 * A short label for a control whose meaning is not written on it. Shown on
 * hover and keyboard focus, hidden with Escape without moving focus (WCAG
 * 1.4.13), and always the control's description for screen readers.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  const describedBy = [children.props['aria-describedby'], id].filter(Boolean).join(' ');
  return (
    <span
      className="gd-tipwrap"
      data-dismissed={dismissed || undefined}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === 'Escape') setDismissed(true);
      }}
      onPointerEnter={() => setDismissed(false)}
      onFocus={() => setDismissed(false)}
    >
      {cloneElement(children, { 'aria-describedby': describedBy })}
      <span id={id} role="tooltip" className="gd-tip">
        {label}
      </span>
    </span>
  );
}
