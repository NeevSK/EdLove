'use client';

import Link from 'next/link';
import Image from 'next/image';
import { completeOnboarding, createInitialBond } from '@repo/core/api/onboardingClient';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { browserAuthRuntime } from '../auth/browserAuth';
import { TutiiGreeting } from '../components/TutiiGreeting';
import styles from './onboarding.module.css';

const capacities = [
  { value: 'teacher', label: 'Teacher', symbol: '🍎', detail: 'I teach, guide, or care for a classroom.' },
  { value: 'student', label: 'Student', symbol: '📚', detail: 'I’m here to learn, explore, and grow.' },
  { value: 'principal', label: 'School leader', symbol: '🏫', detail: 'I help a school community work well together.' },
  { value: 'parent', label: 'Parent', symbol: '🌱', detail: 'I support a learner and stay connected with school.' },
  { value: 'guardian', label: 'Guardian', symbol: '🤝', detail: 'I care for and encourage a learner.' },
  { value: 'librarian', label: 'Librarian', symbol: '📖', detail: 'I help people find books, media, and ideas.' },
] as const;

type FormState = 'ready' | 'submitting' | 'unavailable' | 'error';
type JourneyStep = 'hello' | 'name' | 'capacity';
type IdentityStatus = 'checking' | 'authenticated' | 'signed-out' | 'unavailable';
const onboardingDraftKey = 'gurudevi_onboarding_draft_v1';

function readOnboardingDraft(): { displayName: string; capacity: string } | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(onboardingDraftKey) ?? 'null');
    if (typeof value !== 'object' || value === null) return null;
    const displayName = Reflect.get(value, 'displayName');
    const capacity = Reflect.get(value, 'capacity');
    if (
      typeof displayName !== 'string' ||
      !capacities.some((item) => item.value === capacity)
    ) return null;
    return { displayName, capacity };
  } catch {
    return null;
  }
}

function unavailableMessage(status: number | null): string {
  if (status === 401)
    return 'Your secure session has expired. Sign in again, then continue enrollment.';
  if (status === 403)
    return 'This capacity is not available for this account. Choose another capacity or contact support.';
  return 'We could not establish your sanctuary right now. Nothing was completed; please retry.';
}

function errorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null;
  const status = Reflect.get(error, 'status');
  return typeof status === 'number' ? status : null;
}

export function OnboardingForm() {
  const [step, setStep] = useState<JourneyStep>('hello');
  const [state, setState] = useState<FormState>('ready');
  const [message, setMessage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('teacher');
  const [identityStatus, setIdentityStatus] = useState<IdentityStatus>('checking');
  const capacityHeading = useRef<HTMLHeadingElement>(null);
  const firstName = displayName.trim().split(/\s+/)[0];

  useEffect(() => {
    let isCurrent = true;
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setIdentityStatus('unavailable');
      return () => { isCurrent = false; };
    }

    void runtime.bootstrapIdentity().then((identity) => {
      if (!isCurrent) return;
      setIdentityStatus(
        identity.status === 'authenticated' && identity.session.user.is_anonymous
          ? 'signed-out'
          : identity.status,
      );
      const draft = readOnboardingDraft();
      if (draft) {
        setDisplayName(draft.displayName);
        setSelectedCapacity(draft.capacity);
        setStep('capacity');
      }
    });

    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (step !== 'capacity') return;
    capacityHeading.current?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [step]);

  function continueToCapacity() {
    if (!displayName.trim()) return;
    setMessage('');
    setStep('capacity');
  }

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 'hello') {
      setStep('name');
      return;
    }
    if (step === 'name') {
      continueToCapacity();
      return;
    }

    const runtime = browserAuthRuntime();
    if (!runtime) {
      setState('unavailable');
      setMessage('Enrollment is not configured in this environment.');
      return;
    }

    const identity = await runtime.bootstrapIdentity();
    const requiresAccount =
      identity.status === 'signed-out' ||
      (identity.status === 'authenticated' && identity.session.user.is_anonymous);
    setIdentityStatus(requiresAccount ? 'signed-out' : identity.status);
    if (requiresAccount) {
      try {
        sessionStorage.setItem(onboardingDraftKey, JSON.stringify({
          displayName: displayName.trim(),
          capacity: selectedCapacity,
        }));
      } catch {
        setMessage('Your details could not be saved in this browser. You can still create an account and enter them again.');
      }
      window.location.assign('/sign-up?returnTo=%2Fonboarding');
      return;
    }
    if (identity.status === 'unavailable') {
      setState('unavailable');
      setMessage('We could not check your account just now. Please try again in a moment.');
      return;
    }
    if (identity.status !== 'authenticated') {
      setState('error');
      setMessage('Please sign in before entering your Sanctuary.');
      return;
    }

    const orientation = selectedCapacity;
    if (!displayName.trim() || !capacities.some((item) => item.value === orientation)) {
      setState('error');
      setMessage('Add your name and choose the role that fits you best.');
      return;
    }

    setState('submitting');
    setMessage('');
    try {
      await createInitialBond({
        orientation,
        confirmCapacityChange: false,
        context: { displayName: displayName.trim() },
      });
      await completeOnboarding();
      try {
        sessionStorage.removeItem(onboardingDraftKey);
      } catch {
        // Enrollment can finish even when session storage is unavailable.
      }
      window.location.replace('/self');
    } catch (error) {
      setState('error');
      setMessage(unavailableMessage(errorStatus(error)));
    }
  }

  return (
    <form className={styles.conversation} onSubmit={(event) => void complete(event)}>
      <div
        className={styles.progress}
        role="group"
        aria-label={`Step ${step === 'hello' ? 1 : step === 'name' ? 2 : 3} of 3`}
      >
        {(['hello', 'name', 'capacity'] as const).map((item, index) => (
          <span
            aria-hidden="true"
            className={styles.progressSegment}
            data-active={
              step === item ||
              (step === 'capacity' && index < 2) ||
              (step === 'name' && index < 1)
            }
            key={item}
          />
        ))}
        <span className={styles.progressLabel}>A few gentle steps</span>
      </div>

      {step === 'hello' ? (
        <div className={styles.step}>
          <TutiiGreeting
            actionLabel="Let’s begin"
            context="sanctuary"
            onContinue={() => setStep('name')}
          />
        </div>
      ) : null}

      {step === 'name' ? (
        <section className={styles.step} aria-labelledby="onboarding-name-title">
          <div className={styles.conversationRow}>
            <Image
              className={styles.tutiiImage}
              src="/mascot/firefly-guide-onboarding-light-cutout-v2.webp"
              alt="Tutii listens as you introduce yourself."
              width={260}
              height={260}
              priority
            />
            <div className={styles.voice}>
              <p className={styles.eyebrow}>A little introduction</p>
              <h2 className={styles.title} id="onboarding-name-title">
                What’s your lovely name?
              </h2>
              <p className={styles.prompt}>The name you’d like people here to call you.</p>
              <label className={styles.fieldLabel} htmlFor="onboarding-name">
                Your name
              </label>
              <input
                autoComplete="name"
                autoFocus
                className={styles.nameInput}
                id="onboarding-name"
                maxLength={120}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
                placeholder="e.g. Ananda Silva"
                required
                value={displayName}
              />
            </div>
          </div>
          <div className={styles.actionRow}>
            <button className={styles.backAction} onClick={() => setStep('hello')} type="button">
              Back
            </button>
            <button
              className={styles.primaryAction}
              disabled={!displayName.trim()}
              onClick={continueToCapacity}
              type="button"
            >
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      ) : null}

      {step === 'capacity' ? (
        <section className={styles.step} aria-labelledby="onboarding-capacity-title">
          <div className={styles.conversationRow}>
            <Image
              className={styles.tutiiImage}
              src="/mascot/firefly-guide-onboarding-light-cutout-v2.webp"
              alt="Tutii listens while you choose how you take part."
              width={260}
              height={260}
              priority
            />
            <div className={styles.voice}>
              <p className={styles.eyebrow}>Your place in this community</p>
              <h2
                className={styles.title}
                id="onboarding-capacity-title"
                ref={capacityHeading}
                tabIndex={-1}
              >
                And what brings you here, {firstName}?
              </h2>
              <p className={styles.prompt}>Choose what fits best for now. You can take part in other ways, too.</p>
            </div>
          </div>
          <fieldset className={styles.roles}>
            <legend className={styles.fieldLabel}>I’m here as a…</legend>
            {capacities.map((item) => (
              <label className={styles.roleOption} key={item.value}>
                <input
                  checked={selectedCapacity === item.value}
                  name="capacity"
                  onChange={() => setSelectedCapacity(item.value)}
                  type="radio"
                  value={item.value}
                />
                <span aria-hidden="true" className={styles.roleSymbol}>{item.symbol}</span>
                <span className={styles.roleCopy}>
                  <span className={styles.roleName}>{item.label}</span>
                  <span className={styles.roleDetail}>{item.detail}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {identityStatus === 'signed-out' ? (
            <p className={styles.accountNote}>
              Next, you’ll create your account. We’ll bring you back here to finish setting up.
            </p>
          ) : null}
          <div className={styles.actionRow}>
            <button className={styles.backAction} onClick={() => setStep('name')} type="button">
              Back
            </button>
            <button
              className={styles.primaryAction}
              disabled={state === 'submitting'}
              type="submit"
            >
              {state === 'submitting'
                ? 'Preparing your space…'
                : identityStatus === 'authenticated'
                  ? 'Enter my Sanctuary'
                  : identityStatus === 'unavailable'
                    ? 'Try account check again'
                    : 'Create my account'}
              {state !== 'submitting' ? <span aria-hidden="true">→</span> : null}
            </button>
          </div>
        </section>
      ) : null}

      {state === 'error' || state === 'unavailable' ? (
        <div className={styles.error} role="alert">
          <p>{message}</p>
          <div className={styles.errorLinks}>
            <Link href="/sign-in?returnTo=/onboarding">Sign in with account</Link>
            <Link href="/welcome">Return to welcome</Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
