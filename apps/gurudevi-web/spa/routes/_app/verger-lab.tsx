import { createFileRoute } from '@tanstack/react-router';
import { VergerLabClient } from '../../../app/(sanctuary)/verger-lab/VergerLabClient';

export const Route = createFileRoute('/_app/verger-lab')({
  component: VergerLabScreen,
});

function VergerLabScreen() {
  return <VergerLabClient />;
}
