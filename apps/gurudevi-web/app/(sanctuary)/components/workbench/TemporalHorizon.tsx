'use client';

import styles from './workbench.module.css';

type TemporalHorizonProps = Readonly<{
  dateLabel: string;
  orientation?: string;
  onPrevious?: () => void;
  onToday?: () => void;
  onNext?: () => void;
  onChooseDate?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}>;

/** A domain-owned time orientation line, rendered only by floors that need it. */
export function TemporalHorizon({
  dateLabel,
  orientation,
  onPrevious,
  onToday,
  onNext,
  onChooseDate,
  previousDisabled = false,
  nextDisabled = false,
}: TemporalHorizonProps) {
  return (
    <section aria-label="Time context" className={styles.horizon}>
      <div className={styles.horizonCopy}>
        <p className={styles.horizonDate}>{dateLabel}</p>
        {orientation ? <p className={styles.horizonOrientation}>{orientation}</p> : null}
      </div>
      <div className={styles.horizonActions}>
        {onToday ? (
          <button className={styles.horizonAction} onClick={onToday} type="button">
            Today
          </button>
        ) : null}
        {onPrevious ? (
          <button
            aria-label="Previous period"
            className={styles.horizonAction}
            disabled={previousDisabled}
            onClick={onPrevious}
            type="button"
          >
            ‹
          </button>
        ) : null}
        {onNext ? (
          <button
            aria-label="Next period"
            className={styles.horizonAction}
            disabled={nextDisabled}
            onClick={onNext}
            type="button"
          >
            ›
          </button>
        ) : null}
        {onChooseDate ? (
          <button
            className={styles.horizonAction}
            data-calendar="true"
            onClick={onChooseDate}
            type="button"
          >
            Calendar
          </button>
        ) : null}
      </div>
    </section>
  );
}
