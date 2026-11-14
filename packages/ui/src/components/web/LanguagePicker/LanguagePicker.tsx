'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import type {
  LanguageItemMeta,
  LanguagePickerContract,
  WorldLanguage,
} from '../../../theme/contracts';
import { CANONICAL_LANGUAGES } from '../../../theme/contracts';
import { cx } from '../cx';

export interface LanguagePickerProps extends LanguagePickerContract {
  className?: string;
}

export function LanguagePicker({
  value,
  onChange,
  variant = 'auto',
  label = 'Language selector',
  languages = CANONICAL_LANGUAGES,
  threshold = 360,
  className,
}: LanguagePickerProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver for discrete container-driven degradation when variant="auto"
  useEffect(() => {
    if (variant !== 'auto' || !containerRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;
    const target = containerRef.current.parentElement ?? containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsNarrow(entry.contentRect.width < threshold);
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [variant, threshold]);

  // Click outside and Escape dismiss handler for dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const activeMeta = languages.find((l) => l.code === value) ?? languages[0] ?? {
    code: 'en' as const,
    label: 'English',
    nativeLabel: 'English',
    shortLabel: 'EN',
  };

  const handleSelect = (code: WorldLanguage) => {
    startTransition(() => {
      onChange(code);
    });
    setDropdownOpen(false);
  };

  const effectiveVariant = variant === 'auto' ? (isNarrow ? 'dropdown' : 'capsule') : variant;

  if (effectiveVariant === 'dropdown') {
    return (
      <div
        ref={containerRef}
        className={cx('gd-lang-picker', 'gd-lang-dropdown', className)}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          aria-label={label}
          className="gd-lang-trigger"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <Globe size={14} aria-hidden={true} />
          <span className="gd-lang-trigger-code">{activeMeta.shortLabel}</span>
          <span className="gd-lang-trigger-chevron">
            <ChevronDown size={12} aria-hidden={true} />
          </span>
        </button>

        {dropdownOpen && (
          <ul className="gd-lang-menu" role="listbox" aria-label={label}>
            {languages.map((item) => {
              const isSelected = item.code === value;
              return (
                <li key={item.code} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className="gd-lang-menu-item"
                    onClick={() => handleSelect(item.code)}
                  >
                    <div className="gd-lang-menu-labels">
                      <span className="gd-lang-menu-native">{item.nativeLabel}</span>
                      {item.code !== 'en' && (
                        <span className="gd-lang-menu-secondary">{item.label}</span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="gd-lang-check">
                        <Check size={14} aria-hidden={true} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // Capsule variant (segmented 1-tap pill buttons)
  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      className={cx('gd-lang-picker', 'gd-lang-capsule', className)}
    >
      {languages.map((item) => {
        const isSelected = item.code === value;
        return (
          <button
            key={item.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${item.label} (${item.nativeLabel})`}
            className="gd-lang-capsule-item"
            onClick={() => handleSelect(item.code)}
          >
            {item.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
