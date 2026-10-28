'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { executeSovereignSignOut } from '../../../lib/sanctuary/signOut';

interface AccountRecoveryFloorProps {
  message?: string;
  returnTo?: string;
}

export function AccountRecoveryFloor({ message, returnTo }: AccountRecoveryFloorProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setIsRetrying(true);
    setError(null);
    router.refresh();
    setTimeout(() => {
      setIsRetrying(false);
    }, 1200);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setError(null);
    try {
      await executeSovereignSignOut('/welcome');
    } catch (err: unknown) {
      console.warn('[account recovery] sign-out failed', err);
      setError('Could not sign out on this browser. Please try again.');
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
        <p className="font-medium">
          {message ||
            'Your account is not available for sanctuary access right now. This screen has not deleted any data.'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying || isSigningOut}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-line bg-paper px-4 py-2 font-sans text-sm font-semibold text-ink transition hover:border-gold focus:outline-3 focus:outline-offset-2 focus:outline-water disabled:opacity-60"
        >
          {isRetrying ? 'Checking status…' : 'Try again'}
        </button>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-gold px-4 py-2 font-sans text-sm font-semibold text-paper transition hover:brightness-110 focus:outline-3 focus:outline-offset-2 focus:outline-water disabled:opacity-60"
        >
          {isSigningOut ? 'Signing out…' : 'Sign out on this browser'}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="border-t border-line/50 pt-4 text-center">
        <Link
          href={`/recovery${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          className="text-xs text-secondary hover:text-ink hover:underline"
        >
          Need to reset your credentials or password? Go to password recovery →
        </Link>
      </div>
    </div>
  );
}
