'use client';

import type { WorkspaceAppearanceMotion } from '@repo/core/types';
import type { WorldId } from '@repo/ui/theme';
import { WorldPicker } from '@repo/ui/components/web';
import Link from 'next/link';
import type { FidelityPreference } from '@repo/core/verger';
import React, { useEffect, useState } from 'react';
import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import { useWebFidelity, writeWebFidelity } from '../../../lib/runtime/webFidelity';
import {
  useWebGroundLiveliness,
  writeWebGroundLiveliness,
} from '../../../lib/runtime/webGroundLiveliness';
import { useGroundPolicy } from '../../../lib/runtime/useGroundPolicy';
import {
  type GroundLiveliness,
  isGroundLiveliness,
} from '@repo/core/logic/workspace/groundPlan';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import {
  getClientConsentStatus,
  PDPA_CONSENT_EVENT,
  setClientConsentStatus,
} from '../../../lib/privacy/consent';
import { useTranslation } from '../../../lib/i18n';
import { useWorldTheme } from '../../../lib/theme/useWorldTheme';
import styles from './settings.module.css';

interface SettingsFloorProps {
  displayName: string;
  capacity?: string;
  isExplore?: boolean;
  accountId?: string;
}

export function SettingsFloor({
  displayName,
  capacity,
  isExplore,
  accountId,
}: Readonly<SettingsFloorProps>) {
  const { t, locale, setLocale } = useTranslation();
  const { world, mode, resolvedMode, setWorld, setMode } = useWorldTheme();
  const [motion, setMotion] = useState<WorkspaceAppearanceMotion>('subtle');
  const [language, setLanguage] = useState<'en' | 'si' | 'ta'>(locale);
  const [highContrast, setHighContrast] = useState(false);
  const [telemetryConsent, setTelemetryConsent] = useState(true);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [navigationLayout, setNavigationLayout] = useState<'horizontal' | 'side'>('horizontal');
  const fidelity = useWebFidelity();
  const groundLiveliness = useWebGroundLiveliness();
  const groundPolicy = useGroundPolicy();

  // Sensory & Notification preferences (aligned with mobile AppSettingsScreen.shared)
  // Sounds start off, as on the phone; the kit's feedback reads the same key.
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [quietMode, setQuietMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [dailyReflections, setDailyReflections] = useState(true);
  const [communityAlerts, setCommunityAlerts] = useState(true);

  // Remote sync for authenticated accounts
  const syncPreferenceToCloud = async (updates: Record<string, unknown>) => {
    if (isExplore || !accountId) return;
    try {
      const { createBrowserSupabaseClient } = await import('../../../lib/supabase/browser');
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      const { data: user } = await supabase
        .from('users')
        .select('metadata')
        .eq('id', accountId)
        .maybeSingle();

      const currentMeta = (
        user?.metadata && typeof user.metadata === 'object' ? user.metadata : {}
      ) as Record<string, unknown>;
      const currentSettings = (
        currentMeta.settings && typeof currentMeta.settings === 'object'
          ? currentMeta.settings
          : {}
      ) as Record<string, unknown>;

      await supabase
        .from('users')
        .update({
          metadata: {
            ...currentMeta,
            settings: {
              ...currentSettings,
              ...updates,
            },
          },
        })
        .eq('id', accountId);
    } catch (err: unknown) {
      console.warn('[SettingsFloor] Cloud sync skipped:', err);
    }
  };

  useEffect(() => {
    try {
      setNavigationLayout(
        localStorage.getItem('gurudevi_navigation_layout_v1') === 'side' ? 'side' : 'horizontal',
      );
    } catch {
      setNavigationLayout('horizontal');
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

    // Sensory & notification local storage cache
    const savedSound = localStorage.getItem('gurudevi_sound_enabled');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    const savedQuiet = localStorage.getItem('gurudevi_quiet_mode');
    if (savedQuiet !== null) setQuietMode(savedQuiet === 'true');
    const savedPush = localStorage.getItem('gurudevi_notif_push');
    if (savedPush !== null) setPushNotifications(savedPush === 'true');
    const savedReflect = localStorage.getItem('gurudevi_notif_reflections');
    if (savedReflect !== null) setDailyReflections(savedReflect === 'true');
    const savedCommunity = localStorage.getItem('gurudevi_notif_community');
    if (savedCommunity !== null) setCommunityAlerts(savedCommunity === 'true');

    // Read PDPA consent status
    setTelemetryConsent(getClientConsentStatus() === 'granted');

    const handleConsentEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ status: string }>;
      setTelemetryConsent(customEvent.detail?.status === 'granted');
    };
    window.addEventListener(PDPA_CONSENT_EVENT, handleConsentEvent);

    // Hydrate remote preferences if authenticated
    if (!isExplore && accountId) {
      (async () => {
        try {
          const { createBrowserSupabaseClient } = await import('../../../lib/supabase/browser');
          const supabase = createBrowserSupabaseClient();
          if (!supabase) return;
          const { data: user } = await supabase
            .from('users')
            .select('metadata')
            .eq('id', accountId)
            .maybeSingle();

          const meta = user?.metadata as Record<string, unknown> | null;
          const s = meta?.settings as Record<string, unknown> | null;
          if (s) {
            if (s.world && typeof s.world === 'string') {
              setWorld(s.world as WorldId);
            }
            if (s.mode && typeof s.mode === 'string') {
              setMode(s.mode as 'light' | 'dark' | 'system');
            }
            if (s.motion && typeof s.motion === 'string') {
              setMotion(s.motion as WorkspaceAppearanceMotion);
            }
            if (s.language && typeof s.language === 'string') {
              setLanguage(s.language as 'en' | 'si' | 'ta');
            }
            if (typeof s.soundEnabled === 'boolean') {
              setSoundEnabled(s.soundEnabled);
              localStorage.setItem('gurudevi_sound_enabled', String(s.soundEnabled));
            }
            if (typeof s.quietMode === 'boolean') {
              setQuietMode(s.quietMode);
              localStorage.setItem('gurudevi_quiet_mode', String(s.quietMode));
            }
            if (isGroundLiveliness(s.groundLiveliness)) writeWebGroundLiveliness(s.groundLiveliness);
            if (typeof s.pushNotifications === 'boolean') setPushNotifications(s.pushNotifications);
            if (typeof s.dailyReflections === 'boolean') setDailyReflections(s.dailyReflections);
            if (typeof s.communityAlerts === 'boolean') setCommunityAlerts(s.communityAlerts);
          }
        } catch {
          // ignore
        }
      })();
    }

    return () => {
      window.removeEventListener(PDPA_CONSENT_EVENT, handleConsentEvent);
    };
  }, [isExplore, accountId]);

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

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    void syncPreferenceToCloud({ mode: newMode });
    triggerSavedNotice(
      'Light appearance updated to ' +
        (newMode === 'system' ? 'Device' : newMode === 'dark' ? 'Night' : 'Day'),
    );
  };

  const handleWorldChange = (newWorld: WorldId) => {
    setWorld(newWorld);
    void syncPreferenceToCloud({ world: newWorld });
    triggerSavedNotice('Cultural world updated to ' + newWorld);
  };

  const handleMotionChange = (newMotion: WorkspaceAppearanceMotion) => {
    setMotion(newMotion);
    localStorage.setItem('gurudevi_motion_preset', newMotion);
    void syncPreferenceToCloud({ motion: newMotion });
    triggerSavedNotice('Motion preference updated to ' + newMotion);
  };

  const handleGroundLivelinessChange = (next: GroundLiveliness) => {
    writeWebGroundLiveliness(next);
    void syncPreferenceToCloud({ groundLiveliness: next });
  };

  const handleFidelityChange = (next: FidelityPreference) => {
    writeWebFidelity(next);
    triggerSavedNotice(
      next === 'auto' ? 'Visual detail: automatic' : next === 'low' ? 'Visual detail: lighter' : 'Visual detail: richer',
    );
  };

  const handleLanguageChange = (newLang: 'en' | 'si' | 'ta') => {
    setLanguage(newLang);
    setLocale(newLang);
    void syncPreferenceToCloud({ language: newLang });
    triggerSavedNotice(
      t('settings.saveNotice') || 'Language preference updated',
    );
  };

  const handleConsentToggle = () => {
    const nextConsent = !telemetryConsent;
    setTelemetryConsent(nextConsent);
    setClientConsentStatus(nextConsent);
    triggerSavedNotice(
      nextConsent
        ? 'PDPA analytics & telemetry consent granted'
        : 'PDPA telemetry consent revoked (PDPA Section 11)',
    );
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('gurudevi_sound_enabled', String(next));
    void syncPreferenceToCloud({ soundEnabled: next });
    triggerSavedNotice(next ? 'Contemplative audio feedback enabled' : 'Sound feedback muted');
  };

  const handleQuietModeToggle = () => {
    const next = !quietMode;
    setQuietMode(next);
    localStorage.setItem('gurudevi_quiet_mode', String(next));
    void syncPreferenceToCloud({ quietMode: next });
    triggerSavedNotice(next ? 'Quiet meditation mode engaged (chimes suppressed)' : 'Quiet mode disengaged');
  };

  const handleNotifToggle = (key: 'push' | 'reflections' | 'community') => {
    if (key === 'push') {
      const next = !pushNotifications;
      setPushNotifications(next);
      localStorage.setItem('gurudevi_notif_push', String(next));
      void syncPreferenceToCloud({ pushNotifications: next });
      triggerSavedNotice(next ? 'Institutional announcements enabled' : 'Push notifications disabled');
    } else if (key === 'reflections') {
      const next = !dailyReflections;
      setDailyReflections(next);
      localStorage.setItem('gurudevi_notif_reflections', String(next));
      void syncPreferenceToCloud({ dailyReflections: next });
      triggerSavedNotice(next ? 'Daily contemplative reminders active' : 'Daily reminders paused');
    } else if (key === 'community') {
      const next = !communityAlerts;
      setCommunityAlerts(next);
      localStorage.setItem('gurudevi_notif_community', String(next));
      void syncPreferenceToCloud({ communityAlerts: next });
      triggerSavedNotice(next ? 'Study circle alerts active' : 'Circle alerts paused');
    }
  };

  const triggerSavedNotice = (msg: string) => {
    setSavedNotification(msg);
    setTimeout(() => {
      setSavedNotification(null);
    }, 2800);
  };

  return (
    <SanctuaryFloorCanvas domain="settings" titleId="settings-title" breadcrumb="Settings · Preferences">
      <div className={styles.container}>
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
              href={resolveSurfaceUrl('sanctuary', '/sign-in')}
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
        {/* Light & Diurnal Mode */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>☀️</span>
            <span>Light & Diurnal Mode</span>
          </h2>
          <p className={styles.sectionDescription}>
            Choose whether Gurudevi follows your device daylight or stays in Day or Night luminance.
          </p>

          <div className={styles.optionsGrid}>
            <button
              className={styles.optionCard}
              data-selected={mode === 'light'}
              onClick={() => handleModeChange('light')}
              type="button"
            >
              <span className={styles.optionLabel}>Day (Light)</span>
              <span className={styles.optionSub}>
                Crisp high-readability daylight surfaces
              </span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={mode === 'dark'}
              onClick={() => handleModeChange('dark')}
              type="button"
            >
              <span className={styles.optionLabel}>Night (Dark)</span>
              <span className={styles.optionSub}>
                Deep contemplative dark surface with halation protection
              </span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={mode === 'system'}
              onClick={() => handleModeChange('system')}
              type="button"
            >
              <span className={styles.optionLabel}>Follow Device</span>
              <span className={styles.optionSub}>
                Automatically synchronizes with your device operating system theme
              </span>
            </button>
          </div>
        </section>

        {/* Cultural World Section */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🎨</span>
            <span>Cultural World</span>
          </h2>
          <p className={styles.sectionDescription}>
            Dress the entire application in the aesthetic, typography, corners, and spirit of your chosen Sri Lankan world.
          </p>

          <WorldPicker
            value={world}
            onChange={handleWorldChange}
            mode={resolvedMode}
            label="Cultural World"
          />
        </section>

        {/* Motion & Vestibular Safety */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🌊</span>
            <span>{t('settings.sensoryTitle')}</span>
          </h2>
          <p className={styles.sectionDescription}>
            {t('settings.sensoryDesc')}
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

        {/* Visual detail (verger's fidelity, R12) */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🔋</span>
            <span>Visual Detail</span>
          </h2>
          <p className={styles.sectionDescription}>
            How much visual richness this browser spends. Automatic adapts to the device and how
            it is coping right now.
          </p>

          <div className={styles.optionsGrid}>
            <button
              className={styles.optionCard}
              data-selected={fidelity === 'auto'}
              onClick={() => handleFidelityChange('auto')}
              type="button"
            >
              <span className={styles.optionLabel}>Automatic</span>
              <span className={styles.optionSub}>Adapts to this device and its load</span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={fidelity === 'low'}
              onClick={() => handleFidelityChange('low')}
              type="button"
            >
              <span className={styles.optionLabel}>Lighter</span>
              <span className={styles.optionSub}>
                Still backgrounds and simpler effects: easier on battery and older devices
              </span>
            </button>
            <button
              className={styles.optionCard}
              data-selected={fidelity === 'high'}
              onClick={() => handleFidelityChange('high')}
              type="button"
            >
              <span className={styles.optionLabel}>Richer</span>
              <span className={styles.optionSub}>
                Full detail even on modest devices; still eased off if the device struggles
              </span>
            </button>
          </div>
        </section>

        {/* World behind screens: the ground policy's one person-owned input (Comfort.ground on the phone) */}
        <section className={styles.settingSection} data-testid="ground-liveliness-setting">
          <h2 className={styles.sectionTitle}>
            <span>🌄</span>
            <span>World Behind Screens</span>
          </h2>
          <p className={styles.sectionDescription}>
            How much of your world shows behind every screen. Words always stay readable, and a
            device that is saving power may calm it further.
          </p>

          <div className={styles.optionsGrid} role="radiogroup" aria-label="World behind screens">
            {(
              [
                ['lively', 'Lively', 'The full world behind every screen, reading ones too'],
                ['balanced', 'Balanced', 'Full in rooms and screens, calmer where you read or work'],
                ['calm', 'Calm', 'A still, fainter world everywhere, rooms included'],
              ] as const
            ).map(([id, label, sub]) => (
              <button
                aria-checked={groundLiveliness === id}
                className={styles.optionCard}
                data-selected={groundLiveliness === id}
                key={id}
                onClick={() => handleGroundLivelinessChange(id)}
                role="radio"
                type="button"
              >
                <span className={styles.optionLabel}>{label}</span>
                <span className={styles.optionSub}>{sub}</span>
              </button>
            ))}
          </div>
          {groundPolicy.reason === 'device-essential' ? (
            <p className={styles.sectionDescription} role="status">
              This device is saving power right now, so screens show the calmer world for the
              moment.
            </p>
          ) : null}
        </section>

        {/* Language & Regional Scripts */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🗣️</span>
            <span>{t('settings.languageTitle')}</span>
          </h2>
          <p className={styles.sectionDescription}>
            {t('settings.languageDesc')}
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
            <span>{t('settings.privacyTitle')}</span>
          </h2>
          <p className={styles.sectionDescription}>
            {t('settings.privacyDesc')}
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

        {/* Sensory Acoustics & Quiet Mode */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🔔</span>
            <span>{t('settings.soundTitle')}</span>
          </h2>
          <p className={styles.sectionDescription}>
            {t('settings.soundDesc')}
          </p>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Contemplative Audio Feedback</div>
              <div className={styles.toggleDescription}>
                Plays resonant bell and water chimes on completing exercises and stage navigation.
              </div>
            </div>
            <button
              aria-pressed={soundEnabled}
              className={styles.toggleButton}
              data-active={soundEnabled}
              onClick={handleSoundToggle}
              type="button"
            >
              {soundEnabled ? t('settings.enabled') : t('settings.muted')}
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>{t('settings.quietModeLabel')}</div>
              <div className={styles.toggleDescription}>
                {t('settings.quietModeDesc')}
              </div>
            </div>
            <button
              aria-pressed={quietMode}
              className={styles.toggleButton}
              data-active={quietMode}
              onClick={handleQuietModeToggle}
              type="button"
            >
              {quietMode ? t('settings.active') : t('settings.off')}
            </button>
          </div>
        </section>

        {/* Notification Preferences & Rhythms */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>📬</span>
            <span>{t('settings.notifTitle')}</span>
          </h2>
          <p className={styles.sectionDescription}>
            {t('settings.notifDesc')}
          </p>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Institutional & School Announcements</div>
              <div className={styles.toggleDescription}>
                Critical alerts from your primary educational institution and emergency notices.
              </div>
            </div>
            <button
              aria-pressed={pushNotifications}
              className={styles.toggleButton}
              data-active={pushNotifications}
              onClick={() => handleNotifToggle('push')}
              type="button"
            >
              {pushNotifications ? t('settings.enabled') : t('settings.paused')}
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Daily Contemplative Reflections</div>
              <div className={styles.toggleDescription}>
                A gentle morning or twilight prompt for mindful pedagogical practice.
              </div>
            </div>
            <button
              aria-pressed={dailyReflections}
              className={styles.toggleButton}
              data-active={dailyReflections}
              onClick={() => handleNotifToggle('reflections')}
              type="button"
            >
              {dailyReflections ? t('settings.enabled') : t('settings.paused')}
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Study Circle & Community Pings</div>
              <div className={styles.toggleDescription}>
                Updates when peers share reflections, gratitude tokens, or circle notes.
              </div>
            </div>
            <button
              aria-pressed={communityAlerts}
              className={styles.toggleButton}
              data-active={communityAlerts}
              onClick={() => handleNotifToggle('community')}
              type="button"
            >
              {communityAlerts ? t('settings.enabled') : t('settings.paused')}
            </button>
          </div>
        </section>

        {/* Device Trust & Security Floor */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🛡️</span>
            <span>{t('settings.securityTitle')}</span>
          </h2>
          <p className={styles.sectionDescription}>
            {t('settings.securityDesc')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft, #453c35)' }}>
              Hardware cryptographic sessions protected by Supabase & WebAuthn
            </span>
          </div>
        </section>

        {/* Privacy & Data Sovereignty (PDPA) */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>🛡️</span>
            <span>Privacy & Data Sovereignty (PDPA)</span>
          </h2>
          <p className={styles.sectionDescription}>
            In compliance with Sri Lanka’s Personal Data Protection Act (PDPA No. 9 of 2022),
            essential operations remain active, while optional telemetry can be granted or revoked at any time.
          </p>

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Application Health & Telemetry</div>
              <div className={styles.toggleDescription}>
                Measures application responsiveness and learning pathway mastery. Zero third-party ad tracking.
              </div>
            </div>
            <button
              aria-pressed={telemetryConsent}
              className={styles.toggleButton}
              data-active={telemetryConsent}
              onClick={handleConsentToggle}
              type="button"
            >
              {telemetryConsent ? 'Granted' : 'Revoked'}
            </button>
          </div>
        </section>

        {/* Diagnostics & Institutional Integrity */}
        <section className={styles.settingSection}>
          <h2 className={styles.sectionTitle}>
            <span>⚙️</span>
            <span>Diagnostics & Support</span>
          </h2>
          <p className={styles.sectionDescription}>
            System runtime information and official support contacts for institutional administrators.
          </p>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft, #453c35)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div>
              <strong>Runtime Engine:</strong> Gurudevi Web v2.4.0 (Next.js 16 App Router · Turbopack)
            </div>
            <div>
              <strong>Data Sovereignty:</strong> Sri Lanka PDPA No. 9 of 2022 Certified Architecture
            </div>
            <div>
              <strong>Direct Support:</strong>{' '}
              <a
                href="mailto:support@gurudevi.lk?subject=Gurudevi%20Sanctuary%20Support"
                style={{ color: 'var(--color-action, #a85022)', textDecoration: 'underline', fontWeight: 600 }}
              >
                support@gurudevi.lk
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
    </SanctuaryFloorCanvas>
  );
}
