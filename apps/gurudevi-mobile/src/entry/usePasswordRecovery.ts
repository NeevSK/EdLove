import { authAPI } from '@repo/core/api/auth';
import type { AuthMfaFactor } from '@repo/core/logic/ports/auth.port';
import { useCallback, useEffect, useRef, useState } from 'react';

const emptyDraft = { password: '', confirmation: '', currentPassword: '', nonce: '', totpCode: '' };
type RecoveryDraft = typeof emptyDraft;

export function usePasswordRecovery() {
  const attempt = useRef<{ subject: string } | null>(null);
  const busy = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [factors, setFactors] = useState<AuthMfaFactor[]>([]);
  const [factorId, setFactorId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const close = useCallback(() => {
    attempt.current = null;
    busy.current = false;
    setIsOpen(false);
    setDraft(emptyDraft);
    setFactors([]);
    setFactorId('');
    setError(null);
    setNotice(null);
    setPending(false);
  }, []);

  useEffect(() => {
    const { data } = authAPI.onAuthStateChange((event, session) => {
      if (
        event === 'PASSWORD_RECOVERY' &&
        session?.user.id &&
        session.user.is_anonymous === false
      ) {
        close();
        attempt.current = { subject: session.user.id };
        setIsOpen(true);
      } else if (
        attempt.current &&
        (event === 'SIGNED_OUT' ||
          session?.user.id !== attempt.current.subject ||
          session.user.is_anonymous !== false)
      ) {
        close();
      }
    });
    return () => {
      attempt.current = null;
      data.subscription.unsubscribe();
    };
  }, [close]);

  const run = async (
    action: (context: {
      requireCurrent: () => Promise<void>;
      assertCurrent: () => void;
      subject: string;
    }) => Promise<void>,
  ) => {
    const owner = attempt.current;
    if (!owner || busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    setNotice(null);
    const assertCurrent = () => {
      if (attempt.current !== owner) throw new Error('Recovery attempt ended.');
    };
    const requireCurrent = async () => {
      assertCurrent();
      const session = await authAPI.getAuthSession();
      assertCurrent();
      if (session?.user.id !== owner.subject || session.user.is_anonymous !== false) {
        close();
        throw new Error('Recovery account changed.');
      }
    };
    try {
      await requireCurrent();
      assertCurrent();
      await action({ requireCurrent, assertCurrent, subject: owner.subject });
    } catch (cause) {
      if (attempt.current === owner) {
        setError(cause instanceof Error ? cause.message : 'Could not complete password recovery.');
      }
    } finally {
      if (attempt.current === owner) {
        busy.current = false;
        setPending(false);
      }
    }
  };

  const loadFactors = () =>
    run(async ({ requireCurrent, assertCurrent }) => {
      const result = await authAPI.listMfaFactors();
      await requireCurrent();
      assertCurrent();
      const available = result.verified.filter(
        (factor) => factor.factor_type === 'totp' && factor.status === 'verified',
      );
      setFactors(available);
      setFactorId(available[0]?.id ?? '');
      if (!available.length) {
        setError(
          'This account has no verified authenticator. Password recovery cannot continue without a supported recovery method.',
        );
      }
    });

  const requestCode = () =>
    run(async ({ requireCurrent, assertCurrent }) => {
      await authAPI.requestPasswordReauthentication();
      await requireCurrent();
      assertCurrent();
      setNotice('Confirmation code requested. Check your verified email or phone.');
    });

  const save = async () => {
    if (busy.current || !attempt.current) return;
    if (draft.password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (draft.password !== draft.confirmation) {
      setError('The two passwords do not match.');
      return;
    }
    if (!factors.some((factor) => factor.id === factorId) || !/^\d{6}$/.test(draft.totpCode)) {
      setError('Choose a verified authenticator and enter its six-digit code.');
      return;
    }
    await run(async ({ requireCurrent, assertCurrent, subject }) => {
      await authAPI.challengeAndVerifyTotp(factorId, draft.totpCode);
      await requireCurrent();
      assertCurrent();
      await authAPI.updatePassword(draft.password, {
        expectedSubject: subject,
        ...(draft.currentPassword ? { currentPassword: draft.currentPassword } : {}),
        ...(draft.nonce ? { nonce: draft.nonce } : {}),
      });
      await requireCurrent();
      assertCurrent();
      close();
    });
  };

  const edit = (field: keyof RecoveryDraft, value: string) => {
    if (!busy.current && attempt.current) setDraft((current) => ({ ...current, [field]: value }));
  };
  const selectFactor = (id: string) => {
    if (!busy.current && factors.some((factor) => factor.id === id)) setFactorId(id);
  };
  return {
    isOpen,
    draft,
    factors,
    factorId,
    pending,
    error,
    notice,
    close,
    edit,
    selectFactor,
    loadFactors,
    requestCode,
    save,
  };
}
