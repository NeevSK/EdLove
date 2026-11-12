'use client';

import { type KeyboardEvent, useId, useState } from 'react';
import type { AutocompleteContract } from '../../../theme/contracts';

export interface AutocompleteProps<V extends string = string> extends AutocompleteContract<V> {
  limit?: number;
  className?: string;
}

const defaultCount = (n: number) => (n === 1 ? '1 suggestion' : `${n} suggestions`);

/**
 * A field that suggests as you type (WAI-ARIA combobox with a list). Arrow
 * keys move through the suggestions while focus stays in the field; Enter
 * picks; Escape closes. The count is spoken through a polite live region.
 */
export function Autocomplete<V extends string = string>({
  label,
  query,
  onQueryChange,
  suggestions,
  onPick,
  placeholder,
  hint,
  emptyText = 'No matches',
  countText = defaultCount,
  limit = 6,
  className,
}: AutocompleteProps<V>) {
  const id = `gd-ac-${useId()}`;
  const [focused, setFocused] = useState(false);
  const [closed, setClosed] = useState(false);
  const [active, setActive] = useState(-1);
  const shown = suggestions.slice(0, limit);
  const open = focused && !closed && query.trim().length > 0;
  const enabled = shown.map((s, i) => (s.disabled ? -1 : i)).filter((i) => i >= 0);

  function pick(v: V) {
    onPick(v);
    setClosed(true);
    setActive(-1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setClosed(true);
      return;
    }
    if (!open || enabled.length === 0) {
      if (e.key === 'ArrowDown') setClosed(false);
      return;
    }
    const pos = enabled.indexOf(active);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(enabled[(pos + 1) % enabled.length]!);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(enabled[(pos - 1 + enabled.length) % enabled.length]!);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick(shown[active]!.value);
    }
  }

  return (
    <div className={['gd-field', 'gd-autocomplete', className].filter(Boolean).join(' ')}>
      <label className="gd-field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="gd-field-input"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setClosed(false);
          setActive(-1);
          onQueryChange(e.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
      />
      {hint ? (
        <p id={`${id}-hint`} className="gd-field-hint">
          {hint}
        </p>
      ) : null}
      <ul
        id={`${id}-list`}
        role="listbox"
        aria-label={label}
        className="gd-autocomplete-list"
        hidden={!open}
      >
        {open && shown.length === 0 ? (
          <li className="gd-autocomplete-empty" role="presentation">
            {emptyText}
          </li>
        ) : null}
        {open
          ? shown.map((s, i) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: keys are handled on the field (combobox pattern)
              <li
                key={s.value}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === active}
                aria-disabled={s.disabled || undefined}
                className="gd-autocomplete-option"
                // Pick before the field's blur closes the list.
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!s.disabled) pick(s.value);
                }}
              >
                <span>{s.label}</span>
                {s.hint ? <span className="gd-autocomplete-hint">{s.hint}</span> : null}
              </li>
            ))
          : null}
      </ul>
      <span className="gd-visually-hidden" aria-live="polite">
        {open ? (shown.length === 0 ? emptyText : countText(shown.length)) : ''}
      </span>
    </div>
  );
}
