import { createFileRoute } from '@tanstack/react-router';
import { DocumentListFloor } from '../../../../app/(sanctuary)/admin/documents/DocumentListFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/admin/documents')({
  head: () => ({ meta: [{ title: 'Circulars & Documents | Gurudevi Sanctuary' }] }),
  component: AdminDocumentsScreen,
});

function AdminDocumentsScreen() {
  const { capacity, displayName } = useSession();
  return <DocumentListFloor displayName={displayName} capacity={capacity} />;
}
