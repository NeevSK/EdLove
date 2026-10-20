'use client';

import type { WorkspaceAppearance } from '@repo/core/types';
import Link from 'next/link';
import { useState } from 'react';
import { type ProfileSection, useProfileCanvas } from '../../../lib/canvas/useProfileCanvas';
import {
  getExploreCapacityMeta,
  useExploreCapacity,
} from '../../../lib/explore/exploreCapacity';
import { AccountSignOut } from '../components/AccountSignOut';
import { CapacityPerspectiveSwitcher } from '../components/CapacityPerspectiveSwitcher';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import { AccountDeletionControl } from './AccountDeletionControl';
import styles from './profile.module.css';

const PROFILE_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'profile-intro', label: 'Persona & Role Header', icon: '👤' },
  { id: 'profile-stage', label: 'Active Profile Module Stage', icon: '🪷' },
];

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
  isExplore = false,
}: Readonly<{
  accountId: string;
  displayName: string;
  primaryScopeRole: string;
  isExplore?: boolean;
}>) {
  const canvas = useProfileCanvas({
    accountId,
  });
  const [activeSection, setActiveSection] = useState<ProfileSection>('identity');
  const exploreCapacity = useExploreCapacity();
  const exploreRole = getExploreCapacityMeta(exploreCapacity);

  return (
    <SanctuaryFloorCanvas
      appearance={canvas.appearance}
      domain="profile"
      furnitureItems={PROFILE_FURNITURE_ITEMS}
      setAppearance={canvas.setAppearance}
      titleId="profile-title"
    >
      {({ isModuleVisible }) => (
        <div
          className={styles.profile}
          data-appearance={canvas.appearance.preset}
          data-domain="profile"
          data-motion={canvas.appearance.motion}
        >
          {isModuleVisible('profile-intro') && (
            <header className={styles.intro}>
              <p className={styles.eyebrow}>Profile</p>
              <h1 id="profile-title">Your Sanctuary Persona</h1>
              <p>
                {displayName}, manage your verified credentials, workspace atmosphere, and account safety.
              </p>
            </header>
          )}

          {isModuleVisible('profile-stage') && (
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
                    <div className={styles.avatarContainer}>
                      <div className={styles.avatarCircle} aria-hidden="true">👤</div>
                      <div>
                        <strong>{displayName}</strong>
                        <p>{isExplore ? 'Guest Explorer' : primaryScopeRole}</p>
                      </div>
                    </div>
                    {isExplore && (
                      <div
                        style={{
                          padding: '1rem',
                          marginBottom: '1.25rem',
                          borderRadius: '0.75rem',
                          background: 'var(--paper-light)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          🪷 Guest Explorer Sandbox
                        </strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', margin: '0 0 0.75rem' }}>
                          Exploring as {exploreRole.roleTitle}. Your sample activity stays separate from a Sanctuary account.
                        </p>
                        <CapacityPerspectiveSwitcher mode="explore" />
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <a
                            href="https://sanctuary.gurudevi.app/welcome"
                            style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '999px',
                              background: 'var(--color-sanctuary-saffron, #a85022)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            Go to Sanctuary ↗
                          </a>
                        </div>
                      </div>
                    )}
                    <dl>
                      <div>
                        <dt>Display name</dt>
                        <dd>{displayName}</dd>
                      </div>
                      <div>
                        <dt>Selected sanctuary role</dt>
                        <dd>{isExplore ? exploreRole.roleTitle : primaryScopeRole}</dd>
                      </div>
                      <div>
                        <dt>Account ID</dt>
                        <dd>{isExplore ? 'Browser Local Session' : accountId}</dd>
                      </div>
                    </dl>
                    <p className={styles.readOnly} role="note">
                      {isExplore
                        ? 'Guest sandbox mode. All reflections and notes are stored locally.'
                        : 'Read-only profile identity verified by Sanctuary.'}
                    </p>

                    {/* Full Fidelity Profile Additions */}
                    <div className={styles.completionCard}>
                      <div className={styles.completionHeader}>
                        <span className={styles.completionTitle}>Profile Calibration Progress</span>
                        <span className={styles.completionPercent}>75%</span>
                      </div>
                      <div className={styles.completionTrack}>
                        <div className={styles.completionFill} style={{ width: '75%' }} />
                      </div>
                      <div className={styles.completionSteps}>
                        <span>✓ Persona & Guest Identity established</span>
                        <span>✓ Workspace Atmosphere calibrated</span>
                        <span>✓ Daily attendance tested in sandbox</span>
                        <span>○ Complete permanent Sanctuary enrollment</span>
                      </div>
                    </div>

                    <div className={styles.statsGrid}>
                      <div className={styles.statCard}>
                        <div className={styles.statNumber}>3</div>
                        <div className={styles.statLabel}>Circles Visited</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statNumber}>5d</div>
                        <div className={styles.statLabel}>Mindful Streak</div>
                      </div>
                      <div className={styles.statCard}>
                        <div className={styles.statNumber}>1</div>
                        <div className={styles.statLabel}>Journal Released</div>
                      </div>
                    </div>

                    <div className={styles.tagsSection}>
                      <div className={styles.tagsTitle}>Pedagogical Focus Areas & Circles</div>
                      <div className={styles.tagsRow}>
                        <span className={styles.tagPill}>🪷 Mindful Pedagogies</span>
                        <span className={styles.tagPill}>🧭 Restorative Inquiring</span>
                        <span className={styles.tagPill}>🌿 Forest Learning</span>
                        <span className={styles.tagPill}>📊 Compassionate Analytics</span>
                      </div>
                    </div>

                    <div className={styles.qrExplorationCard}>
                      <div className={styles.qrContent}>
                        <h4 className={styles.qrTitle}>Living Guest Exploration Pass</h4>
                        <p className={styles.qrDesc}>
                          Share your sandbox exploration link with fellow educators or students to collaborate in contemplative guest mode.
                        </p>
                        <button
                          type="button"
                          className={styles.copyQrBtn}
                          onClick={() => {
                            if (navigator.clipboard?.writeText) {
                              void navigator.clipboard.writeText('https://explore.gurudevi.app');
                              alert('Guest exploration link copied to clipboard!');
                            }
                          }}
                        >
                          Copy Guest House Link ↗
                        </button>
                      </div>
                    </div>
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
                    {isExplore ? (
                      <div
                        style={{
                          padding: '1.25rem',
                          background: 'var(--paper-light)',
                          borderRadius: '0.75rem',
                          border: '1px solid var(--line)',
                        }}
                      >
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>
                          Zero Cloud Telemetry Guarantee
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 1rem' }}>
                          Under Sri Lanka PDPA No. 9 of 2022, no personal biometric or learning data is uploaded to remote cloud databases during public exploration.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Reset all local guest session data and cached preferences?')) {
                              localStorage.clear();
                              window.location.reload();
                            }
                          }}
                          style={{
                            padding: '0.45rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--color-danger, #b23b3b)',
                            background: 'transparent',
                            color: 'var(--color-danger, #b23b3b)',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Purge Local Guest Storage
                        </button>
                      </div>
                    ) : (
                      <>
                        <p>
                          Manage your credentials or request permanent deletion of your account and all
                          associated sanctuary history.
                        </p>
                        <p><Link href="/sign-in">Switch account</Link></p>
                        <AccountSignOut />
                        <AccountDeletionControl />
                      </>
                    )}
                  </section>
                )}
              </main>
            </div>
          )}
        </div>
      )}
    </SanctuaryFloorCanvas>
  );
}
