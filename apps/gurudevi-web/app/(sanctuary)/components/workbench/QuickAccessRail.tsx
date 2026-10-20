'use client';

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { QuickAccessUsage } from '../../../../lib/workbench/quickAccessPreferences';
import styles from './quick-access-rail.module.css';

export type QuickAccessItem = Readonly<{ id: string; label: string; emoji: string }>;

export function QuickAccessSheet({
  activeId,
  dialogRef,
  items,
  onOpen,
  onTogglePin,
  pinnedIds,
  pinLimit,
  usage = {},
}: Readonly<{
  activeId?: string | null;
  dialogRef: RefObject<HTMLDialogElement | null>;
  items: readonly QuickAccessItem[];
  onOpen: (item: QuickAccessItem) => void;
  onTogglePin: (id: string) => void;
  pinnedIds: readonly string[];
  pinLimit?: number;
  usage?: QuickAccessUsage;
}>) {
  const [query, setQuery] = useState('');
  const matchingItems = items.filter((item) => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const pinnedItems = matchingItems.filter((item) => pinnedIds.includes(item.id));
  const unpinnedItems = matchingItems.filter((item) => !pinnedIds.includes(item.id));
  const recentItems = unpinnedItems
    .filter((item) => (usage[item.id]?.lastUsedAt ?? 0) >= Date.now() - 14 * 24 * 60 * 60 * 1000)
    .sort((left, right) => (usage[right.id]?.lastUsedAt ?? 0) - (usage[left.id]?.lastUsedAt ?? 0))
    .slice(0, 5);
  const recentIds = new Set(recentItems.map((item) => item.id));
  const frequentItems = unpinnedItems
    .filter((item) => !recentIds.has(item.id) && (usage[item.id]?.count ?? 0) >= 3)
    .sort((left, right) =>
      (usage[right.id]?.count ?? 0) - (usage[left.id]?.count ?? 0) ||
      (usage[right.id]?.lastUsedAt ?? 0) - (usage[left.id]?.lastUsedAt ?? 0),
    )
    .slice(0, 5);
  const categorizedIds = new Set([...recentIds, ...frequentItems.map((item) => item.id)]);
  const otherItems = unpinnedItems
    .filter((item) => !categorizedIds.has(item.id))
    .sort((left, right) => left.label.localeCompare(right.label));
  const limitReached = Boolean(pinLimit && pinnedIds.length >= pinLimit);

  function renderItems(sectionItems: readonly QuickAccessItem[]) {
    return (
      <div className={styles.sheetOptions}>
        {sectionItems.map((item) => {
          const pinned = pinnedIds.includes(item.id);
          return (
            <div className={styles.sheetOption} key={item.id}>
              <button
                aria-current={activeId === item.id ? 'page' : undefined}
                className={styles.sheetOpenItem}
                onClick={() => {
                  onOpen(item);
                  dialogRef.current?.close();
                }}
                type="button"
              >
                <span aria-hidden="true" className={styles.sheetItemEmoji}>{item.emoji}</span>
                <span>{item.label}</span>
                <span aria-hidden="true" className={styles.openMark}>↗</span>
              </button>
              <button
                aria-label={`${pinned ? 'Unpin' : 'Pin'} ${item.label}`}
                aria-pressed={pinned}
                disabled={!pinned && limitReached}
                onClick={() => onTogglePin(item.id)}
                type="button"
              >
                {pinned ? '📌' : '＋'}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <dialog
      aria-labelledby="quick-access-sheet-title"
      className={styles.sheet}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      ref={dialogRef}
    >
      <div className={styles.sheetContent}>
        <div aria-hidden="true" className={styles.sheetHandle} />
        <header className={styles.sheetHeader}>
          <div>
            <h2 id="quick-access-sheet-title">Quick access</h2>
            <p>Pin the tools you reach for most.</p>
          </div>
          <button
            aria-label="Close quick access"
            className={styles.sheetClose}
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            ×
          </button>
        </header>

        {pinnedItems.length > 0 ? (
          <section aria-labelledby="quick-access-pinned-title" className={styles.sheetSection}>
            <h3 id="quick-access-pinned-title">Pinned</h3>
          {renderItems(pinnedItems)}
          </section>
        ) : (
          <p className={styles.emptyPins}>No shortcuts pinned yet. Choose one below.</p>
        )}

      <label className={styles.sheetSearch}>
        <span className={styles.visuallyHidden}>Search all features</span>
        <input
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Find a feature"
          type="search"
          value={query}
        />
      </label>

      <section aria-labelledby="quick-access-recent-title" className={styles.sheetSection}>
        <div className={styles.sheetSectionHeader}>
          <h3 id="quick-access-recent-title">Recently used</h3>
          {pinLimit ? <span>{pinnedIds.length} of {pinLimit} pinned</span> : null}
        </div>
        {recentItems.length ? renderItems(recentItems) : <p className={styles.emptyPins}>Your recent features will appear here.</p>}
      </section>

      <section aria-labelledby="quick-access-frequent-title" className={styles.sheetSection}>
        <h3 id="quick-access-frequent-title">Frequently used</h3>
        {frequentItems.length ? renderItems(frequentItems) : <p className={styles.emptyPins}>Use a feature a few times and it will appear here.</p>}
      </section>

      <section aria-labelledby="quick-access-all-title" className={styles.sheetSection}>
        <div className={styles.sheetSectionHeader}>
          <h3 id="quick-access-all-title">All other features</h3>
          <span>{otherItems.length}</span>
        </div>
        {otherItems.length ? renderItems(otherItems) : <p className={styles.emptyPins}>No other features match this search.</p>}
        </section>
      </div>
    </dialog>
  );
}

const preferenceKey = (domain: string) => `gurudevi:workbench-rail-hidden:${domain}`;

function announceVisibility(domain: 'self' | 'workspace', visible: boolean) {
  window.dispatchEvent(
    new CustomEvent('gurudevi:quick-access-visibility', { detail: { domain, visible } }),
  );
}

export function useQuickAccessRailVisibility(domain: 'self' | 'workspace') {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let isVisible = true;
    try {
      isVisible = window.localStorage.getItem(preferenceKey(domain)) !== 'true';
    } catch {
      isVisible = true;
    }
    setVisible(isVisible);
  }, [domain]);

  function toggle() {
    const next = !visible;
    setVisible(next);
    try {
      window.localStorage.setItem(preferenceKey(domain), String(!next));
    } catch {
      // Keep the current session preference if browser storage is unavailable.
    }
  }

  return { visible, toggle } as const;
}

export function QuickAccessRail({
  domain,
  activeId,
  items,
  onOpen,
  onTogglePin,
  pinnedIds,
  visible,
  pinLimit,
  editorPlacement = 'right',
  orientation = 'vertical',
}: Readonly<{
  domain: 'self' | 'workspace';
  activeId?: string | null;
  items: readonly QuickAccessItem[];
  onOpen: (item: QuickAccessItem) => void;
  onTogglePin: (id: string) => void;
  pinnedIds: readonly string[];
  visible: boolean;
  pinLimit?: number;
  editorPlacement?: 'left' | 'right' | 'top' | 'bottom';
  orientation?: 'vertical' | 'horizontal';
}>) {
  const [editorOpen, setEditorOpen] = useState(false);
  const pinnedItems = items.filter((item) => pinnedIds.includes(item.id));
  const visibleShortcuts = items.filter(
    (item) => pinnedIds.includes(item.id) || item.id === activeId,
  );

  useEffect(() => {
    announceVisibility(domain, visible && window.innerWidth > 767);
    return () => announceVisibility(domain, false);
  }, [domain, visible]);

  if (!visible) return null;

  return (
    <aside
      aria-label="Quick access"
      className={styles.rail}
      data-domain={domain}
      data-editor-placement={editorPlacement}
      data-orientation={orientation}
      id="workbench-quick-access"
    >
      <div className={styles.editorWrap}>
        <button
          aria-expanded={editorOpen}
          aria-label={editorOpen ? 'Close quick access editor' : 'Customize quick access'}
          className={styles.editorButton}
          onClick={() => setEditorOpen((open) => !open)}
          title={editorOpen ? 'Close quick access editor' : 'Customize quick access'}
          type="button"
        >
          {editorOpen ? '×' : '＋'}
        </button>
        {editorOpen ? (
          <section aria-label="Customize quick access" className={styles.editor}>
            <header>
              <strong>Quick access</strong>
              <button
                aria-label="Close quick access editor"
                onClick={() => setEditorOpen(false)}
                type="button"
              >
                ×
              </button>
            </header>
            <p className={styles.editorHint}>
              Pinned shortcuts stay here. Open tasks stay in the tabs above.
              {pinLimit ? ` Pin up to ${pinLimit}.` : ''}
            </p>
            {items.map((item) => {
              const pinned = pinnedIds.includes(item.id);
              const limitReached = !pinned && pinnedItems.length >= (pinLimit ?? 5);
              return (
                <button
                  aria-pressed={pinned}
                  className={styles.option}
                  disabled={limitReached}
                  key={item.id}
                  onClick={() => onTogglePin(item.id)}
                  type="button"
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  <span>{item.label}</span>
                  <span aria-hidden="true">{pinned ? '✓' : '＋'}</span>
                </button>
              );
            })}
          </section>
        ) : null}
      </div>
      {visibleShortcuts.map((item) => (
        <button
          aria-current={activeId === item.id ? 'page' : undefined}
          aria-label={`Open ${item.label}`}
          className={`${styles.shortcut} ${activeId === item.id ? styles.active : ''}`}
          key={item.id}
          onClick={() => onOpen(item)}
          title={item.label}
          type="button"
        >
          <span aria-hidden="true">{item.emoji}</span>
          <span className={styles.shortcutLabel}>{item.label}</span>
        </button>
      ))}
    </aside>
  );
}
