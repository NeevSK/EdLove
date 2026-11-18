import React, { type ReactNode } from 'react';
import styles from './room-aperture.module.css';

export type RoomApertureKind = 'doorway' | 'book' | 'canopy' | 'archive';

interface RoomApertureProps {
  kind: RoomApertureKind;
  children: ReactNode;
  className?: string;
}

/**
 * RoomAperture — Tactile Physical Micro-Transition on Room Entry
 *
 * Governed by Verger: Plays an elegant, lightweight physical arrival
 * animation (doorway opens, book unclasps, canopy dawns), or downgrades
 * to an instant 80ms fade if `data-verger-reduced-motion` is active.
 */
export function RoomAperture({
  kind,
  children,
  className = '',
}: Readonly<RoomApertureProps>) {
  const apertureClass =
    kind === 'doorway'
      ? styles.doorwayIn
      : kind === 'book'
        ? styles.bookIn
        : kind === 'canopy'
          ? styles.canopyIn
          : styles.archiveIn;

  return (
    <div className={`${styles.apertureContainer} ${apertureClass} ${className}`}>
      {children}
    </div>
  );
}
