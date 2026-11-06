'use client';

import { type KeyboardEvent, type RefObject, useEffect, useRef } from 'react';
import type { MenuContract } from '../../../theme/contracts';
import { Popover } from '../Popover/Popover';

export interface MenuProps extends MenuContract {
  anchorRef: RefObject<HTMLElement | null>;
  width?: number;
}

/**
 * A short list of actions for one thing, opened from a control. Arrow keys,
 * Home and End move between items; Enter or Space chooses; Escape closes and
 * returns focus to the control (WAI-ARIA menu pattern).
 */
export function Menu({ open, onClose, label, items, anchorRef, width = 240 }: MenuProps) {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const first = list.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([aria-disabled="true"])');
    first?.focus();
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = [...(list.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])].filter(
      (el) => el.getAttribute('aria-disabled') !== 'true',
    );
    const at = enabled.indexOf(document.activeElement as HTMLButtonElement);
    const target = {
      ArrowDown: enabled[(at + 1) % enabled.length],
      ArrowUp: enabled[(at - 1 + enabled.length) % enabled.length],
      Home: enabled[0],
      End: enabled[enabled.length - 1],
    }[event.key];
    if (!target) return;
    event.preventDefault();
    target.focus();
  }

  return (
    <Popover open={open} onClose={onClose} label={label} anchorRef={anchorRef} width={width} role="menu">
      <div ref={list} className="gd-menu" onKeyDown={onKeyDown}>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className="gd-menu-item"
            data-destructive={item.destructive || undefined}
            aria-disabled={item.disabled || undefined}
            onClick={() => {
              if (item.disabled) return;
              onClose();
              anchorRef.current?.focus();
              item.onSelect();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </Popover>
  );
}
