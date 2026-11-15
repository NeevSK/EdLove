'use client';

import { type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import type { ContextMenuContract } from '../../../theme/contracts';
import { Menu } from '../Menu/Menu';

export interface ContextMenuProps extends ContextMenuContract {
  /** The thing itself: one focusable element (a card, a row). */
  children: ReactNode;
  className?: string;
  width?: number;
}

const LONG_PRESS_MS = 450;

/**
 * Actions for one thing, opened by right click, the menu key or Shift+F10,
 * or a long touch. The browser's own menu gives way only where this one has
 * something to offer. The thing inside keeps its own click and focus.
 */
export function ContextMenu({
  label,
  items,
  disabled,
  children,
  className,
  width,
}: ContextMenuProps) {
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usable = !disabled && items.some((i) => !i.disabled);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!usable) return;
    if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div
      ref={box}
      className={['gd-context', className].filter(Boolean).join(' ')}
      onContextMenu={(e) => {
        if (!usable) return;
        e.preventDefault();
        setOpen(true);
      }}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        if (!usable || e.pointerType !== 'touch') return;
        clear();
        timer.current = setTimeout(() => setOpen(true), LONG_PRESS_MS);
      }}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
    >
      {children}
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        label={label}
        items={items}
        anchorRef={box}
        width={width}
      />
    </div>
  );
}
