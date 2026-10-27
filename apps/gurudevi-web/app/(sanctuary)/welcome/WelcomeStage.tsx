'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { GURUDEVI_EXPLORE_URL } from '@repo/core/config/publicUrls';
import { type ExploreCapacity, setExploreCapacity } from '../../../lib/explore/exploreCapacity';
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

const EXPLORE_ROLES = [
  { id: 'teacher' as const, label: 'Teacher', emoji: '🧑‍🏫', verb: 'Teach & guide classes' },
  { id: 'principal' as const, label: 'School Leader', emoji: '🏫', verb: 'Guide the school' },
  { id: 'student' as const, label: 'Student', emoji: '🎒', verb: 'Learn & practice' },
  { id: 'guardian' as const, label: 'Family & Guardian', emoji: '👨‍👩‍👧', verb: 'Follow student growth' },
  { id: 'founder' as const, label: 'Founder', emoji: '🏛️', verb: 'Shape sanctuary' },
  { id: 'researcher' as const, label: 'Researcher', emoji: '🔬', verb: 'Observe learning data' },
] as const;

type WelcomeStageProps = Readonly<{
  mode?: WelcomeMode;
  authenticatedUser?: string | null;
}>;

export function WelcomeStage({ mode = 'sanctuary', authenticatedUser }: WelcomeStageProps) {
  const router = useRouter();
  const greeting = useMemo(() => getLocalGreeting(), []);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [exploreStep, setExploreStep] = useState<'welcome' | 'orientation' | 'role'>('welcome');
  const [selectedRole, setSelectedRole] = useState<ExploreCapacity>('teacher');

  const exploreSelfUrl =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.localhost'))
      ? '/self?surface=explore'
      : `${GURUDEVI_EXPLORE_URL}/self`;

  function handleCompleteExploreIntro() {
    setExploreCapacity(selectedRole);
    try {
      window.sessionStorage.setItem('gurudevi_museum_modal_dismissed', 'true');
    } catch {
      // Storage unavailable in private modes
    }
    const targetUrl = exploreSelfUrl + (exploreSelfUrl.includes('?') ? '&intro=complete' : '?intro=complete');
    router.push(targetUrl);
  }
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

              <div className={styles.exploreEditorialPane}>
                {exploreStep === 'welcome' ? (
                  <>
                    <div className={styles.greetingTag}>
                      <span className={styles.statusDot} />
                      <span className={styles.greetingText}>
                        Gurudevi Guest House · Open Space
                      </span>
                    </div>

                    <h1 className={styles.editorialTitle}>
                      <span className={styles.greetingLine}>Hello.</span>
                      <span className={styles.greetingLine}>I’m Tutii.</span>
                      <span className={styles.greetingLineThird}>Welcome to Gurudevi Guest House.</span>
                    </h1>

                    <p className={styles.editorialSubline}>
                      Look around, explore classes, and try features freely. No account required.
                    </p>

                    <div className={styles.editorialActionRow}>
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => setExploreStep('orientation')}
                        autoFocus
                      >
                        <span>One more thing</span>
                        <span aria-hidden="true">→</span>
                      </button>
                      <Link className={styles.editorialSanctuaryLink} href="/sign-in">
                        Sign in to Sanctuary
                      </Link>
                    </div>
                  </>
                ) : exploreStep === 'orientation' ? (
                  <>
                    <div className={styles.greetingTag}>
                      <span className={styles.statusDot} />
                      <span className={styles.greetingText}>Inside The Guest House</span>
                    </div>

                    <h1 className={styles.editorialTitle}>Wander freely.</h1>

                    <div className={styles.activePointsList}>
                      <div className={styles.activePointItem}>
                        <span className={styles.activePointIcon} aria-hidden="true">🏫</span>
                        <div>
                          <h2 className={styles.activePointTitle}>Real classroom tools</h2>
                          <p className={styles.activePointText}>
                            Try daily attendance, classroom rosters, and student reflection journals.
                          </p>
                        </div>
                      </div>
                      <div className={styles.activePointItem}>
                        <span className={styles.activePointIcon} aria-hidden="true">🛡️</span>
                        <div>
                          <h2 className={styles.activePointTitle}>Zero risk & private</h2>
                          <p className={styles.activePointText}>
                            Nothing changes a real school. Stored privately right on your device.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.editorialActionRow}>
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => setExploreStep('role')}
                        autoFocus
                      >
                        <span>Choose your perspective</span>
                        <span aria-hidden="true">→</span>
                      </button>
                      <button
                        type="button"
                        className={styles.editorialBackBtn}
                        onClick={() => setExploreStep('welcome')}
                      >
                        ← Back
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.greetingTag}>
                      <span className={styles.statusDot} />
                      <span className={styles.greetingText}>Choose Your Perspective</span>
                    </div>

                    <h1 className={styles.editorialTitle}>What brings you here?</h1>

                    <p className={styles.editorialSubline} style={{ margin: '0 0 16px 0' }}>
                      I’ll shape this sample around your role.
                    </p>

                    <div className={styles.roleChoiceGrid} role="radiogroup" aria-label="Choose your role">
                      {EXPLORE_ROLES.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          role="radio"
                          aria-checked={selectedRole === role.id}
                          className={`${styles.roleChoiceBtn} ${selectedRole === role.id ? styles.roleChoiceBtnActive : ''}`}
                          onClick={() => setSelectedRole(role.id)}
                        >
                          <span className={styles.roleChoiceIcon} aria-hidden="true">{role.emoji}</span>
                          <div className={styles.roleChoiceInfo}>
                            <span className={styles.roleChoiceLabel}>{role.label}</span>
                            <span className={styles.roleChoiceVerb}>{role.verb}</span>
                          </div>
                          {selectedRole === role.id ? (
                            <span className={styles.roleChoiceCheck} aria-hidden="true">✓</span>
                          ) : null}
                        </button>
                      ))}
                    </div>

                    <div className={styles.editorialActionRow}>
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={handleCompleteExploreIntro}
                        autoFocus
                      >
                        <span>Enter Guest House</span>
                        <span aria-hidden="true">→</span>
                      </button>
                      <button
                        type="button"
                        className={styles.editorialBackBtn}
                        onClick={() => setExploreStep('orientation')}
                      >
                        ← Back
                      </button>
                    </div>
                  </>
                )}
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
