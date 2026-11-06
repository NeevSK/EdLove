'use client';

import { type HTMLAttributes, useId, useRef, useState } from 'react';
import type { CarouselContract } from '../../../theme/contracts';
import { Button } from '../Button/Button';
import { cx } from '../cx';

export interface CarouselProps<T>
  extends CarouselContract<T>,
    Omit<HTMLAttributes<HTMLElement>, 'children'> {}

const ENGLISH = {
  previous: 'Previous',
  next: 'Next',
  position: (n: number, total: number) => `${n} of ${total}`,
};

/**
 * One item per page: scroll, swipe or use the buttons. The position is
 * announced when it changes. It never moves by itself.
 */
export function Carousel<T>({
  label,
  items,
  keyOf,
  renderItem,
  labels = ENGLISH,
  onPageChange,
  className,
  ...rest
}: CarouselProps<T>) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const total = items.length;

  const moveTo = (index: number) => {
    if (index === page) return;
    setPage(index);
    onPageChange?.(index);
  };

  const show = (index: number) => {
    const next = Math.max(0, Math.min(total - 1, index));
    moveTo(next);
    const el = track.current;
    // scrollTo is absent in jsdom and some embedded webviews; the page state still moves.
    if (el && typeof el.scrollTo === 'function') el.scrollTo({ left: next * el.clientWidth });
  };

  return (
    <section
      {...rest}
      aria-roledescription="carousel"
      aria-labelledby={`${id}-label`}
      className={cx('gd-carousel', className)}
    >
      <p id={`${id}-label`} className="gd-text gd-visually-hidden">
        {label}
      </p>
      <ul
        ref={track}
        className="gd-carousel-track"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.clientWidth > 0) moveTo(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {items.map((item, i) => (
          <li
            key={keyOf(item)}
            className="gd-carousel-page"
            aria-roledescription="slide"
            aria-label={labels.position(i + 1, total)}
            aria-hidden={i === page ? undefined : true}
            inert={i !== page}
          >
            {renderItem(item, i)}
          </li>
        ))}
      </ul>
      <div className="gd-carousel-controls">
        <Button
          label={labels.previous}
          variant="quiet"
          size="sm"
          disabled={page === 0}
          onClick={() => show(page - 1)}
        />
        <span className="gd-carousel-position">
          <span className="gd-carousel-dots" aria-hidden>
            {items.map((item, i) => (
              <span key={keyOf(item)} className="gd-dot" data-on={i === page ? '' : undefined} />
            ))}
          </span>
          <span className="gd-text" data-kind="caption" aria-live="polite">
            {labels.position(page + 1, total)}
          </span>
        </span>
        <Button
          label={labels.next}
          variant="quiet"
          size="sm"
          disabled={page >= total - 1}
          onClick={() => show(page + 1)}
        />
      </div>
    </section>
  );
}
