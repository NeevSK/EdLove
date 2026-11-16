'use client';

import Link from 'next/link';
import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import styles from './explore-preview-floor.module.css';

export interface ExploreHighlight {
  icon: string;
  title: string;
  detail: string;
}

export interface ExplorePreviewFloorProps {
  title: string;
  tagline?: string;
  description: string;
  highlights?: readonly ExploreHighlight[];
  category?: string;
  backHref?: string;
  backLabel?: string;
  mascotSrc?: string;
}

const DEFAULT_HIGHLIGHTS: readonly ExploreHighlight[] = [];

export function ExplorePreviewFloor({
  title,
  tagline,
  description,
  highlights = DEFAULT_HIGHLIGHTS,
  category = 'Institutional Capability',
  backHref = '/workspace',
  backLabel = 'Return to Workspace',
  mascotSrc = '/mascot/firefly-guide-coming-soon-light-cutout-v2.webp',
}: Readonly<ExplorePreviewFloorProps>) {
  return (
    <div className={styles.container}>
      <div className={styles.badge}>
        <span aria-hidden="true">✦</span>
        <span>Explore Preview · {category}</span>
      </div>

      <div className={styles.mascotWrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mascotSrc}
          alt="Tutii the firefly guide preparing this sanctuary capability"
          className={styles.mascotImage}
        />
      </div>

      <h1 className={styles.title}>{title}</h1>
      {tagline ? <p className={styles.tagline}>{tagline}</p> : null}

      <p className={styles.description}>{description}</p>

      {highlights.length > 0 ? (
        <div className={styles.highlightsGrid}>
          {highlights.map((highlight) => (
            <div key={highlight.title} className={styles.highlightCard}>
              <span className={styles.highlightIcon} aria-hidden="true">
                {highlight.icon}
              </span>
              <h2 className={styles.highlightTitle}>{highlight.title}</h2>
              <p className={styles.highlightDetail}>{highlight.detail}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className={styles.actions}>
        <a
          href={resolveSurfaceUrl('sanctuary', '/welcome')}
          className={styles.primaryButton}
        >
          Enter Sanctuary to Unlock →
        </a>
        <Link href={backHref} className={styles.secondaryButton}>
          ← {backLabel}
        </Link>
      </div>
    </div>
  );
}

