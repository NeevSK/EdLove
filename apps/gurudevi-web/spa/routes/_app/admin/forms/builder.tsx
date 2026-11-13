import { createFileRoute } from '@tanstack/react-router';
import { FormBuilderFloor } from '../../../../../app/(sanctuary)/admin/forms/builder/FormBuilderFloor';
import { useSession } from '../../../../surface/session';

export const Route = createFileRoute('/_app/admin/forms/builder')({
  head: () => ({ meta: [{ title: 'Form Builder | Gurudevi Sanctuary' }] }),
  component: AdminFormsBuilderScreen,
});

function AdminFormsBuilderScreen() {
  const { capacity, displayName } = useSession();
  return <FormBuilderFloor displayName={displayName} capacity={capacity} />;
}
