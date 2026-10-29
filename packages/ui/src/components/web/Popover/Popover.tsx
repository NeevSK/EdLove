import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PopoverContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface PopoverProps extends PopoverContract {
  /** The control the popover belongs to; it opens just below it. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Width in px; the popover never leaves the viewport. */
  width?: number;
  className?: string;
}

const GAP = 6;
const EDGE = 12;

/**
 * A small panel tied to a control: a menu, a few options, a short note. It
 * opens below its anchor (above it when there is no room). Escape or a click
 * outside closes it and focus returns to the anchor.
 */
export function Popover({ open, onClose, label, children, anchorRef, width = 260, className }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const panel = ref.current;
    if (!open || !anchor || !panel) return;
    const a = anchor.getBoundingClientRect();
    const h = panel.offsetHeight;
    const left = Math.min(Math.max(EDGE, a.left + a.width / 2 - width / 2), window.innerWidth - width - EDGE);
    const below = a.bottom + GAP;
    const top = below + h < window.innerHeight - EDGE ? below : Math.max(EDGE, a.top - GAP - h);
    setPlace({ top: top + window.scrollY, left: left + window.scrollX });
    panel.focus();
  }, [open, anchorRef, width]);

  useEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const close = () => {
      onClose();
      anchor?.focus();
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!ref.current?.contains(target) && !anchor?.contains(target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      className={cx('gd-overlay-panel gd-popover', className)}
      style={{ width, top: place?.top ?? 0, left: place?.left ?? 0, visibility: place ? 'visible' : 'hidden' }}
    >
      {children}
    </div>
  );
}
