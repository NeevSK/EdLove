import { createFileRoute } from '@tanstack/react-router';
import { VergerLabClient } from '../../../app/(sanctuary)/verger-lab/VergerLabClient';

export const Route = createFileRoute('/_dev/verger-lab')({
  head: () => ({ meta: [{ title: 'Verger Lab | Gurudevi Sanctuary' }] }),
  component: VergerLabScreen,
});

function VergerLabScreen() {
  return <VergerLabClient />;
}
