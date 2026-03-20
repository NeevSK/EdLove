import { useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useStore } from '../store/useStore';
import type { UserRole, User } from '../types';

export type AccessStage =
  | 'loading'
  | 'signed_out'
  | 'needs_onboarding'
  | 'guest'
  | 'needs_school'
  | 'ready';

export interface AccessState {
  stage: AccessStage;

  sessionResolved: boolean;
  session: Session | null;

  user: User | null;
  role: UserRole | null;
  onboardingCompleted: boolean;

  isAnonymous: boolean;
  isRegistered: boolean;

  schoolId: string | null;
  hasSchool: boolean;
  isDemoSchool: boolean;
}

function inferAnonymousFromSession(session: Session | null): boolean {
  const authUser = session?.user as any;
  if (!authUser) return false;
  if (authUser.is_anonymous === true) return true;
  if (!authUser.email) return true;
  return false;
}

export function useAccessState(): AccessState {
  const sessionResolved = useStore((s) => s.authSessionResolved);
  const session = useStore((s) => s.authSession);
  const user = useStore((s) => s.user);
  const role = useStore((s) => s.userRole);
  const onboardingCompleted = useStore((s) => s.onboardingCompleted);

  return useMemo(() => {
    const schoolId = user?.school_id || null;
    const isDemoSchool = schoolId === 'mock-school';
    const hasSchool = !!schoolId && !isDemoSchool;

    const profileAnonymous =
      typeof (user as any)?.is_anonymous === 'boolean' ? !!(user as any).is_anonymous : null;
    const sessionAnonymous = inferAnonymousFromSession(session);
    const isAnonymous = profileAnonymous ?? sessionAnonymous;

    const isRegistered = !!session?.user && !isAnonymous && !!(session.user as any)?.email;

    let stage: AccessStage = 'loading';
    if (!sessionResolved) {
      stage = 'loading';
    } else if (!session?.user) {
      stage = 'signed_out';
    } else if (!onboardingCompleted || !role) {
      stage = 'needs_onboarding';
    } else if (isAnonymous) {
      stage = 'guest';
    } else if (!hasSchool) {
      stage = 'needs_school';
    } else {
      stage = 'ready';
    }

    return {
      stage,
      sessionResolved,
      session,
      user,
      role,
      onboardingCompleted,
      isAnonymous,
      isRegistered,
      schoolId,
      hasSchool,
      isDemoSchool,
    };
  }, [onboardingCompleted, role, session, sessionResolved, user]);
}

