import type { AccountDeletion } from '@repo/core/api/v1/contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import styles from './profile.module.css';

function statusText(request: AccountDeletion): string {
  if (request.status === 'pending_verification')
    return 'Your deletion request is pending verification.';
  if (request.status === 'scheduled') return 'Your deletion request is scheduled.';
  if (request.status === 'cancelled') return 'Your deletion request was cancelled.';
  return `Deletion request status: ${request.status}.`;
}

export function AccountDeletionControl() {
  // The surface's sources and commands, which the app hands every route.
  const { sources, commands } = useRouter().options.context;
  const queryClient = useQueryClient();
  const source = sources.accountDeletion();
  const request = useQuery(source);
  const change = useMutation({
    mutationFn: (action: 'request' | 'cancel') =>
      action === 'request' ? commands.requestAccountDeletion() : commands.cancelAccountDeletion(),
    onSuccess: (next) => queryClient.setQueryData(source.queryKey, next),
  });

  const current = change.data ?? request.data ?? null;
  const canCancel = current?.status === 'pending_verification' || current?.status === 'scheduled';
  const submitting = change.isPending;
  let message = '';
  let failed = false;
  if (change.isError) {
    message = 'We could not update your deletion request. Please try again.';
    failed = true;
  } else if (change.data) message = statusText(change.data);
  else if (request.isError) {
    message = 'We could not load your deletion status. Please try again later.';
    failed = true;
  }

  return (
    <section className={styles.deletion} aria-labelledby="deletion-title">
      <h2 id="deletion-title">Account deletion</h2>
      <p>
        Requesting deletion begins a protected review. It does not erase your account immediately;
        retention rules for school, safeguarding, financial, and audit records may still apply.
      </p>
      {request.isPending ? <p role="status">Loading deletion status…</p> : null}
      {message ? <p role={failed ? 'alert' : 'status'}>{message}</p> : null}
      <div className={styles.deletionActions}>
        {canCancel ? (
          <button disabled={submitting} onClick={() => change.mutate('cancel')} type="button">
            {submitting ? 'Updating…' : 'Cancel deletion request'}
          </button>
        ) : (
          <button
            disabled={request.isPending || submitting}
            onClick={() => change.mutate('request')}
            type="button"
          >
            {submitting ? 'Submitting…' : 'Request account deletion'}
          </button>
        )}
      </div>
    </section>
  );
}
