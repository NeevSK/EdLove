'use client';

import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type ExploreCapacity, setExploreCapacity } from '../../../lib/explore/exploreCapacity';
import { DiurnalThemeToggle } from '../components/DiurnalThemeToggle';
import { GatewayFooter } from '../components/GatewayFooter';
import { LanguageToggle } from '../components/LanguageToggle';
import styles from './welcome.module.css';

export type WelcomeMode = 'explore' | 'sanctuary';

const EXPLORE_ROLES = [
  { id: 'teacher' as const, label: 'Teacher', emoji: '🧑‍🏫', verb: 'Teach & guide classes' },
  { id: 'principal' as const, label: 'School Leader', emoji: '🏫', verb: 'Guide the school' },
  { id: 'student' as const, label: 'Student', emoji: '🎒', verb: 'Learn & practice' },
  {
    id: 'guardian' as const,
    label: 'Family & Guardian',
    emoji: '👨‍👩‍👧',
    verb: 'Follow student growth',
  },
  { id: 'founder' as const, label: 'Founder', emoji: '🏛️', verb: 'Shape sanctuary' },
  { id: 'researcher' as const, label: 'Researcher', emoji: '🔬', verb: 'Observe learning data' },
] as const;

type WelcomeStageProps = Readonly<{
  mode?: WelcomeMode;
  authenticatedUser?: string | null;
  returnTo?: string;
}>;

export function WelcomeStage(props?: WelcomeStageProps) {
  const router = useRouter();
  const mode = props?.mode ?? 'explore';
  const returnTo = props?.returnTo;
  const signInHref = returnTo ? `/sign-in?returnTo=${encodeURIComponent(returnTo)}` : '/sign-in';
  const isSanctuaryMode = mode === 'sanctuary';
  const [exploreStep, setExploreStep] = useState<'welcome' | 'orientation' | 'role'>('welcome');
  const [selectedRole, setSelectedRole] = useState<ExploreCapacity>('teacher');

  const exploreSelfUrl = resolveSurfaceUrl('explore', '/self');

  function handleCompleteExploreIntro() {
    setExploreCapacity(selectedRole);
    try {
      window.sessionStorage.setItem('gurudevi_museum_modal_dismissed', 'true');
      window.localStorage.setItem('gurudevi_museum_modal_dismissed', 'true');
    } catch {
      // Storage unavailable in private modes
    }
    const targetUrl =
      exploreSelfUrl + (exploreSelfUrl.includes('?') ? '&intro=complete' : '?intro=complete');
    router.replace(targetUrl);
  }
  return (
    <div className={styles.viewport}>
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
          <LanguageToggle />
          <DiurnalThemeToggle />
        </div>
      </header>

      <main className={styles.stageContainer} id="main-content">
        <div className={styles.stageContent}>
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
            {isSanctuaryMode ? (
              <>
                <h1 className={styles.editorialTitle}>
                  <span className={styles.greetingLine}>Welcome to</span>
                  <span className={styles.greetingLineThird}>Gurudevi Sanctuary.</span>
                </h1>

                <p className={styles.editorialSubline}>
                  A protected contemplative space for learning, daily practice, and mindful
                  presence.
                </p>

                <div className={styles.editorialActionRow}>
                  <Link href={signInHref} className={styles.primaryBtn} autoFocus>
                    <span>Sign in to Sanctuary</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/onboarding" className={styles.editorialSanctuaryLink}>
                    New member? Choose your role
                  </Link>
                </div>

                {process.env.NODE_ENV !== 'production' ? (
                  <div
                    style={{
                      marginTop: '24px',
                      paddingTop: '16px',
                      borderTop: '1px dashed var(--border-subtle, #e2e8f0)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted, #64748b)',
                        marginBottom: '8px',
                      }}
                    >
                      ⚡ <strong>Local Dev Quick Launch</strong> (Direct role entry):
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link
                        href="/workspace?mode=sanctuary&dev=true&role=teacher"
                        className={styles.editorialBackBtn}
                      >
                        🧑‍🏫 Teacher
                      </Link>
                      <Link
                        href="/workspace?mode=sanctuary&dev=true&role=student"
                        className={styles.editorialBackBtn}
                      >
                        🎒 Student
                      </Link>
                      <Link
                        href="/workspace?mode=sanctuary&dev=true&role=principal"
                        className={styles.editorialBackBtn}
                      >
                        🏫 Principal
                      </Link>
                      <Link
                        href="/workspace?mode=sanctuary&dev=true&role=guardian"
                        className={styles.editorialBackBtn}
                      >
                        👨‍👩‍👧 Guardian
                      </Link>
                    </div>
                  </div>
                ) : null}

                <div style={{ marginTop: '16px' }}>
                  <a
                    href={resolveSurfaceUrl('explore', '/')}
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted, #64748b)',
                      textDecoration: 'underline',
                    }}
                  >
                    Looking for the public sandbox? Visit Explore Guest House ↗
                  </a>
                </div>
              </>
            ) : exploreStep === 'welcome' ? (
              <>
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
                  <Link className={styles.editorialSanctuaryLink} href={signInHref}>
                    Sign in to Sanctuary
                  </Link>
                </div>
              </>
            ) : exploreStep === 'orientation' ? (
              <>
                <h1 className={styles.editorialTitle}>Wander freely.</h1>

                <div className={styles.activePointsList}>
                  <div className={styles.activePointItem}>
                    <span className={styles.activePointIcon} aria-hidden="true">
                      🏫
                    </span>
                    <div>
                      <h2 className={styles.activePointTitle}>Real classroom tools</h2>
                      <p className={styles.activePointText}>
                        Try daily attendance, classroom rosters, and student reflection journals.
                      </p>
                    </div>
                  </div>
                  <div className={styles.activePointItem}>
                    <span className={styles.activePointIcon} aria-hidden="true">
                      🛡️
                    </span>
                    <div>
                      <h2 className={styles.activePointTitle}>Zero risk &amp; private</h2>
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
                <h1 className={styles.editorialTitle}>What brings you here?</h1>

                <p className={styles.editorialSubline} style={{ margin: '0 0 16px 0' }}>
                  I’ll shape this sample around your role.
                </p>

                <div
                  className={styles.roleChoiceGrid}
                  role="radiogroup"
                  aria-label="Choose your role"
                >
                  {EXPLORE_ROLES.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedRole === role.id}
                      className={`${styles.roleChoiceBtn} ${selectedRole === role.id ? styles.roleChoiceBtnActive : ''}`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <span className={styles.roleChoiceIcon} aria-hidden="true">
                        {role.emoji}
                      </span>
                      <div className={styles.roleChoiceInfo}>
                        <span className={styles.roleChoiceLabel}>{role.label}</span>
                        <span className={styles.roleChoiceVerb}>{role.verb}</span>
                      </div>
                      {selectedRole === role.id ? (
                        <span className={styles.roleChoiceCheck} aria-hidden="true">
                          ✓
                        </span>
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
        </div>
      </main>

      <GatewayFooter />
    </div>
  );
}
