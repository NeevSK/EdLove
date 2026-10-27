import { getRememberedAccountAuthSubject } from '@repo/core/accounts/deviceAccounts';
import { authAPI } from '@repo/core/api/auth';
import { getActiveAccountId } from '@repo/core/lib/accountScope';

/** A durable command replays only under the live credential bound to its canonical owner. */
export async function isReplayPrincipalCurrent(principalId: string): Promise<boolean> {
  if (getActiveAccountId() !== principalId) return false;

  try {
    const session = await authAPI.getAuthSession();
    if (!session?.user.id) return false;

    const boundSubject = getRememberedAccountAuthSubject(principalId);
    if (!boundSubject || boundSubject !== session.user.id) return false;
    const currentSession = await authAPI.getAuthSession();
    return (
      getActiveAccountId() === principalId &&
      currentSession?.user.id === boundSubject
    );
  } catch {
    return false;
  }
}
