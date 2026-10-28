'use client';

import { WORLD_IDS, WORLDS, type WorldId } from '@repo/ui/world';
import { useEffect, useRef, useState } from 'react';
import {
  type LuminanceMode,
  type PersonalityTheme,
  useWorldTheme,
} from '../../../lib/theme/useWorldTheme';
import styles from './theme-toggle.module.css';

export type { LuminanceMode, PersonalityTheme };

export function DiurnalThemeToggle({ headerIcon = false }: Readonly<{ headerIcon?: boolean }>) {
  const { world, theme, mode, setWorld, setThemeAndMode } = useWorldTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const chooseWorld = (next: WorldId) => {
    setWorld(next);
  };

  const chooseMode = (nextMode: LuminanceMode) => {
    setThemeAndMode(theme, nextMode);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const worldLabel = WORLDS[world].names.en;
  const modeLabel = mode === 'system' ? 'follows the device' : mode;

  return (
    <div className={styles.toggleWrapper} ref={containerRef}>
      <button
        type="button"
        className={`${styles.themeToggleBtn} ${headerIcon ? styles.headerThemeToggle : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={`World: ${worldLabel}, light ${modeLabel}`}
        aria-label={`World: ${worldLabel}. Light ${modeLabel}. Change appearance.`}
      >
        {headerIcon ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={styles.themeGlyph}>
            {mode === 'dark' ? (
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
        ) : (
          <>
            <span
              className={styles.worldDot}
              aria-hidden="true"
              style={{ background: WORLDS[world].palette.light.lamp }}
            />
            <span className={styles.themeLabel}>{worldLabel}</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className={styles.themePopover} role="dialog" aria-label="Appearance">
          <div className={styles.popoverGroup}>
            <span className={styles.popoverLabel}>Light</span>
            <div className={styles.modeSegmented}>
              <button
                type="button"
                className={styles.modeBtn}
                data-active={mode === 'light'}
                aria-pressed={mode === 'light'}
                onClick={() => chooseMode('light')}
              >
                Day
              </button>
              <button
                type="button"
                className={styles.modeBtn}
                data-active={mode === 'dark'}
                aria-pressed={mode === 'dark'}
                onClick={() => chooseMode('dark')}
              >
                Night
              </button>
              <button
                type="button"
                className={styles.modeBtn}
                data-active={mode === 'system'}
                aria-pressed={mode === 'system'}
                onClick={() => chooseMode('system')}
              >
                Device
              </button>
            </div>
          </div>

          <div className={styles.popoverGroup}>
            <span className={styles.popoverLabel} id="gd-world-label">
              World
            </span>
            <div className={styles.worldGrid} role="radiogroup" aria-labelledby="gd-world-label">
              {WORLD_IDS.map((id) => {
                const p = WORLDS[id].palette.light;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={world === id}
                    className={styles.worldBtn}
                    data-active={world === id}
                    onClick={() => chooseWorld(id)}
                  >
                    <span
                      className={styles.worldSwatch}
                      aria-hidden="true"
                      style={{ background: p.ground, boxShadow: `inset 0 0 0 1px ${p.line}` }}
                    >
                      <span style={{ background: p.lamp }} />
                    </span>
                    <span>{WORLDS[id].names.en}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
