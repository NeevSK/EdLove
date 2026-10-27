'use client';

import {
  completeOnboarding,
  createInitialBond,
  createOnboardingCompletionKey,
} from '@repo/core/api/onboardingClient';
import Image from 'next/image';
import Link from 'next/link';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { browserAuthRuntime } from '../auth/browserAuth';
import styles from './onboarding.module.css';

const capacities = [
  {
    value: 'teacher',
    label: 'Teacher',
    symbol: '🍎',
    detail: 'I teach, guide, or care for a classroom.',
  },
  {
    value: 'student',
    label: 'Student',
    symbol: '📚',
    detail: 'I’m here to learn, explore, and grow.',
  },
  {
    value: 'principal',
    label: 'School leader',
    symbol: '🏫',
    detail: 'I help a school community work well together.',
  },
  {
    value: 'parent',
    label: 'Parent',
    symbol: '🌱',
    detail: 'I support a learner and stay connected with school.',
  },
  {
    value: 'guardian',
    label: 'Guardian',
    symbol: '🤝',
    detail: 'I care for and encourage a learner.',
  },
  {
    value: 'librarian',
    label: 'Librarian',
    symbol: '📖',
    detail: 'I help people find books, media, and ideas.',
  },
] as const;

type FormState = 'ready' | 'submitting' | 'unavailable' | 'error';
type JourneyStep = 'name' | 'capacity' | 'nudge';
type IdentityStatus = 'checking' | 'authenticated' | 'signed-out' | 'unavailable';
const onboardingDraftKey = 'gurudevi_onboarding_draft_v1';

function readOnboardingDraft(): { displayName: string; capacity: string } | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(onboardingDraftKey) ?? 'null');
    if (typeof value !== 'object' || value === null) return null;
    const displayName = Reflect.get(value, 'displayName');
    const capacity = Reflect.get(value, 'capacity');
    if (typeof displayName !== 'string' || !capacities.some((item) => item.value === capacity))
      return null;
    return { displayName, capacity };
  } catch {
    return null;
  }
}

function saveOnboardingDraft(displayName: string, capacity: string) {
  try {
    sessionStorage.setItem(
      onboardingDraftKey,
      JSON.stringify({
        displayName: displayName.trim(),
        capacity,
      }),
    );
  } catch {
    // Session storage may be unavailable in strict private modes
  }
}

function getTargetSelfUrl(): string {
  if (typeof window === 'undefined') return '/self';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    return '/self?surface=explore';
  }
  return 'https://explore.gurudevi.app/self';
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
  const [step, setStep] = useState<JourneyStep>('name');
  const [completionKey] = useState(createOnboardingCompletionKey);
  const [state, setState] = useState<FormState>('ready');
  const [message, setMessage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('teacher');
  const [identityStatus, setIdentityStatus] = useState<IdentityStatus>(() => {
    if (typeof window === 'undefined') return 'checking';
    return browserAuthRuntime() ? 'checking' : 'unavailable';
  });
  const capacityHeading = useRef<HTMLHeadingElement>(null);
  const firstName = displayName.trim().split(/\s+/)[0] || 'there';
  const roleLabel =
    capacities.find((item) => item.value === selectedCapacity)?.label ?? 'member';

  useEffect(() => {
    let isCurrent = true;
    const runtime = browserAuthRuntime();
    if (!runtime) return;

    runtime.bootstrapIdentity().then((identity) => {
      if (!isCurrent) return;
      const isAuth =
        identity.status === 'authenticated' && !identity.session.user.is_anonymous;
      setIdentityStatus(isAuth ? 'authenticated' : 'signed-out');
      const draft = readOnboardingDraft();
      if (draft) {
        setDisplayName(draft.displayName);
        setSelectedCapacity(draft.capacity);
        setStep('capacity');
      }
    });

    return () => {
      isCurrent = false;
    };
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
    saveOnboardingDraft(displayName, selectedCapacity);
    setStep('capacity');
  }

  async function handleCapacitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!displayName.trim() || !capacities.some((item) => item.value === selectedCapacity)) {
      setState('error');
      setMessage('Please enter your name and select a role.');
      return;
    }

    saveOnboardingDraft(displayName, selectedCapacity);

    // If user does not have an authenticated account, nudge them unavoidably to create one
    if (identityStatus !== 'authenticated') {
      setStep('nudge');
      return;
    }

    const runtime = browserAuthRuntime();
    if (!runtime) {
      setState('unavailable');
      setMessage('Enrollment is not configured in this environment.');
      return;
    }

    const identity = await runtime.bootstrapIdentity();
    const hasRealAccount =
      identity.status === 'authenticated' && !identity.session.user.is_anonymous;

    if (!hasRealAccount) {
      setIdentityStatus('signed-out');
      setStep('nudge');
      return;
    }

    setState('submitting');
    setMessage('');
    try {
      const expectedSession = {
        accessToken: identity.session.access_token,
        subject: identity.session.user.id,
      };
      await createInitialBond(
        {
          orientation: selectedCapacity,
          confirmCapacityChange: false,
          context: { displayName: displayName.trim() },
        },
        expectedSession,
      );
      await completeOnboarding({ idempotencyKey: completionKey }, expectedSession);
      try {
        sessionStorage.removeItem(onboardingDraftKey);
      } catch {
        // Ignored
      }
      window.location.replace(getTargetSelfUrl());
    } catch (error) {
      setState('error');
      setMessage(unavailableMessage(errorStatus(error)));
    }
  }

  return (
    <form
      className={styles.conversation}
      onSubmit={(event) => {
        handleCapacitySubmit(event);
      }}
    >
      <div
        className={styles.progress}
        role="group"
        aria-label={`Step ${step === 'name' ? 1 : step === 'capacity' ? 2 : 3} of ${identityStatus === 'authenticated' ? 2 : 3}`}
      >
        <span
          aria-hidden="true"
          className={styles.progressSegment}
          data-active={true}
        />
        <span
          aria-hidden="true"
          className={styles.progressSegment}
          data-active={step === 'capacity' || step === 'nudge'}
        />
        {identityStatus !== 'authenticated' ? (
          <span
            aria-hidden="true"
            className={styles.progressSegment}
            data-active={step === 'nudge'}
          />
        ) : null}
      </div>

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
              <h2 className={styles.title} id="onboarding-name-title">
                What’s your name?
              </h2>
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
            <Link className={styles.backAction} href="/welcome">
              Welcome
            </Link>
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
              alt="Tutii listens while you choose your role."
              width={260}
              height={260}
              priority
            />
            <div className={styles.voice}>
              <h2
                className={styles.title}
                id="onboarding-capacity-title"
                ref={capacityHeading}
                tabIndex={-1}
              >
                Choose your role, {firstName}
              </h2>
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
                <span aria-hidden="true" className={styles.roleSymbol}>
                  {item.symbol}
                </span>
                <span className={styles.roleCopy}>
                  <span className={styles.roleName}>{item.label}</span>
                  <span className={styles.roleDetail}>{item.detail}</span>
                </span>
              </label>
            ))}
          </fieldset>
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
                  : 'Continue'}
              {state !== 'submitting' ? <span aria-hidden="true">→</span> : null}
            </button>
          </div>
        </section>
      ) : null}

      {step === 'nudge' ? (
        <section className={styles.step} aria-labelledby="onboarding-nudge-title">
          <div className={styles.conversationRow}>
            <Image
              className={styles.tutiiImage}
              src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
              alt="Tutii invites you to create your account."
              width={260}
              height={260}
              priority
            />
            <div className={styles.voice}>
              <h2 className={styles.title} id="onboarding-nudge-title">
                Create your account with Tutii
              </h2>
              <p className={styles.prompt}>
                Welcome, {firstName}! To enter as a {roleLabel} and keep your personal Sanctuary secure, let’s create your account.
              </p>
            </div>
          </div>
          <div className={styles.nudgeActions}>
            <Link
              className={styles.primaryAction}
              href="/sign-up?returnTo=%2Fonboarding"
              onClick={() => saveOnboardingDraft(displayName, selectedCapacity)}
            >
              <span>Create account with Tutii</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              className={styles.secondaryActionLink}
              href="/sign-in?returnTo=%2Fonboarding"
              onClick={() => saveOnboardingDraft(displayName, selectedCapacity)}
            >
              Already have an account? Sign in
            </Link>
            <a
              className={styles.secondaryActionLink}
              href={getTargetSelfUrl()}
              onClick={() => saveOnboardingDraft(displayName, selectedCapacity)}
            >
              Or enter Guest House directly →
            </a>
          </div>
          <div className={styles.actionRow} style={{ marginTop: '20px' }}>
            <button className={styles.backAction} onClick={() => setStep('capacity')} type="button">
              Back to roles
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
