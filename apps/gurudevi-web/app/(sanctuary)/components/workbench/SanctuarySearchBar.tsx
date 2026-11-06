'use client';

import React, { useRef, useId, useState } from 'react';
import styles from './sanctuary-search-bar.module.css';

export interface SanctuarySearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  resultCount?: number;
  onClear?: () => void;
  onSubmit?: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}

/**
 * SanctuarySearchBar:
 * An owned zero-slop web search component featuring:
 * - Ambient focus glow matching `--w-lamp` token
 * - Polished glyph prefix
 * - Clear button (✕) with escape key handler
 * - Screen-reader aria status for live result count
 */
export function SanctuarySearchBar({
  value,
  onChange,
  placeholder = 'Search components, props, domains...',
  resultCount,
  onClear,
  onSubmit,
  className = '',
  autoFocus = false,
}: SanctuarySearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const statusId = useId();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      handleClear();
    } else if (e.key === 'Enter') {
      onSubmit?.(value);
    }
  };

  return (
    <div
      className={`${styles.searchWell} ${className}`}
      data-focused={isFocused}
      data-has-value={Boolean(value)}
    >
      <span className={styles.searchIcon} aria-hidden="true">
        🔍
      </span>

      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        className={styles.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        aria-describedby={resultCount !== undefined ? statusId : undefined}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck="false"
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search (Esc)"
        >
          ✕
        </button>
      )}

      {/* Keyboard Shortcut Hint */}
      {!value && !isFocused && (
        <span className={styles.shortcutKbd} aria-hidden="true">
          ⌘K
        </span>
      )}

      {/* Live region for result count */}
      {resultCount !== undefined && (
        <span id={statusId} className={styles.srOnly} aria-live="polite">
          {resultCount} {resultCount === 1 ? 'result' : 'results'} available
        </span>
      )}
    </div>
  );
}
