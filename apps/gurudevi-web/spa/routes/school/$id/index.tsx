import { createFileRoute } from '@tanstack/react-router';
import { SchoolPublicFloor } from '../../../../app/(sanctuary)/school/[id]/SchoolPublicFloor';

export const Route = createFileRoute('/school/$id/')({
  component: SchoolScreen,
});

function SchoolScreen() {
  const { id } = Route.useParams();
  return <SchoolPublicFloor schoolId={id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64)} />;
}
