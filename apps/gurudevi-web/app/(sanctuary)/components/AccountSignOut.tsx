'use client';

import { useState } from 'react';
import { browserAuthRuntime } from '../auth/browserAuth';

export function AccountSignOut() {
  const [message, setMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setMessage('Sign-out is unavailable because account authentication is not configured.');
      return;
    }
    setIsSigningOut(true);
    setMessage(null);
    const { error } = await runtime.client.auth.signOut();
    if (error) {
      setIsSigningOut(false);
      setMessage('We could not sign you out. Please try again.');
      return;
    }
    window.location.replace('/');
  }

  return (
    <div>
      <button disabled={isSigningOut} onClick={() => void signOut()} type="button">
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>
      {message ? <p role="alert">{message}</p> : null}
    </div>
  );
}
