import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import { Link } from '@tanstack/react-router';
import { useNavigator } from '../../../lib/navigation/useNavigator';
import { useState } from 'react';
import { LivingGround } from '@repo/ui/components/web';
import { type ExploreCapacity, setExploreCapacity } from '../../../lib/explore/exploreCapacity';
import { GatewayFooter } from '../components/GatewayFooter';
import { GatewayHeader } from '../components/GatewayHeader';
import { RoleCardGrid, CANONICAL_ROLE_OPTIONS } from '../components/RoleCardGrid';
import styles from './welcome.module.css';

export type WelcomeMode = 'explore' | 'sanctuary';

type WelcomeStageProps = Readonly<{
  mode?: WelcomeMode;
  authenticatedUser?: string | null;
  returnTo?: string;
}>;

export function WelcomeStage(props?: WelcomeStageProps) {
  const navigator = useNavigator();
  const mode = props?.mode ?? 'explore';
  const returnTo = props?.returnTo;
  const signInSearch = returnTo ? { returnTo } : {};
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
    navigator.follow(targetUrl, 'welcome', 'replace');
  }
  return (
    <LivingGround atmosphere="canopy" dither className={styles.viewport}>
      <div className={styles.ambientOrb1} aria-hidden="true" />
      <div className={styles.ambientOrb2} aria-hidden="true" />

      <GatewayHeader />

      <main className={styles.stageContainer} id="main-content">
        <div className={styles.stageContent}>
          <div className={styles.heroVisualPane}>
            <div className={styles.exploreFloatingMascotFrame}>
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
                  <Link to="/sign-in" search={signInSearch} className={styles.primaryBtn} autoFocus>
                    <span>Sign in to Sanctuary</span>
                    <span aria-hidden="true">→</span>
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
                      <a
                        href="/workspace?mode=sanctuary&dev=true&role=teacher"
                        className={styles.editorialBackBtn}
                      >
                        🧑‍🏫 Teacher
                      </a>
                      <a
                        href="/workspace?mode=sanctuary&dev=true&role=student"
                        className={styles.editorialBackBtn}
                      >
                        🎒 Student
                      </a>
                      <a
                        href="/workspace?mode=sanctuary&dev=true&role=principal"
                        className={styles.editorialBackBtn}
                      >
                        🏫 Principal
                      </a>
                      <a
                        href="/workspace?mode=sanctuary&dev=true&role=guardian"
                        className={styles.editorialBackBtn}
                      >
                        👨‍👩‍👧 Guardian
                      </a>
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
                  <Link className={styles.editorialSanctuaryLink} to="/sign-in" search={signInSearch}>
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

                <RoleCardGrid<ExploreCapacity>
                  selectedRoleId={selectedRole}
                  onSelectRole={(role) => setSelectedRole(role)}
                  ariaLabel="Choose your role"
                />

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
    </LivingGround>
  );
}
