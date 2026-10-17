'use client';

import type { WorkspaceAppearanceMotion, WorkspaceAppearancePreset } from '@repo/core/types';
import styles from './floor-atmosphere.module.css';
import { WallpaperUploadControl } from './WallpaperUploadControl';

export function WorkspaceAppearancePicker({
  currentPreset,
  currentMotion,
  onSelectWallpaper,
  onSelectPreset,
  onSelectMotion,
}: Readonly<{
  currentPreset: WorkspaceAppearancePreset;
  currentMotion: WorkspaceAppearanceMotion;
  onSelectWallpaper: (wallpaper: import('@repo/core/types').WorkspaceWallpaper) => void;
  onSelectPreset: (preset: WorkspaceAppearancePreset) => void;
  onSelectMotion: (motion: WorkspaceAppearanceMotion) => void;
}>) {
  return (
    <details className={styles.appearanceDetails}>
      <summary className={styles.atmosphereTrigger}>✨ Floor appearance</summary>
      <aside aria-label="Floor appearance configuration" className={styles.appearancePanel}>
        <section className={styles.optionSection}>
          <span className={styles.optionLabel}>Wallpaper palette</span>
          <div className={styles.buttonGridFour}>
            {(['default', 'dawn', 'garden', 'night'] as const).map((preset) => (
              <button
                className={`${styles.optionButton} ${currentPreset === preset ? styles.optionButtonActive : ''}`}
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
          <span className={styles.optionLabel}>Motion</span>
          <div className={styles.buttonGrid}>
            {(['subtle', 'off'] as const).map((motion) => (
              <button
                className={`${styles.optionButton} ${currentMotion === motion ? styles.optionButtonActive : ''}`}
                key={motion}
                onClick={() => onSelectMotion(motion)}
                type="button"
              >
                {motion === 'subtle' ? 'Breathe' : 'Static'}
              </button>
            ))}
          </div>
        </section>
        <WallpaperUploadControl onUploaded={onSelectWallpaper} />
      </aside>
    </details>
  );
}
