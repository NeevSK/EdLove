'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
// @ts-ignore -- react-dom types provided in consumer web projects
import { createPortal } from 'react-dom';
import type {
  LuminanceMode,
  ThemeSwitcherContract,
  WorldLanguage,
} from '../../../theme/contracts';
import type { WorldId } from '../../../theme/types';
import { worldName } from '../../../theme/web';
import { WORLD_IDS, WORLDS } from '../../../theme/worlds';
import { cx } from '../cx';

export interface ThemeSwitcherProps extends ThemeSwitcherContract {
  className?: string;
}

export function ThemeSwitcher({
  world,
  onWorldChange,
  mode = 'system',
  onModeChange,
  resolvedMode = 'light',
  variant = 'auto',
  label = 'Appearance & Diurnal World',
  lang = 'en',
  threshold = 420,
  className,
}: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const worldRadioRefs = useRef<Partial<Record<WorldId, HTMLButtonElement | null>>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Container / viewport width detection for 'auto' degradation
  useEffect(() => {
    if (variant !== 'auto' || !containerRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;

    // Look for the closest layout container (header, nav, main, or section) rather than immediate flex wrapper
    const target =
      containerRef.current.closest('header, nav, main, section, [data-container], .gd-container') ??
      containerRef.current.parentElement?.parentElement ??
      containerRef.current.parentElement ??
      containerRef.current;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsCompact(entry.contentRect.width < threshold);
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [variant, threshold]);

  const effectiveGear = variant === 'auto' ? (isCompact ? 'icon' : 'pill') : variant;
  const activeWorldDef = WORLDS[world] ?? WORLDS.sanctuary;
  const currentWorldLabel = worldName(world, lang);
  const modeLabel = mode === 'system' ? 'follows device' : mode;

  // Track popover coordinate positioning relative to trigger
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 300;
      let left = rect.right - popoverWidth;
      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }
      if (left < 12) {
        left = 12;
      }
      const top = rect.bottom + 8;
      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Arrow key navigation across the world radio grid
  const handleWorldKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    let step = 0;
    if (key === 'ArrowRight' || key === 'ArrowDown') step = 1;
    else if (key === 'ArrowLeft' || key === 'ArrowUp') step = -1;

    if (step !== 0) {
      event.preventDefault();
      const currentIndex = WORLD_IDS.indexOf(world);
      const nextIndex = (currentIndex + step + WORLD_IDS.length) % WORLD_IDS.length;
      const nextWorld = WORLD_IDS[nextIndex];
      if (nextWorld) {
        onWorldChange(nextWorld);
        worldRadioRefs.current[nextWorld]?.focus();
      }
    }
  };

  const popoverContent = (
    <div
      ref={popoverRef}
      className="gd-theme-switcher-popover"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      style={{
        position: 'fixed',
        top: coords ? `${coords.top}px` : undefined,
        left: coords ? `${coords.left}px` : undefined,
        right: 'auto',
        zIndex: 99999,
      }}
    >
      {onModeChange && (
        <div className="gd-theme-switcher-group">
          <span className="gd-theme-switcher-group-title">Light</span>
          <div
            className="gd-theme-switcher-mode-row"
            role="radiogroup"
            aria-label="Light mode"
          >
            {(['light', 'dark', 'system'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                className="gd-theme-switcher-mode-btn"
                onClick={() => onModeChange(m)}
              >
                {m === 'light' ? 'Day' : m === 'dark' ? 'Night' : 'Device'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="gd-theme-switcher-group">
        <span className="gd-theme-switcher-group-title" id="gd-theme-world-heading">
          World
        </span>
        <div
          className="gd-theme-switcher-grid"
          role="radiogroup"
          aria-labelledby="gd-theme-world-heading"
          onKeyDown={handleWorldKeyDown}
        >
          {WORLD_IDS.map((id) => {
            const isSelected = world === id;
            const name = worldName(id, lang);
            const p = WORLDS[id].palette[resolvedMode];
            return (
              <button
                key={id}
                ref={(el) => {
                  worldRadioRefs.current[id] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${name}: ${WORLDS[id].description}`}
                tabIndex={isSelected ? 0 : -1}
                className="gd-theme-switcher-world-btn"
                onClick={() => onWorldChange(id)}
              >
                <span
                  className="gd-theme-switcher-world-swatch"
                  aria-hidden="true"
                  style={{
                    background: p.ground,
                    boxShadow: `inset 0 0 0 1px ${p.line}`,
                  }}
                >
                  <span
                    className="gd-theme-switcher-world-dot"
                    style={{ background: p.lamp }}
                  />
                </span>
                <span className="gd-theme-switcher-world-name">{name}</span>
                {isSelected && (
                  <span className="gd-theme-switcher-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cx('gd-theme-switcher', className)} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="gd-theme-switcher-btn"
        data-gear={effectiveGear}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`World: ${currentWorldLabel}, light: ${modeLabel}`}
        aria-label={`World: ${currentWorldLabel}. Light: ${modeLabel}. Change appearance.`}
      >
        {effectiveGear === 'icon' ? (
          <span className="gd-theme-switcher-icon-wrap">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="gd-theme-switcher-glyph">
              {resolvedMode === 'dark' ? (
                <path d="M20.2 15.2A8.3 8.3 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" />
              ) : mode === 'light' ? (
                <>
                  <circle cx="12" cy="12" r="3.7" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </>
              ) : (
                <>
                  <rect x="3.5" y="4" width="17" height="13" rx="2" />
                  <path d="M8 21h8m-4-4v4" />
                </>
              )}
            </svg>
          </span>
        ) : (
          <>
            <span
              className="gd-theme-switcher-swatch"
              aria-hidden="true"
              style={{ background: activeWorldDef.palette[resolvedMode].lamp }}
            />
            <span className="gd-theme-switcher-label">{currentWorldLabel}</span>
          </>
        )}
      </button>

      {open &&
        (mounted && typeof document !== 'undefined'
          ? createPortal(popoverContent, document.body)
          : popoverContent)}
    </div>
  );
}
