import { useNavigate, useRouter } from '@tanstack/react-router';
import { useLayoutEffect, useRef } from 'react';

/** Where a screen can send someone it should not show: an account step, or their own Workspace. */
type Destination = '/welcome' | '/onboarding' | '/account-recovery' | '/recovery' | '/workspace';

/**
 * Sends the person to an account step, once, with the address they were on when it was decided.
 * `<Navigate>` navigates again whenever its props change, and while that navigation is pending
 * the current location is already the destination: a `returnTo` read from it nests the step inside
 * itself on every render until the tab runs out of memory.
 */
export function GoTo({ to, returnTo }: Readonly<{ to: Destination; returnTo?: string }>) {
  const navigate = useNavigate();
  const sent = useRef(false);
  useLayoutEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void navigate({ to, search: returnTo === undefined ? {} : { returnTo }, replace: true });
  }, [navigate, to, returnTo]);
  return null;
}

/** Continues to a path the person was on before, such as a `returnTo` checked by `safeReturnPath`. */
export function ReturnTo({ path }: Readonly<{ path: string }>) {
  const router = useRouter();
  const sent = useRef(false);
  useLayoutEffect(() => {
    if (sent.current) return;
    sent.current = true;
    router.history.replace(path);
  }, [router, path]);
  return null;
}
