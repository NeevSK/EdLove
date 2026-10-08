'use client';

import { completeOnboarding, createInitialBond } from '@repo/core/api/onboardingClient';
import { type FormEvent, useState } from 'react';
import { browserAuthRuntime } from '../auth/browserAuth';

const capacities = [
  ['student', 'Student'],
  ['teacher', 'Teacher'],
  ['parent', 'Parent'],
  ['guardian', 'Guardian'],
  ['principal', 'School leader'],
  ['librarian', 'Librarian'],
] as const;

type FormState = 'ready' | 'submitting' | 'unavailable' | 'error';

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
  const [state, setState] = useState<FormState>('ready');
  const [message, setMessage] = useState('');

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setState('unavailable');
      setMessage('Enrollment is not configured in this environment.');
      return;
    }

    const identity = await runtime.bootstrapIdentity();
    if (identity.status !== 'authenticated') {
      setState('error');
      setMessage('Sign in or create an account before choosing your capacity.');
      return;
    }

    const values = new FormData(form);
    const displayName = String(values.get('displayName') ?? '').trim();
    const orientation = String(values.get('capacity') ?? '');
    if (!displayName || !capacities.some(([value]) => value === orientation)) {
      setState('error');
      setMessage('Enter your name and choose one primary capacity.');
      return;
    }

    setState('submitting');
    setMessage('');
    try {
      await createInitialBond({
        orientation,
        confirmCapacityChange: false,
        context: { displayName },
      });
      await completeOnboarding();
      window.location.replace('/self');
    } catch (error) {
      setState('error');
      setMessage(unavailableMessage(errorStatus(error)));
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void complete(event)}>
      <div>
        <label className="block font-sans text-sm font-semibold" htmlFor="onboarding-name">
          Your name
        </label>
        <input
          autoComplete="name"
          className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
          id="onboarding-name"
          name="displayName"
          required
          type="text"
        />
      </div>
      <fieldset>
        <legend className="font-sans text-sm font-semibold">Your primary capacity</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {capacities.map(([value, label]) => (
            <label
              className="flex min-h-12 items-center gap-3 border border-line px-3 font-sans text-sm hover:border-lotus"
              key={value}
            >
              <input name="capacity" required type="radio" value={value} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      {state === 'error' || state === 'unavailable' ? (
        <p className="font-sans text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 font-sans text-sm font-bold text-paper hover:bg-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water"
        disabled={state === 'submitting'}
        type="submit"
      >
        {state === 'submitting' ? 'Establishing your sanctuary…' : 'Continue to Self'}
      </button>
    </form>
  );
}
