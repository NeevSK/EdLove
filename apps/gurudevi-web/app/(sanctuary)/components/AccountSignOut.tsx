'use client';

import { useState } from 'react';
import { executeSovereignSignOut } from '../../../lib/sanctuary/signOut';

export function AccountSignOut() {
  const [message, setMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    setMessage(null);
    try {
      await executeSovereignSignOut('/');
    } catch (cause) {
      setIsSigningOut(false);
      setMessage(
        cause instanceof Error
          ? cause.message
          : 'We could not complete sign out. Please try again.',
      );
    }
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
