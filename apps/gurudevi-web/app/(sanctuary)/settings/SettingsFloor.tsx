'use client';

import type { WorkspaceAppearanceMotion, WorkspaceAppearancePreset } from '@repo/core/types';
import React, { useEffect, useState } from 'react';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import styles from './settings.module.css';

interface SettingsFloorProps {
  displayName: string;
  capacity?: string;
  isExplore?: boolean;
}

export function SettingsFloor({ displayName, capacity, isExplore }: Readonly<SettingsFloorProps>) {
  const [preset, setPreset] = useState<WorkspaceAppearancePreset>('default');
  const [motion, setMotion] = useState<WorkspaceAppearanceMotion>('subtle');
  const [language, setLanguage] = useState<'en' | 'si' | 'ta'>('en');
  const [highContrast, setHighContrast] = useState(false);
  const [telemetryConsent, setTelemetryConsent] = useState(true);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [navigationLayout, setNavigationLayout] = useState<'horizontal' | 'side'>('horizontal');

  useEffect(() => {
    try {
      setNavigationLayout(localStorage.getItem('gurudevi_navigation_layout_v1') === 'side' ? 'side' : 'horizontal');
    } catch {
      setNavigationLayout('horizontal');
    }
    // Read appearance from root dataset or localStorage
    const savedPreset = localStorage.getItem(
      'gurudevi_appearance_preset',
    ) as WorkspaceAppearancePreset | null;
    if (savedPreset) {
      setPreset(savedPreset);
      document.documentElement.setAttribute('data-appearance', savedPreset);
    }
    const savedMotion = localStorage.getItem(
      'gurudevi_motion_preset',
    ) as WorkspaceAppearanceMotion | null;
    if (savedMotion) {
      setMotion(savedMotion);
    }
    const savedLang = localStorage.getItem('gurudevi_language') as 'en' | 'si' | 'ta' | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
    // Check PDPA cookie
    const hasConsent = document.cookie.includes('gurudevi_pdpa_consent=true');
    setTelemetryConsent(hasConsent);
  }, []);

  const handleNavigationLayoutChange = (layout: 'horizontal' | 'side') => {
    setNavigationLayout(layout);
    try {
      localStorage.setItem('gurudevi_navigation_layout_v1', layout);
    } catch {
      // Keep the selection for this session when storage is unavailable.
    }
    window.dispatchEvent(new Event('gurudevi:navigation-layout'));
    triggerSavedNotice('Navigation layout updated');
  };

  const handlePresetChange = (newPreset: WorkspaceAppearancePreset) => {
    setPreset(newPreset);
    localStorage.setItem('gurudevi_appearance_preset', newPreset);
    document.documentElement.setAttribute('data-appearance', newPreset);
    triggerSavedNotice('Appearance updated to ' + newPreset);
  };

  const handleMotionChange = (newMotion: WorkspaceAppearanceMotion) => {
    setMotion(newMotion);
    localStorage.setItem('gurudevi_motion_preset', newMotion);
    triggerSavedNotice('Motion preference updated to ' + newMotion);
  };

  const handleLanguageChange = (newLang: 'en' | 'si' | 'ta') => {
    setLanguage(newLang);
    localStorage.setItem('gurudevi_language', newLang);
    triggerSavedNotice(
      'Language preference set to ' +
        (newLang === 'si' ? 'Sinhala' : newLang === 'ta' ? 'Tamil' : 'English'),
    );
  };

  const handleConsentToggle = () => {
    const nextConsent = !telemetryConsent;
    setTelemetryConsent(nextConsent);
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `gurudevi_pdpa_consent=${nextConsent}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    triggerSavedNotice(
      nextConsent ? 'PDPA analytics consent granted' : 'PDPA analytics consent revoked',
    );
  };

  const triggerSavedNotice = (msg: string) => {
    setSavedNotification(msg);
    setTimeout(() => {
      setSavedNotification(null);
    }, 2800);
  };

  return (
    <SanctuaryFloorCanvas domain="settings" titleId="settings-title">
      <div className={styles.container}>
        <header className={styles.headerBar}>
          <h1 id="settings-title">Sanctuary Settings</h1>
          <p>
            Personalize your atmosphere, sensory motion, privacy consent, and regional accessibility.
          </p>
        </header>

        {isExplore && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              background: 'var(--color-paper-light, #f7f3ea)',
              border: '1px solid var(--color-line, rgba(104, 94, 85, 0.2))',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <strong style={{ display: 'block', color: 'var(--color-ink, #131e27)' }}>
                Guest Preferences Active
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft, #453c35)' }}>
                Your settings are saved locally to this device under Sri Lanka PDPA No. 9 of 2022.
              </span>
            </div>
            <a
              href="https://sanctuary.gurudevi.app/sign-in"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'underline',
              }}
            >
              Enter Sanctuary to Sync ↗
            </a>
          </div>
        )}

        {savedNotification && (
          <div
            aria-live="polite"
            className={styles.optionSub}
            style={{ color: 'var(--color-leaf, #2e5d32)', fontWeight: 700 }}
          >
            ✓ {savedNotification}
          </div>
        )}

      <div className={styles.sectionsList}>
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}><span>🧭</span><span>Navigation & workspace</span></h2>
          <p className={styles.sectionDescription}>Choose where the main destinations live. On small screens, navigation stays in the bottom bar.</p>
          <div aria-label="Desktop navigation layout" className={styles.optionsGrid} role="group">
            <button
              aria-pressed={navigationLayout === 'horizontal'}
              className={styles.optionCard}
              data-selected={navigationLayout === 'horizontal'}
              onClick={() => handleNavigationLayoutChange('horizontal')}
              type="button"
            >
              <span className={styles.optionLabel}>Horizontal row</span>
              <span className={styles.optionSub}>Recommended · keeps the workspace wide</span>
            </button>
            <button
              aria-pressed={navigationLayout === 'side'}
              className={styles.optionCard}
              data-selected={navigationLayout === 'side'}
              onClick={() => handleNavigationLayoutChange('side')}
              type="button"
            >
              <span className={styles.optionLabel}>Side rail</span>
              <span className={styles.optionSub}>A familiar vertical menu for desktop</span>
            </button>
          </div>
        </section>
        {/* Appearance & Diurnal Palette */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🎨</span>
            <span>Diurnal Atmosphere & Color</span>
          </h2>
          <p className={styles.sectionDescription}>
            Gurudevi adapts to your natural daily rhythm. Each theme is calibrated to WCAG 3.0 /
            APCA contrast thresholds ($L_c \ge 75$) for eye health.
          </p>

          <div className={styles.optionsGrid}>
            <button
              className={styles.optionCard}
              data-selected={preset === 'default'}
              onClick={() => handlePresetChange('default')}
              type="button"
            >
              <span className={styles.optionLabel}>Natural Sanctuary</span>
              <span className={styles.optionSub}>
                Soft natural parchment tones matching system diurnal time
              </span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={preset === 'dawn'}
              onClick={() => handlePresetChange('dawn')}
              type="button"
            >
              <span className={styles.optionLabel}>Dawn (Vellum)</span>
              <span className={styles.optionSub}>
                Warm morning gold with high lightness contrast
              </span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={preset === 'garden'}
              onClick={() => handlePresetChange('garden')}
              type="button"
            >
              <span className={styles.optionLabel}>Garden (Sage)</span>
              <span className={styles.optionSub}>
                Earthy greens and quiet botanical tones for restful reading
              </span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={preset === 'night'}
              onClick={() => handlePresetChange('night')}
              type="button"
            >
              <span className={styles.optionLabel}>Night (Charcoal)</span>
              <span className={styles.optionSub}>
                Deep contemplative dark surface with halation protection
              </span>
            </button>
          </div>
        </section>

        {/* Motion & Vestibular Safety */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🌊</span>
            <span>Motion & Sensory Balance</span>
          </h2>
          <p className={styles.sectionDescription}>
            Control transitions, particle animations, and breathing rings to support focus and
            prevent vestibular fatigue.
          </p>

          <div className={styles.optionsGrid}>
            <button
              className={styles.optionCard}
              data-selected={motion === 'subtle'}
              onClick={() => handleMotionChange('subtle')}
              type="button"
            >
              <span className={styles.optionLabel}>Gentle Presence (Subtle)</span>
              <span className={styles.optionSub}>
                Fluid meditative breathing and calming transitions
              </span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={motion === 'off'}
              onClick={() => handleMotionChange('off')}
              type="button"
            >
              <span className={styles.optionLabel}>Calm / Off (Reduced Motion)</span>
              <span className={styles.optionSub}>
                Zero rapid animations, static breath visualizers for vestibular comfort
              </span>
            </button>
          </div>
        </section>

        {/* Language & Regional Scripts */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🗣️</span>
            <span>Language & Curricular Script</span>
          </h2>
          <p className={styles.sectionDescription}>
            Display language for contemplative prompts, menus, and national school curricula.
          </p>

          <div className={styles.optionsGrid}>
            <button
              className={styles.optionCard}
              data-selected={language === 'en'}
              onClick={() => handleLanguageChange('en')}
              type="button"
            >
              <span className={styles.optionLabel}>English</span>
              <span className={styles.optionSub}>Gurudevi Global Edition</span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={language === 'si'}
              onClick={() => handleLanguageChange('si')}
              type="button"
            >
              <span className={styles.optionLabel}>සිංහල (Sinhala)</span>
              <span className={styles.optionSub}>ශ්‍රී ලංකා ජාතික විෂය නිර්දේශය</span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={language === 'ta'}
              onClick={() => handleLanguageChange('ta')}
              type="button"
            >
              <span className={styles.optionLabel}>தமிழ் (Tamil)</span>
              <span className={styles.optionSub}>இலங்கை தேசிய பாடத்திட்டம்</span>
            </button>
          </div>
        </section>

        {/* PDPA Privacy & Data Governance */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🛡️</span>
            <span>Privacy & PDPA Governance</span>
          </h2>
          <p className={styles.sectionDescription}>
            Under Sri Lanka Personal Data Protection Act No. 9 of 2022, you maintain full
            sovereignty over your educational learning records and telemetry.
          </p>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Educational Telemetry & Analytics</div>
              <div className={styles.toggleDescription}>
                Helps your educators understand classroom pacing without sharing personal data with
                third-party advertisers.
              </div>
            </div>
            <button
              aria-pressed={telemetryConsent}
              className={styles.toggleButton}
              data-active={telemetryConsent}
              onClick={handleConsentToggle}
              type="button"
            >
              {telemetryConsent ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>High-Contrast Mode (APCA Lc ≥ 90)</div>
              <div className={styles.toggleDescription}>
                Boosts text ink weight and border opacity for bright sunlight or low-vision
                readability.
              </div>
            </div>
            <button
              aria-pressed={highContrast}
              className={styles.toggleButton}
              data-active={highContrast}
              onClick={() => {
                const next = !highContrast;
                setHighContrast(next);
                document.documentElement.classList.toggle('apca-high-contrast', next);
              }}
              type="button"
            >
              {highContrast ? 'Active' : 'Standard'}
            </button>
          </div>
        </section>

        {/* Profile & Capacity Summary */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>👤</span>
            <span>Account & Institutional Perspective</span>
          </h2>
          <p className={styles.sectionDescription}>
            Signed in as <strong>{displayName}</strong>
            {capacity ? ` in active capacity: ${capacity}.` : '.'}
          </p>
          {capacity && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: 'var(--color-paper, #f7f2e8)',
                  border: '1px solid var(--color-line, rgba(104, 94, 85, 0.2))',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--color-ink, #131e27)',
                }}
              >
                {capacity}
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
    </SanctuaryFloorCanvas>
  );
}
