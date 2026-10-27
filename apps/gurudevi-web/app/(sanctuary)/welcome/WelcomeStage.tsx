'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { GURUDEVI_EXPLORE_URL } from '@repo/core/config/publicUrls';
import styles from './welcome.module.css';
import { DiurnalThemeToggle } from '../components/DiurnalThemeToggle';

export type WelcomeMode = 'explore' | 'sanctuary';

function getLocalGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'si', label: 'සිං' },
  { code: 'ta', label: 'தமிழ்' },
] as const;

type WelcomeStageProps = Readonly<{
  mode?: WelcomeMode;
  authenticatedUser?: string | null;
}>;

export function WelcomeStage({ mode = 'sanctuary', authenticatedUser }: WelcomeStageProps) {
  const greeting = useMemo(() => getLocalGreeting(), []);
  const [selectedLang, setSelectedLang] = useState<string>('en');

  return (
    <div className={styles.viewport}>
      <div className={styles.datumMatrix} aria-hidden="true" />
      <div className={styles.ambientOrb1} aria-hidden="true" />
      <div className={styles.ambientOrb2} aria-hidden="true" />

      <header className={styles.gatewayHeader}>
        <Link className={styles.brandLink} href="/welcome">
          <div className={styles.brandMark} aria-hidden="true">
            🪷
          </div>
          <div>
            <span className={styles.brandText}>Gurudevi</span>
          </div>
        </Link>
        <div className={styles.headerActions}>
          <DiurnalThemeToggle />
          <div className={styles.langSelector} role="group" aria-label="Select language">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className={`${styles.langPill} ${selectedLang === lang.code ? styles.langPillActive : ''}`}
                aria-pressed={selectedLang === lang.code}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className={styles.stageContainer} id="main-content">
        <div className={styles.stageContent}>
          <div className={styles.heroTextPane}>
            <div className={styles.greetingTag}>
              <span className={styles.statusDot} />
              <span className={styles.greetingText}>
                {greeting} · welcome to Gurudevi
              </span>
            </div>

            <h1 className={styles.heroTitle}>A calmer place for school life</h1>

            <p className={styles.heroLede}>
              A calm space to teach, learn, reflect, and grow at your own pace.
            </p>

            <div className={styles.actionButtonGroup}>
              {authenticatedUser ? (
                <>
                  <Link className={styles.primaryBtn} href="/self">
                    <span>Continue as {authenticatedUser}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link className={styles.secondaryBtn} href="/auth/signout">
                    <span>Sign out</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link className={styles.primaryBtn} href="/sign-in">
                    <span>Sign in / Sign up</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    className={styles.secondaryBtn}
                    href={mode === 'explore' ? '/self' : `${GURUDEVI_EXPLORE_URL}/self`}
                  >
                    <span>Explore without account</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className={styles.heroVisualPane}>
            <div className={styles.artworkFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/artwork/welcome-garden-tutii-concept.png"
                alt="Tutii welcomes the viewer from a lotus leaf beside a garden path."
                className={styles.artworkImg}
                loading="eager"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.minimalFooter}>
        <div className={styles.legalLinks}>
          <Link href="/privacy">Privacy Policy</Link>
          <span className={styles.metaDivider}>•</span>
          <Link href="/terms">Terms of Use</Link>
          <span className={styles.metaDivider}>•</span>
          <Link href="/guidelines">Community Guidelines</Link>
        </div>
        <div className={styles.colophonText}>
          Part of the EdLove Constellation · Made with 💖 in Sri Lanka
        </div>
      </footer>
    </div>
  );
}
