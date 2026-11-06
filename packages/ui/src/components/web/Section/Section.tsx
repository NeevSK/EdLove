'use client';

import { type HTMLAttributes, useId } from 'react';
import type { SectionContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface SectionProps
  extends SectionContract,
    Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** Heading level for the title. */
  level?: 2 | 3 | 4;
}

/**
 * Holds a group of rows. Which boundary (margin, thread, leaves, light, box)
 * is decided per world by the stylesheet; the markup is the same everywhere.
 */
export function Section({
  title,
  voice,
  density = 'dense',
  signal = false,
  level = 2,
  className,
  children,
  ...rest
}: SectionProps) {
  const H = `h${level}` as 'h2';
  const auto = useId();
  const headingId = `gd-section-${auto}`;
  return (
    <section
      {...rest}
      aria-labelledby={headingId}
      className={cx('gd-section', className)}
      data-density={density}
      data-signal={signal || undefined}
    >
      <H id={headingId} className="gd-section-title">
        {title}
      </H>
      <div className="gd-section-body">
        {voice ? <p className="gd-section-voice">{voice}</p> : null}
        {children}
      </div>
    </section>
  );
}
