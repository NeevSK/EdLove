'use client';

import { useEffect, useRef } from 'react';
import type { ListContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { EmptyState } from '../States/States';
import { WorldSkeleton } from '../Waiting/Waiting';

export interface ListProps<T> extends ListContract<T> {
  className?: string;
}

const PLACEHOLDERS = 5;

/**
 * A long collection as a real list. Rows skip rendering while off screen
 * (content-visibility), so long lists stay light without a virtualizer;
 * `onEndReached` fires when the end scrolls near.
 */
export function List<T>({ items, keyOf, renderItem, label, empty, loading, onEndReached, className }: ListProps<T>) {
  const end = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const sentinel = end.current;
    if (!sentinel || !onEndReached || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) onEndReached();
    }, { rootMargin: '400px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onEndReached, items.length]);

  if (loading && items.length === 0) {
    return (
      <ul aria-label={label} aria-busy="true" className={cx('gd-list gd-list-loading', className)}>
        {Array.from({ length: PLACEHOLDERS }, (_, i) => (
          <li key={i}>
            <WorldSkeleton height={52} />
          </li>
        ))}
      </ul>
    );
  }

  if (items.length === 0 && empty) return <EmptyState {...empty} className={className} />;

  return (
    <ul aria-label={label} className={cx('gd-list', className)}>
      {items.map((item, i) => (
        <li key={keyOf(item)} className="gd-list-item">
          {renderItem(item, i)}
        </li>
      ))}
      {onEndReached ? <li ref={end} aria-hidden="true" className="gd-list-end" /> : null}
    </ul>
  );
}
