'use client';

import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { KitIconProps, TaskToolbarContract } from '../../../theme/contracts';
import { actionsThatFit } from '../../../theme/taskToolbar';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Menu } from '../Menu/Menu';

export interface TaskToolbarProps extends TaskToolbarContract {
  className?: string;
}

const TOUCH_MIN = 44;

function Dots({ size = 20 }: KitIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <circle cx={4} cy={10} r={1.8} fill="currentColor" />
      <circle cx={10} cy={10} r={1.8} fill="currentColor" />
      <circle cx={16} cy={10} r={1.8} fill="currentColor" />
    </svg>
  );
}

/**
 * The actions for what the person is doing now. As many as fit are shown, in
 * order; the rest wait behind "More". One tab stop: arrow keys, Home and End
 * move along it (WAI-ARIA toolbar).
 */
export function TaskToolbar({ label, actions, moreLabel = 'More', className }: TaskToolbarProps) {
  const row = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState(1024);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    const el = row.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(
      ([entry]) => entry && setWidth(Math.round(entry.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale =
    typeof window === 'undefined'
      ? 1
      : Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
  const { shown, iconsOnly } = actionsThatFit(actions, width, {
    touchMin: TOUCH_MIN,
    fontScale: scale,
  });
  const visible = actions.slice(0, shown);
  const folded = actions.slice(shown);
  const stops = visible.length + (folded.length > 0 ? 1 : 0);
  const at = Math.min(focus, stops - 1);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const next = {
      ArrowRight: (at + 1) % stops,
      ArrowLeft: (at - 1 + stops) % stops,
      Home: 0,
      End: stops - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setFocus(next);
    row.current?.querySelectorAll<HTMLButtonElement>('[data-stop]')[next]?.focus();
  }

  return (
    <div
      ref={row}
      role="toolbar"
      aria-label={label}
      className={['gd-toolbar', className].filter(Boolean).join(' ')}
      onKeyDown={onKeyDown}
    >
      {visible.map((a, i) =>
        a.icon && iconsOnly ? (
          <IconButton
            key={a.key}
            data-stop
            tabIndex={i === at ? 0 : -1}
            icon={a.icon}
            label={a.label}
            variant="quiet"
            disabled={a.disabled}
            onClick={a.onPress}
          />
        ) : (
          <Button
            key={a.key}
            data-stop
            tabIndex={i === at ? 0 : -1}
            label={a.label}
            icon={a.icon}
            variant={a.destructive ? 'danger' : 'quiet'}
            size="sm"
            disabled={a.disabled}
            onClick={a.onPress}
          />
        ),
      )}
      {folded.length > 0 ? (
        <>
          <IconButton
            ref={more}
            data-stop
            tabIndex={at === stops - 1 ? 0 : -1}
            className="gd-toolbar-more"
            icon={Dots}
            label={moreLabel}
            variant="quiet"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          />
          <Menu
            open={open}
            onClose={() => setOpen(false)}
            label={moreLabel}
            anchorRef={more}
            items={folded.map((a) => ({
              key: a.key,
              label: a.label,
              onSelect: a.onPress,
              disabled: a.disabled,
              destructive: a.destructive,
            }))}
          />
        </>
      ) : null}
    </div>
  );
}
