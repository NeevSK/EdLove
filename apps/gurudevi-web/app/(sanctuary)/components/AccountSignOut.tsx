'use client';

import { useState } from 'react';

export function AccountSignOut() {
  const [message, setMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    setMessage(null);
    try {
      const response = await fetch('/auth/signout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Sign-out request failed');
    } catch {
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
