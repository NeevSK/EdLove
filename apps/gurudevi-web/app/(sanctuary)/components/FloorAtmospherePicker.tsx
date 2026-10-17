'use client';

import type { WorkspaceAppearanceMotion, WorkspaceAppearancePreset } from '@repo/core/types';
import React, { useState } from 'react';
import type { FloorAtmosphereKind } from './FloorAtmosphere';
import styles from './floor-atmosphere.module.css';

interface FloorAtmospherePickerProps {
  currentPreset: WorkspaceAppearancePreset;
  currentMotion: WorkspaceAppearanceMotion;
  currentAtmosphere: FloorAtmosphereKind;
  onSelectPreset: (preset: WorkspaceAppearancePreset) => void;
  onSelectMotion: (motion: WorkspaceAppearanceMotion) => void;
  onSelectAtmosphere: (kind: FloorAtmosphereKind) => void;
}

export function FloorAtmospherePicker({
  currentPreset,
  currentMotion,
  currentAtmosphere,
  onSelectPreset,
  onSelectMotion,
  onSelectAtmosphere,
}: Readonly<FloorAtmospherePickerProps>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-label="Customize Floor Atmosphere"
        className={styles.atmosphereTrigger}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span>✨</span>
        <span>Atmosphere</span>
      </button>

      {isOpen ? (
        <aside aria-label="Floor Atmosphere Configuration" className={styles.atmospherePanel}>
          <header className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Floor Atmosphere</h3>
            <button
              aria-label="Close atmosphere picker"
              className={styles.panelClose}
              onClick={() => setIsOpen(false)}
              type="button"
            >
              ✕
            </button>
          </header>

          <section className={styles.optionSection}>
            <span className={styles.optionLabel}>Time & Palette</span>
            <div className={styles.buttonGridFour}>
              {(['default', 'dawn', 'garden', 'night'] as const).map((preset) => (
                <button
                  className={`${styles.optionButton} ${
                    currentPreset === preset ? styles.optionButtonActive : ''
                  }`}
                  key={preset}
                  onClick={() => onSelectPreset(preset)}
                  type="button"
                >
                  {preset}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.optionSection}>
            <span className={styles.optionLabel}>Atmospheric Shader FX</span>
            <div className={styles.buttonGrid}>
              {(
                [
                  { id: 'none', label: 'Plain' },
                  { id: 'washi-grain', label: 'Washi Grain' },
                  { id: 'aurora-mesh', label: 'Aurora Mesh' },
                  { id: 'celestial-embers', label: 'Embers' },
                ] as const
              ).map((fx) => (
                <button
                  className={`${styles.optionButton} ${
                    currentAtmosphere === fx.id ? styles.optionButtonActive : ''
                  }`}
                  key={fx.id}
                  onClick={() => onSelectAtmosphere(fx.id)}
                  type="button"
                >
                  {fx.label}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.optionSection}>
            <span className={styles.optionLabel}>Respiration Motion</span>
            <div className={styles.buttonGrid}>
              {(
                [
                  { id: 'subtle', label: 'Breathe' },
                  { id: 'off', label: 'Static' },
                ] as const
              ).map((motion) => (
                <button
                  className={`${styles.optionButton} ${
                    currentMotion === motion.id ? styles.optionButtonActive : ''
                  }`}
                  key={motion.id}
                  onClick={() => onSelectMotion(motion.id)}
                  type="button"
                >
                  {motion.label}
                </button>
              ))}
            </div>
          </section>
        </aside>
      ) : null}
    </>
  );
}
