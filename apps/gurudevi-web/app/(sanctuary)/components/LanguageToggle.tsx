'use client';

import { Check, ChevronDown, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation, LANGUAGES, type LanguageMeta } from '../../../lib/i18n';
import styles from './language-toggle.module.css';

/**
 * LanguageToggle — Accessible locale switcher for Gurudevi Web.
 *
 * Modernized 2026 design:
 * - Scalable Lucide vector icons (Globe, ChevronDown, Check)
 * - Full keyboard accessibility (Escape to dismiss, Enter/Space to select, ARIA listbox)
 * - Cohesive design tokens and theme integration
 */
export function LanguageToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectLanguage = (lang: LanguageMeta) => {
    setIsOpen(false);
    setLocale(lang.code);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('actions.selectLanguage') || 'Select language'}
        className={styles.toggleButton}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <Globe className="w-3.5 h-3.5 opacity-70 shrink-0" aria-hidden="true" />
        <span className={styles.langCode}>{locale.toUpperCase()}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-60 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <ul aria-label="Available languages" className={styles.dropdown} role="listbox">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <li
                aria-selected={isSelected}
                className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ''}`}
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                role="option"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectLanguage(lang);
                  }
                }}
              >
                <div className={styles.langNameRow}>
                  <span className={styles.nativeText}>{lang.nativeLabel}</span>
                  {lang.code !== 'en' ? (
                    <span className={styles.secondaryLabel}>{lang.label}</span>
                  ) : null}
                </div>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-[var(--color-sanctuary-saffron)] shrink-0" aria-hidden="true" />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
