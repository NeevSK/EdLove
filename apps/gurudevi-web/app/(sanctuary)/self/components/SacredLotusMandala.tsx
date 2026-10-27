'use client';

import React from 'react';
import styles from './sacred-lotus-mandala.module.css';

export type MandalaBreathPhase = 'inhale' | 'hold' | 'hold-in' | 'exhale' | 'rest' | 'hold-out';

interface SacredLotusMandalaProps {
  phase?: MandalaBreathPhase;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export function SacredLotusMandala({
  phase = 'inhale',
  size = 200,
  primaryColor = '#0d9488', // Emerald/teal
  secondaryColor = '#f59e0b', // Amber/gold
  accentColor = '#14b8a6',
}: SacredLotusMandalaProps) {
  const phaseClass =
    phase === 'inhale'
      ? styles.phaseInhale
      : phase === 'hold' || phase === 'hold-in'
        ? styles.phaseHoldIn
        : phase === 'exhale'
          ? styles.phaseExhale
          : styles.phaseHoldOut;

  // 8 outer petal angles (0, 45, 90, 135, 180, 225, 270, 315)
  const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  // 8 inner petal angles offset by 22.5 deg
  const innerAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  return (
    <div
      className={styles.lotusContainer}
      style={{ width: size, height: size, color: primaryColor }}
    >
      <svg
        viewBox="-100 -100 200 200"
        width={size}
        height={size}
        className={`${styles.lotusSvg} ${phaseClass}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="lotusCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.9" />
            <stop offset="60%" stopColor={primaryColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>

          <linearGradient id="outerPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
            <stop offset="65%" stopColor={accentColor} stopOpacity="0.65" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="innerPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Ambient background bloom */}
        <circle cx="0" cy="0" r="85" fill="url(#lotusCenterGlow)" />

        {/* Outer Rotating Sacred Resonance Rings */}
        <circle cx="0" cy="0" r="88" className={styles.resonanceRing} stroke={primaryColor} />
        <circle cx="0" cy="0" r="72" className={styles.resonanceRingInner} stroke={secondaryColor} />

        {/* 8 Outer Petals */}
        <g>
          {outerAngles.map((angle) => (
            <path
              key={`outer-${angle}`}
              d="M 0,0 C -16,-28 -18,-62 0,-76 C 18,-62 16,-28 0,0 Z"
              fill="url(#outerPetalGrad)"
              stroke={primaryColor}
              strokeWidth="0.75"
              strokeOpacity="0.6"
              className={styles.outerPetal}
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* 8 Inner Petals */}
        <g>
          {innerAngles.map((angle) => (
            <path
              key={`inner-${angle}`}
              d="M 0,0 C -12,-18 -12,-44 0,-54 C 12,-44 12,-18 0,0 Z"
              fill="url(#innerPetalGrad)"
              stroke={secondaryColor}
              strokeWidth="0.85"
              strokeOpacity="0.7"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* Golden Central Bindu Core */}
        <circle
          cx="0"
          cy="0"
          r="14"
          fill={secondaryColor}
          className={styles.centerBindu}
          opacity="0.9"
        />
        <circle cx="0" cy="0" r="6" fill="#ffffff" opacity="0.95" />
      </svg>
    </div>
  );
}
