import { createFileRoute } from '@tanstack/react-router';
import { DocumentListFloor } from '../../../../app/(sanctuary)/admin/documents/DocumentListFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/admin/documents')({
  component: AdminDocumentsScreen,
});

function AdminDocumentsScreen() {
  const { capacity, displayName } = useSession();
  return <DocumentListFloor displayName={displayName} capacity={capacity} />;
}
