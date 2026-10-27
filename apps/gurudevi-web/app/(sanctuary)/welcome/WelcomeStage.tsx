'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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
  const [conversationStep, setConversationStep] = useState<number>(mode === 'explore' ? 1 : 4);

  useEffect(() => {
    if (mode !== 'explore') return;
    const t1 = setTimeout(() => setConversationStep((s) => Math.max(s, 2)), 800);
    const t2 = setTimeout(() => setConversationStep((s) => Math.max(s, 3)), 1700);
    const t3 = setTimeout(() => setConversationStep((s) => Math.max(s, 4)), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [mode]);

  const exploreSelfUrl =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.localhost'))
      ? '/self?surface=explore'
      : `${GURUDEVI_EXPLORE_URL}/self`;

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
          {mode === 'explore' ? (
            <>
              <div
                className={styles.heroTextPane}
                onClick={() => setConversationStep(4)}
                role="region"
                aria-label="Tutii Live Conversation"
              >
                <div className={styles.greetingTag}>
                  <span className={styles.statusDot} />
                  <span className={styles.greetingText}>
                    Gurudevi Guest House · Open Exploration
                  </span>
                </div>

                <div className={styles.exploreConversationStream}>
                  <div className={styles.exploreDialogueBubble}>
                    <div className={styles.exploreSpeakerTag}>
                      <span>🪷 Tutii</span>
                    </div>
                    <p>Welcome to the Gurudevi Guest House!</p>
                  </div>

                  {conversationStep >= 2 ? (
                    <div className={styles.exploreDialogueBubble}>
                      <div className={styles.exploreSpeakerTag}>
                        <span>✨ Guide</span>
                      </div>
                      <p>I’m Tutii, your guide through this open space.</p>
                    </div>
                  ) : null}

                  {conversationStep >= 3 ? (
                    <div className={styles.exploreDialogueBubble}>
                      <p>
                        You can explore school life, wander through the classrooms, and try everything freely without an account.
                      </p>
                    </div>
                  ) : null}
                </div>

                {conversationStep >= 4 ? (
                  <div className={styles.exploreActionButtonGroup}>
                    <Link className={styles.primaryBtn} href="/self">
                      <span>Let’s explore!</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                    <Link className={styles.secondaryBtn} href="/sign-in">
                      <span>Sign in to Sanctuary</span>
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className={styles.heroVisualPane}>
                <div className={styles.exploreFloatingMascotFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
                    alt="Tutii the firefly guide floating warmly with a lantern."
                    className={styles.exploreFloatingMascotImg}
                    loading="eager"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
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
                      <Link className={styles.secondaryBtn} href={exploreSelfUrl}>
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
            </>
          )}
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
