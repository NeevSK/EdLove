'use client';

import { useRef } from 'react';
import type { SegmentedContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { feel } from '../feel';
import { rovingNext } from '../roving';

export interface SegmentedControlProps<V extends string = string> extends SegmentedContract<V> {
  className?: string;
}

/**
 * Two to four short choices that switch a view in place. The track is the
 * world's inset well; the chosen segment is lifted in its raised surface. A
 * radio group: arrow keys move the choice, with one tab stop.
 */
export function SegmentedControl<V extends string = string>({
  value,
  onChange,
  label,
  options,
  className,
}: SegmentedControlProps<V>) {
  const refs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('gd-segmented', className)}
      onKeyDown={(event) => {
        const next = rovingNext(event, options, value);
        if (next === null) return;
        feel('select');
        onChange(next);
        refs.current[next]?.focus();
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[option.value] = el;
            }}
            type="button"
            role="radio"
            className="gd-segment"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={option.disabled}
            onClick={() => {
              feel('select');
              onChange(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
