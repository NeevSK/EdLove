import { createFileRoute } from '@tanstack/react-router';
import { SecurityFloor } from '../../../../app/(sanctuary)/profile/security/SecurityFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/profile/security')({
  component: ProfileSecurityScreen,
});

function ProfileSecurityScreen() {
  const { accountId, authSubjectId, displayName } = useSession();
  return (
    <SecurityFloor
      key={`${accountId}:${authSubjectId}`}
      displayName={displayName}
      accountId={accountId}
      authSubjectId={authSubjectId}
    />
  );
}
