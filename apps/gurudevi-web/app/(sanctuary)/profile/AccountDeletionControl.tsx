'use client';

import type { AccountDeletionRequest } from '@repo/core/logic/ports/auth.port';
import { useEffect, useState } from 'react';
import styles from './profile.module.css';

type RequestState = AccountDeletionRequest | null;

function statusText(request: AccountDeletionRequest): string {
  if (request.status === 'pending_verification')
    return 'Your deletion request is pending verification.';
  if (request.status === 'scheduled') return 'Your deletion request is scheduled.';
  if (request.status === 'cancelled') return 'Your deletion request was cancelled.';
  return `Deletion request status: ${request.status}.`;
}

export function AccountDeletionControl() {
  const [request, setRequest] = useState<RequestState>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'submitting' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void fetch('/auth/deletion', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to read deletion status.');
        return (await response.json()) as RequestState;
      })
      .then((nextRequest) => {
        if (!active) return;
        setRequest(nextRequest);
        setState('ready');
      })
      .catch(() => {
        if (!active) return;
        setState('error');
        setMessage('We could not load your deletion status. Please try again later.');
      });
    return () => {
      active = false;
    };
  }, []);

  async function mutate(method: 'POST' | 'DELETE') {
    setState('submitting');
    setMessage('');
    try {
      const response = await fetch('/auth/deletion', { method, credentials: 'same-origin' });
      if (!response.ok) throw new Error('Deletion request failed.');
      const nextRequest = (await response.json()) as AccountDeletionRequest;
      setRequest(nextRequest);
      setMessage(statusText(nextRequest));
      setState('ready');
    } catch {
      setState('error');
      setMessage('We could not update your deletion request. Please try again.');
    }
  }

  const canCancel = request?.status === 'pending_verification' || request?.status === 'scheduled';

  return (
    <section className={styles.deletion} aria-labelledby="deletion-title">
      <h2 id="deletion-title">Account deletion</h2>
      <p>
        Requesting deletion begins a protected review. It does not erase your account immediately;
        retention rules for school, safeguarding, financial, and audit records may still apply.
      </p>
      {state === 'loading' ? <p role="status">Loading deletion status…</p> : null}
      {message ? <p role={state === 'error' ? 'alert' : 'status'}>{message}</p> : null}
      <div className={styles.deletionActions}>
        {canCancel ? (
          <button
            disabled={state === 'submitting'}
            onClick={() => void mutate('DELETE')}
            type="button"
          >
            {state === 'submitting' ? 'Updating…' : 'Cancel deletion request'}
          </button>
        ) : (
          <button
            disabled={state === 'loading' || state === 'submitting'}
            onClick={() => void mutate('POST')}
            type="button"
          >
            {state === 'submitting' ? 'Submitting…' : 'Request account deletion'}
          </button>
        )}
      </div>
    </section>
  );
}
