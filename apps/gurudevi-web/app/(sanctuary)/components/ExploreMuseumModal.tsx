'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  EXPLORE_CAPACITIES,
  type ExploreCapacity,
  getExploreCapacity,
  hasSavedExploreCapacity,
  setExploreCapacity,
} from '../../../lib/explore/exploreCapacity';
import styles from './explore-museum-modal.module.css';
import { TutiiGreeting } from './TutiiGreeting';

interface ExploreMuseumModalProps {
  isExploreHost?: boolean;
}

type IntroStep = 'welcome' | 'orientation' | 'role';

export function ExploreMuseumModal({
  isExploreHost = false,
}: ExploreMuseumModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExploreMode, setIsExploreMode] = useState(isExploreHost);
  const [step, setStep] = useState<IntroStep>('welcome');
  const [selectedRole, setSelectedRole] = useState<ExploreCapacity>('teacher');
  const [roleSelectedForSession, setRoleSelectedForSession] = useState(false);

  useEffect(() => {
    const exploreMode =
      window.location.search.includes('mode=explore') ||
      window.location.hostname.includes('explore') ||
      isExploreHost;

    if (!exploreMode) return;
    setIsExploreMode(true);
    setSelectedRole(getExploreCapacity());
    if (
      pathname === '/welcome' ||
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/reset-password')
    ) {
      setIsOpen(false);
      return;
    }

    try {
      const hasRole = hasSavedExploreCapacity();
      if (hasRole) setRoleSelectedForSession(true);
      if (!hasRole && roleSelectedForSession) {
        setIsOpen(false);
        return;
      }
      if (!hasRole && !roleSelectedForSession) {
        setIsOpen(true);
        return;
      }
      if (new URLSearchParams(window.location.search).get('intro') === 'complete') {
        window.sessionStorage.setItem('gurudevi_museum_modal_dismissed', 'true');
        setIsOpen(false);
        return;
      }
      if (window.sessionStorage.getItem('gurudevi_museum_modal_dismissed')) {
        setIsOpen(false);
        return;
      }
      if (pathname !== '/self') {
        setIsOpen(false);
        return;
      }
    } catch {
      // Storage can be unavailable in restricted browser contexts; the intro remains usable.
    }

    setIsOpen(true);
  }, [isExploreHost, pathname, roleSelectedForSession]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function handleDismiss() {
    try {
      window.sessionStorage.setItem('gurudevi_museum_modal_dismissed', 'true');
    } catch {
      // Dismissing the introduction should work even when session storage is blocked.
    }
    setIsOpen(false);
  }

  if (!isExploreMode) return null;

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          className={styles.reopenLink}
          onClick={() => {
            setStep('welcome');
            setIsOpen(true);
          }}
          aria-label="About Explore and Tutii’s introduction"
        >
          About Explore <span aria-hidden="true">↗</span>
        </button>
      ) : (
        <div className={styles.backdrop}>
          <section
            className={styles.intro}
            role="dialog"
            aria-modal="true"
            aria-labelledby={
              step === 'welcome'
                ? 'tutii-greeting-title'
                : step === 'orientation'
                  ? 'museum-modal-title'
                  : 'explore-role-title'
            }
            onKeyDown={(event) => {
              if (event.key === 'Escape') handleDismiss();
            }}
          >
            <header className={styles.header}>
              <Link className={styles.brand} href="/welcome" aria-label="Gurudevi Explore">
                <span aria-hidden="true">🪷</span> Gurudevi
              </Link>
              <div className={styles.headerEnd}>
                <span className={styles.stepLabel} aria-live="polite">
                  {step === 'welcome'
                    ? 'A quick hello · 1 of 3'
                    : step === 'orientation'
                      ? 'Before you wander · 2 of 3'
                      : 'Make it yours · 3 of 3'}
                </span>
                {step !== 'role' ? (
                  <button className={styles.skip} type="button" onClick={() => setStep('role')}>
                    Skip to role choice
                  </button>
                ) : null}
              </div>
            </header>

            <div className={styles.content} key={step}>
              {step === 'welcome' ? (
                <TutiiGreeting
                  actionLabel="One more thing"
                  autoFocus
                  context="explore"
                  onContinue={() => setStep('orientation')}
                />
              ) : step === 'orientation' ? (
                <div className={styles.orientation}>
                  <div className={styles.orientationPortrait}>
                    <Image
                      src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
                      alt="Tutii stays with you as you look around Explore."
                      width={280}
                      height={280}
                      priority
                    />
                  </div>
                  <div className={styles.copy}>
                    <p className={styles.eyebrow}>Your sample Guest House</p>
                    <h1 className={styles.title} id="museum-modal-title">You’re in Explore.</h1>
                    <p className={styles.description}>
                      Wander through sample spaces and see how Gurudevi supports school and community
                      life. Nothing you do here changes a real school or personal account.
                    </p>
                    <div className={styles.actions}>
                      <button className={styles.primaryAction} type="button" onClick={() => setStep('role')} autoFocus>
                        Choose my perspective <span aria-hidden="true">→</span>
                      </button>
                      <Link className={styles.sanctuaryLink} href="/sign-in" onClick={handleDismiss}>
                        Sign in to Sanctuary
                      </Link>
                    </div>
                    <button className={styles.back} type="button" onClick={() => setStep('welcome')}>
                      ← Back
                    </button>
                  </div>
                </div>
              ) : (
                <section className={styles.roleStep} aria-labelledby="explore-role-title">
                  <div className={styles.rolePortrait}>
                    <Image
                      src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
                      alt="Tutii is here to tailor this sample space to you."
                      width={190}
                      height={190}
                      priority
                    />
                  </div>
                  <div className={styles.copy}>
                    <p className={styles.eyebrow}>Tutii asks</p>
                    <h1 className={styles.title} id="explore-role-title">What brings you here?</h1>
                    <p className={styles.description}>
                      I’ll shape this sample around your role. You can explore other roles inside Workspace.
                    </p>
                    <div className={styles.roleChoices} role="radiogroup" aria-label="Choose your primary role">
                      {EXPLORE_CAPACITIES.map((role) => (
                        <button
                          aria-checked={selectedRole === role.id}
                          className={styles.roleChoice}
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          role="radio"
                          type="button"
                        >
                          <span aria-hidden="true" className={styles.roleEmoji}>
                            {({ teacher: '🧑‍🏫', principal: '🏫', student: '📚', guardian: '👪', founder: '🏛️', researcher: '🔬' } as Record<string, string>)[role.id] ?? '✨'}
                          </span>
                          <span>{role.label}</span>
                          {selectedRole === role.id ? <span aria-hidden="true">✓</span> : null}
                        </button>
                      ))}
                    </div>
                    <div className={styles.actions}>
                      <button
                        className={styles.primaryAction}
                        type="button"
                        onClick={() => {
                          setExploreCapacity(selectedRole);
                          setRoleSelectedForSession(true);
                          handleDismiss();
                        }}
                      >
                        Let’s look around <span aria-hidden="true">→</span>
                      </button>
                      <Link className={styles.sanctuaryLink} href="/sign-in" onClick={handleDismiss}>
                        Sign in to Sanctuary
                      </Link>
                    </div>
                    <button className={styles.back} type="button" onClick={() => setStep('orientation')}>
                      ← Back
                    </button>
                  </div>
                </section>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
