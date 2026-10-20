'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './theme-toggle.module.css';

export type PersonalityTheme = 'sanctuary' | 'lotus' | 'youth' | 'garden';
export type LuminanceMode = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { id: PersonalityTheme; label: string; icon: string }[] = [
  { id: 'sanctuary', label: 'Sanctuary', icon: '🕊️' },
  { id: 'lotus', label: 'Lotus', icon: '🪷' },
  { id: 'youth', label: 'Youth', icon: '⚡' },
  { id: 'garden', label: 'Garden', icon: '🌿' },
];

export function DiurnalThemeToggle({ headerIcon = false }: Readonly<{ headerIcon?: boolean }>) {
  const [theme, setTheme] = useState<PersonalityTheme>('sanctuary');
  const [mode, setMode] = useState<LuminanceMode>('system');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyThemeAndMode = (newTheme: PersonalityTheme, newMode: LuminanceMode) => {
    setTheme(newTheme);
    setMode(newMode);
    localStorage.setItem('gurudevi_theme', newTheme);
    localStorage.setItem('gurudevi_mode', newMode);

    const isDark =
      newMode === 'dark' ||
      (newMode === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const resolvedMode = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-mode', resolvedMode);
    document.documentElement.setAttribute('data-appearance', isDark ? 'night' : newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('gurudevi_theme') as PersonalityTheme | null;
    const savedMode = localStorage.getItem('gurudevi_mode') as LuminanceMode | null;
    const legacyPreset = localStorage.getItem('gurudevi_appearance_preset');

    let initialTheme: PersonalityTheme = 'sanctuary';
    let initialMode: LuminanceMode = 'system';

    if (savedTheme && THEME_OPTIONS.some((t) => t.id === savedTheme)) {
      initialTheme = savedTheme;
    } else if (legacyPreset === 'garden' || legacyPreset === 'dawn') {
      initialTheme = legacyPreset === 'garden' ? 'garden' : 'sanctuary';
    }

    if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
      initialMode = savedMode;
    } else if (legacyPreset === 'night') {
      initialMode = 'dark';
    }

    applyThemeAndMode(initialTheme, initialMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentMode = (localStorage.getItem('gurudevi_mode') as LuminanceMode | null) || 'system';
      if (currentMode === 'system') {
        const currentTheme =
          (localStorage.getItem('gurudevi_theme') as PersonalityTheme | null) || 'sanctuary';
        applyThemeAndMode(currentTheme, 'system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

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

  const currentThemeObj =
    THEME_OPTIONS.find((t) => t.id === theme) ?? (THEME_OPTIONS[0] as (typeof THEME_OPTIONS)[number]);

  return (
    <div className={styles.toggleWrapper} ref={containerRef}>
      <button
        type="button"
        className={`${styles.themeToggleBtn} ${headerIcon ? styles.headerThemeToggle : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={`Theme: ${currentThemeObj.label} (${mode}) · Click to customize`}
        aria-label={`Current theme is ${currentThemeObj.label}, mode is ${mode}. Click to customize appearance.`}
      >
        {headerIcon ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={styles.themeGlyph}>
            {mode === 'dark' ? (
              <path d="M20.2 15.2A8.3 8.3 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" />
            ) : mode === 'light' ? (
              <><circle cx="12" cy="12" r="3.7" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>
            ) : (
              <><rect x="3.5" y="4" width="17" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>
            )}
          </svg>
        ) : (
          <>
            <span className={styles.themeIcon} aria-hidden="true">{currentThemeObj.icon}</span>
            <span className={styles.themeLabel}>{currentThemeObj.label}</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className={styles.themePopover} role="dialog" aria-label="Theme Customization">
          <div className={styles.popoverGroup}>
            <span className={styles.popoverLabel}>Appearance</span>
            <div className={styles.modeSegmented}>
              <button
                type="button"
                className={styles.modeBtn}
                data-active={mode === 'light'}
                onClick={() => applyThemeAndMode(theme, 'light')}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                className={styles.modeBtn}
                data-active={mode === 'dark'}
                onClick={() => applyThemeAndMode(theme, 'dark')}
              >
                🌙 Dark
              </button>
              <button
                type="button"
                className={styles.modeBtn}
                data-active={mode === 'system'}
                onClick={() => applyThemeAndMode(theme, 'system')}
              >
                ⚙️ Auto
              </button>
            </div>
          </div>

          <div className={styles.popoverGroup}>
            <span className={styles.popoverLabel}>Palette</span>
            <div className={styles.themeGrid}>
              {THEME_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.themeBtn}
                  data-active={theme === item.id}
                  onClick={() => applyThemeAndMode(item.id, mode)}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
