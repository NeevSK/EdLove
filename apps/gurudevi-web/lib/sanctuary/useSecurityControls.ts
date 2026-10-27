'use client';

import { scopedQueryKey } from '@repo/core/lib/clientStateFoundation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createBrowserSupabaseClient } from '../supabase/browser';
import {
  changeSecurityPassword,
  loadSecuritySnapshot,
  requestSecurityPasswordCode,
  type SecurityOwner,
  type SecuritySnapshot,
  unlinkSecurityCredential,
  verifySecurityTotp,
} from './securityClient';

export function useSecurityControls(owner: SecurityOwner) {
  const queryClient = useQueryClient();
  const key = useMemo(
    () => scopedQueryKey({ principalId: owner.accountId }, ['auth-security', owner.authSubjectId]),
    [owner.accountId, owner.authSubjectId],
  );
  const epoch = useRef(0);
  const busy = useRef(false);
  const invalidated = useRef(false);
  const [blocked, setBlocked] = useState(false);
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState('');
  const [selectedFactor, setSelectedFactor] = useState('');
  const [target, setTarget] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => loadSecuritySnapshot(owner, signal),
    enabled: !blocked,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    networkMode: 'always',
    refetchOnWindowFocus: true,
  });
  useEffect(() => {
    invalidated.current = false;
    const client = createBrowserSupabaseClient();
    if (!client) return;
    const { data } = client.auth.onAuthStateChange(
      (event: string, session: { user: { id: string } } | null) => {
        if (event !== 'SIGNED_OUT' && session?.user.id === owner.authSubjectId) return;
        epoch.current += 1;
        invalidated.current = true;
        setBlocked(true);
        setCode('');
        setTarget(null);
        setNotice(null);
        setPasswordChanged(false);
        setError('Your account session changed. Reload security settings.');
        queryClient.removeQueries({ queryKey: key, exact: true });
      },
    );
    return () => {
      epoch.current += 1;
      invalidated.current = true;
      data.subscription.unsubscribe();
    };
  }, [owner.authSubjectId, key, queryClient]);

  const factors = blocked ? [] : (query.data?.factors ?? []);
  const factorId = factors.some((factor) => factor.id === selectedFactor)
    ? selectedFactor
    : (factors[0]?.id ?? '');
  const run = async (action: (current: () => boolean) => Promise<void>) => {
    if (invalidated.current || blocked || busy.current) return;
    const version = epoch.current;
    const current = () => epoch.current === version;
    busy.current = true;
    setPending(true);
    setNotice(null);
    setError(null);
    try {
      await action(current);
    } catch (cause) {
      if (current()) setError(cause instanceof Error ? cause.message : 'Security action failed.');
    } finally {
      if (current()) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  const verify = () =>
    run(async (current) => {
      await verifySecurityTotp(owner, factorId, code);
      if (!current()) return;
      setCode('');
      setNotice('Authenticator verified for this session.');
      await query.refetch();
    });
  const unlink = () =>
    run(async (current) => {
      if (!target) throw new Error('Choose the Google sign-in method to unlink.');
      const receipt = await unlinkSecurityCredential(owner, target);
      if (!current()) return;
      queryClient.setQueryData<SecuritySnapshot>(key, (snapshot) =>
        snapshot
          ? {
              ...snapshot,
              identities: snapshot.identities.filter(
                (identity) => identity.id !== receipt.identityId,
              ),
            }
          : snapshot,
      );
      setTarget(null);
      setCode('');
      setNotice('Google sign-in unlinked. Your account is retained.');
      await query.refetch();
    });
  const requestPasswordCode = () =>
    run(async (current) => {
      await requestSecurityPasswordCode(owner);
      if (current()) setNotice('Confirmation code requested. Check your verified email or phone.');
    });
  const recoverPassword = (
    password: string,
    confirmation: { currentPassword?: string; nonce?: string },
  ) =>
    run(async (current) => {
      if (!factors.some((factor) => factor.id === factorId))
        throw new Error('A verified authenticator is required to change the password.');
      await verifySecurityTotp(owner, factorId, code);
      if (!current()) return;
      await changeSecurityPassword(owner, password, confirmation);
      if (!current()) return;
      setCode('');
      setPasswordChanged(true);
      setNotice('Password changed successfully.');
    });
  return {
    query,
    snapshot: blocked ? undefined : query.data,
    blocked,
    pending,
    code,
    factorId,
    target,
    notice,
    error,
    passwordChanged,
    requestPasswordCode,
    recoverPassword,
    editCode: (value: string) => {
      if (!busy.current && !blocked) setCode(value);
    },
    selectFactor: (value: string) => {
      if (!busy.current && !blocked) setSelectedFactor(value);
    },
    selectTarget: (value: string | null) => {
      if (!busy.current && !blocked) setTarget(value);
    },
    verify,
    unlink,
  };
}
