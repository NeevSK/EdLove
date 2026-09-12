'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';

type CallbackState = Readonly<{ status: 'loading' }> | Readonly<{ status: 'error'; message: string }>;

export function CallbackHandler({ next, returnTo }: Readonly<{ next: string; returnTo: string }>) {
  const [state, setState] = useState<CallbackState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      const runtime = browserAuthRuntime();
      if (!runtime) {
        if (active) setState({ status: 'error', message: 'Account confirmation is not configured in this environment.' });
        return;
      }
      const code = new URLSearchParams(window.location.search).get('code');
      if (!code) {
        if (active) setState({ status: 'error', message: 'This account link is missing its confirmation code. Request a new link and try again.' });
        return;
      }
      const { error } = await runtime.client.auth.exchangeCodeForSession(code);
      if (!active) return;
      if (error) {
        setState({ status: 'error', message: error.message });
        return;
      }
      const destination = new URL(safeReturnPath(next), window.location.origin);
      if (destination.pathname === '/reset-password') destination.searchParams.set('returnTo', safeReturnPath(returnTo));
      window.location.replace(`${destination.pathname}${destination.search}`);
    });
    return () => { active = false; };
  }, [next, returnTo]);

  if (state.status === 'loading') return <p className="font-sans text-lg leading-8 text-ink-soft" role="status">Confirming your secure link…</p>;
  return <div><p className="font-sans text-lg leading-8 text-red-700" role="alert">{state.message}</p><Link className="primary-action" href="/recovery">Request another recovery link</Link></div>;
}
