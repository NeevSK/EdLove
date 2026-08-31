import type React from 'react';
import { useCallback } from 'react';
import { useLanguage } from '@repo/ui/context/LanguageProvider';
import type { Language } from '@repo/ui/context/types';
import { useTheme } from '@repo/ui/hooks/useTheme';

export const GatewayHeader: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { isDark, setThemeMode } = useTheme();

  const currentLang = language || 'en';

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'si', label: 'සිං' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  const handleLanguageClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const code = e.currentTarget.getAttribute('data-code');
      if (code) {
        void setLanguage(code as Language);
      }
    },
    [setLanguage],
  );

  const toggleTheme = useCallback(() => {
    void setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  const handleThemeMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1.08)';
    e.currentTarget.style.background = 'var(--border, rgba(42, 35, 24, 0.1))';
  }, []);

  const handleThemeMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.background = 'var(--border, rgba(42, 35, 24, 0.05))';
  }, []);

  return (
    <header
      style={{
        width: '100%',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border, rgba(42,35,24,0.08))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10,
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand logo & title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '24px' }}>🪷</span>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--ink, #2A2318)',
            fontFamily: 'var(--font-display, inherit)',
            letterSpacing: '-0.5px',
          }}
        >
          Gurudevi
        </span>
      </div>

      {/* Control Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Language Selection Row */}
        <div
          style={{
            display: 'flex',
            background: 'var(--border, rgba(42, 35, 24, 0.06))',
            padding: '3px',
            borderRadius: '20px',
            gap: '2px',
          }}
        >
          {languages.map((lang) => {
            const isActive = currentLang.startsWith(lang.code);
            return (
              <button
                type="button"
                key={lang.code}
                data-code={lang.code}
                onClick={handleLanguageClick}
                aria-label={`Switch language to ${lang.label}`}
                aria-pressed={isActive}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'var(--action, #D4843A)' : 'transparent',
                  color: isActive ? '#FCF9F2' : 'var(--ink-ghost, #7A6E5F)',
                }}
              >
                {lang.label}
              </button>
            );
          })}
        </div>

        {/* Theme Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-pressed={isDark}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--border, rgba(42, 35, 24, 0.05))',
            border: '1px solid var(--border, rgba(42, 35, 24, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            color: 'var(--ink, #2A2318)',
            padding: 0,
          }}
          onMouseEnter={handleThemeMouseEnter}
          onMouseLeave={handleThemeMouseLeave}
        >
          {isDark ? (
            // Sun Icon for Light Mode conversion
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Sun</title>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            // Moon Icon for Dark Mode conversion
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Moon</title>
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
