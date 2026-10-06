'use client';

import type { WorkspaceAppearance } from '@repo/core/types';
import { useState } from 'react';
import { type ProfileSection, useProfileCanvas } from '../../../lib/canvas/useProfileCanvas';
import { AccountDeletionControl } from './AccountDeletionControl';
import styles from './profile.module.css';

const SECTION_LABELS: Record<ProfileSection, { label: string; icon: string }> = {
  identity: { label: 'Identity', icon: '👤' },
  settings: { label: 'Atmosphere & Motion', icon: '✨' },
  security: { label: 'Security & Data', icon: '🛡️' },
};

const PRESET_OPTIONS: readonly {
  id: WorkspaceAppearance['preset'];
  label: string;
  description: string;
}[] = [
  { id: 'default', label: 'Default', description: 'Warm sandstone' },
  { id: 'dawn', label: 'Dawn', description: 'Sunrise coral' },
  { id: 'garden', label: 'Garden', description: 'Fresh pine' },
  { id: 'night', label: 'Night', description: 'Deep cosmic' },
];

export function ProfileFloor({
  accountId,
  displayName,
  primaryScopeRole,
}: Readonly<{ accountId: string; displayName: string; primaryScopeRole: string }>) {
  const canvas = useProfileCanvas({
    accountId,
  });
  const [activeSection, setActiveSection] = useState<ProfileSection>('identity');

  return (
    <article
      aria-labelledby="profile-title"
      className={styles.profile}
      data-appearance={canvas.appearance.preset}
      data-domain="profile"
      data-motion={canvas.appearance.motion}
    >
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Profile</p>
        <h1 id="profile-title">Your Sanctuary Persona</h1>
        <p>
          {displayName}, manage your verified credentials, workspace atmosphere, and account safety.
        </p>
      </header>

      <div className={styles.masterDetailLayout}>
        {/* Mobile quick-switch pills */}
        <div className={styles.mobileSectionPills} role="tablist" aria-label="Profile sections">
          {canvas.sections.map((section) => (
            <button
              key={section}
              type="button"
              role="tab"
              aria-selected={activeSection === section}
              className={`${styles.mobilePill} ${activeSection === section ? styles.mobilePillActive : ''}`}
              onClick={() => setActiveSection(section)}
            >
              {SECTION_LABELS[section].icon} {SECTION_LABELS[section].label}
            </button>
          ))}
        </div>

        {/* Desktop / Tablet rail */}
        <aside className={styles.sectionsRail} aria-label="Profile navigation rail">
          <span className={styles.sectionsRailTitle}>Sections</span>
          {canvas.sections.map((section) => (
            <button
              key={section}
              type="button"
              className={`${styles.railItem} ${activeSection === section ? styles.railItemActive : ''}`}
              onClick={() => setActiveSection(section)}
            >
              <span>{SECTION_LABELS[section].icon}</span>
              <span>{SECTION_LABELS[section].label}</span>
            </button>
          ))}
        </aside>

        {/* Stage */}
        <main className={styles.activeSectionStage}>
          {activeSection === 'identity' && (
            <section className={styles.identity} aria-label="Verified profile identity">
              <dl>
                <div>
                  <dt>Display name</dt>
                  <dd>{displayName}</dd>
                </div>
                <div>
                  <dt>Selected sanctuary role</dt>
                  <dd>{primaryScopeRole}</dd>
                </div>
                <div>
                  <dt>Account ID</dt>
                  <dd>{accountId}</dd>
                </div>
              </dl>
              <p className={styles.readOnly} role="note">
                Read-only profile identity verified by Sanctuary.
              </p>
            </section>
          )}

          {activeSection === 'settings' && (
            <section
              className={styles.atmosphereSettings}
              aria-label="Atmosphere and motion settings"
            >
              <h2>Workspace Atmosphere</h2>
              <p>Choose the ambient tone and particle backdrop for your sanctuary floors.</p>

              <div className={styles.presetGrid}>
                {PRESET_OPTIONS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${styles.presetButton} ${canvas.appearance.preset === preset.id ? styles.presetButtonActive : ''}`}
                    onClick={() =>
                      void canvas.setAppearance({
                        preset: preset.id,
                        motion: canvas.appearance.motion,
                      })
                    }
                  >
                    <span>{preset.label}</span>
                    <small>{preset.description}</small>
                  </button>
                ))}
              </div>

              <div className={styles.motionRow}>
                <div>
                  <strong>Particle Motion</strong>
                  <p>Ambient floating particles responding to the selected preset.</p>
                </div>
                <button
                  type="button"
                  className={`${styles.motionToggle} ${canvas.appearance.motion === 'subtle' ? styles.motionToggleActive : ''}`}
                  onClick={() =>
                    void canvas.setAppearance({
                      preset: canvas.appearance.preset,
                      motion: canvas.appearance.motion === 'subtle' ? 'off' : 'subtle',
                    })
                  }
                >
                  {canvas.appearance.motion === 'subtle' ? 'Motion: On' : 'Motion: Off'}
                </button>
              </div>
            </section>
          )}

          {activeSection === 'security' && (
            <section className={styles.deletion} aria-label="Security and account deletion">
              <h2>Account Safety & Data</h2>
              <p>
                Manage your credentials or request permanent deletion of your account and all
                associated sanctuary history.
              </p>
              <AccountDeletionControl />
            </section>
          )}
        </main>
      </div>
    </article>
  );
}
