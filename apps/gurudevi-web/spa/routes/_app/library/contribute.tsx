import { createFileRoute } from '@tanstack/react-router';
import { ContributeDesk } from '../../../../app/(sanctuary)/library/contribute/ContributeDesk';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/library/contribute')({
  component: LibraryContributeScreen,
});

function LibraryContributeScreen() {
  const { capacity, displayName } = useSession();
  return <ContributeDesk displayName={displayName} capacity={capacity} />;
}
