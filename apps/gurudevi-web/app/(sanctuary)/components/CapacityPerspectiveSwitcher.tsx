'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  EXPLORE_CAPACITIES,
  type ExploreCapacity,
  getExploreCapacityMeta,
  setExploreCapacity,
  useExploreCapacity,
} from '../../../lib/explore/exploreCapacity';
import styles from './capacity-perspective-switcher.module.css';

export interface CapacityPerspectiveSwitcherProps {
  readonly mode?: 'explore' | 'account';
  readonly activeCapacity?: string;
  readonly onChange?: (capacity: ExploreCapacity) => void;
}

export function CapacityPerspectiveSwitcher({
  mode = 'explore',
  activeCapacity,
  onChange,
}: Readonly<CapacityPerspectiveSwitcherProps>) {
  const exploreCapacity = useExploreCapacity();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const isExplore = mode === 'explore' || !activeCapacity;
  const currentCapacity = isExplore ? exploreCapacity : activeCapacity;
  const meta = getExploreCapacityMeta(currentCapacity);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isExplore) {
    return (
      <span className={styles.staticBadge} title={`Active Capacity Bond: ${meta.roleTitle}`}>
        <span aria-hidden="true">✦</span> {meta.roleTitle}
      </span>
    );
  }

  function handleSelect(capacity: ExploreCapacity) {
    setExploreCapacity(capacity);
    onChange?.(capacity);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current Perspective: ${meta.label}. Click to switch role perspective.`}
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        ref={triggerRef}
        type="button"
      >
        <span className={styles.prefix}>Perspective:</span>
        <span className={styles.activeRole}>{meta.label}</span>
        <span aria-hidden="true" className={styles.caret}>
          ▾
        </span>
      </button>

      {isOpen ? (
        <div aria-label="Role perspectives" className={styles.dropdown} id={menuId} role="listbox">
          <div className={styles.menuHeader}>
            <div className={styles.menuHeaderTitle}>Explore Sandbox Perspective</div>
            <div className={styles.menuHeaderSubtitle}>
              Switch role to experience domain capabilities tailored for this capacity.
            </div>
          </div>
          {EXPLORE_CAPACITIES.map((item) => {
            const isSelected = item.id === exploreCapacity;
            return (
              <button
                aria-selected={isSelected}
                className={`${styles.option} ${isSelected ? styles.optionActive : ''}`}
                key={item.id}
                onClick={() => handleSelect(item.id)}
                role="option"
                type="button"
              >
                <div className={styles.optionTitleRow}>
                  <span className={styles.optionTitle}>{item.roleTitle}</span>
                  {isSelected ? (
                    <span aria-hidden="true" className={styles.optionCheck}>
                      ✓
                    </span>
                  ) : null}
                </div>
                <div className={styles.optionDescription}>{item.description}</div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
