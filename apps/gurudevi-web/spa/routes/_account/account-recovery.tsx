import { GoTo, ReturnTo } from '../../surface/navigation';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AccountRecoveryFloor } from '../../../app/(sanctuary)/account-recovery/AccountRecoveryFloor';
import { AuthFrame } from '../../../app/(sanctuary)/auth/AuthFrame';
import { safeReturnPath } from '../../../app/(sanctuary)/auth/routeSafety';
import { useAccess } from '../../surface/access';

export const Route = createFileRoute('/_account/account-recovery')({
  validateSearch: z.object({ returnTo: z.string().optional(), mode: z.string().optional() }),
  component: AccountRecoveryScreen,
});

function AccountRecoveryScreen() {
  const { returnTo, mode } = Route.useSearch();
  const access = useAccess();
  const back = safeReturnPath(returnTo ?? null);
  if (access.kind === 'loading') return null;
  if (mode !== 'reset' && access.kind === 'inactive')
    return (
      <AuthFrame
        title="This account is unavailable"
        description="Your account is not available for sanctuary access right now. This screen has not deleted any data."
      >
        <AccountRecoveryFloor message={access.message} returnTo={back} />
      </AuthFrame>
    );
  if (mode !== 'reset' && access.kind === 'ready')
    return <ReturnTo path={returnTo ? back : '/workspace'} />;
  if (mode !== 'reset' && access.kind === 'onboarding-required') return <GoTo to="/onboarding" />;
  return <GoTo to="/recovery" returnTo={back} />;
}
