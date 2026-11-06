'use client';

import React from 'react';
import styles from '../self-floor.module.css';

export interface HearthAnchorCardProps {
  eyebrow: string;
  title: string;
  description: string;
  buttonText: string;
  onOpen: () => void;
  titleId?: string;
}

export function HearthAnchorCard({
  eyebrow,
  title,
  description,
  buttonText,
  onOpen,
  titleId = 'self-pinned-title',
}: Readonly<HearthAnchorCardProps>) {
  return (
    <div className={styles.hearthAnchorSurface}>
      <div className={styles.hearthAnchorHeader}>
        <p className={styles.eyebrow} style={{ margin: 0 }}>
          {eyebrow}
        </p>
        <h2 id={titleId} className={styles.hearthAnchorTitle}>
          {title}
        </h2>
        <p className={styles.hearthAnchorDesc}>
          {description}
        </p>
      </div>
      <div>
        <button
          className={styles.burnButton}
          onClick={onOpen}
          type="button"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
