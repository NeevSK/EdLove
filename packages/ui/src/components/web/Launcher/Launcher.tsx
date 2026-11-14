'use client';

import { useState } from 'react';
import type { LauncherContract } from '../../../theme/contracts';
import { iconSize } from '../../../tokens/sizes';
import { LAUNCHER_ENGLISH, launcherSections } from '../../shared/basics';
import { SearchField } from '../Basics/Basics';
import { cx } from '../cx';

export interface LauncherProps extends LauncherContract {
  className?: string;
}

/**
 * Rooms and tools as quiet tiles under their kind, Recent first, with search.
 * Each tile opens; its keep control (shown on hover and focus, always on
 * touch screens) keeps it in the task strip without leaving.
 */
export function Launcher({
  label,
  items,
  onOpen,
  onKeep,
  recent,
  placeholder,
  labels,
  className,
}: LauncherProps) {
  const l = { ...LAUNCHER_ENGLISH, ...labels };
  const [query, setQuery] = useState('');
  const [kept, setKept] = useState<string | null>(null);
  const sections = launcherSections(items, query, recent, l);
  const count = new Set(sections.flatMap((s) => s.items.map((i) => i.id))).size;
  return (
    <section className={cx('gd-launcher', className)} aria-label={label}>
      <SearchField
        label={l.search}
        value={query}
        onChange={setQuery}
        placeholder={placeholder ?? l.search}
        resultCount={count}
      />
      <p className="gd-visually-hidden" aria-live="polite">
        {kept ?? ''}
      </p>
      {sections.length === 0 ? <p className="gd-launcher-empty">{l.empty}</p> : null}
      {sections.map((section) => (
        <div key={section.key} className="gd-launcher-section">
          {section.title ? <h3 className="gd-launcher-heading">{section.title}</h3> : null}
          <ul className="gd-launcher-grid">
            {section.items.map((item) => {
              const Glyph = item.icon;
              return (
                <li key={item.id} className="gd-launcher-item">
                  <button
                    type="button"
                    className="gd-launcher-tile"
                    onClick={() => onOpen(item.id)}
                  >
                    <span className="gd-launcher-well" aria-hidden>
                      {Glyph ? (
                        <Glyph size={iconSize.lg} color="currentColor" aria-hidden />
                      ) : (
                        item.title.charAt(0)
                      )}
                      {item.badge ? <span className="gd-launcher-dot" /> : null}
                    </span>
                    <span className="gd-launcher-title">{item.title}</span>
                    {item.badge ? <span className="gd-launcher-badge">{item.badge}</span> : null}
                    {item.description ? (
                      <span className="gd-launcher-description">{item.description}</span>
                    ) : null}
                  </button>
                  {onKeep ? (
                    <button
                      type="button"
                      className="gd-launcher-keep"
                      aria-label={`${l.keep}: ${item.title}`}
                      onClick={() => {
                        onKeep(item.id);
                        setKept(l.kept(item.title));
                      }}
                    >
                      <span aria-hidden>＋</span>
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
