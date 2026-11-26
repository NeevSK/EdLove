import { createFileRoute } from '@tanstack/react-router';
import { ArchitectureClient } from '../../../app/(sanctuary)/architecture/ArchitectureClient';

export const Route = createFileRoute('/_dev/architecture')({
  head: () => ({ meta: [{ title: 'Architecture & Code-ERD Explorer | Gurudevi DevTools' }] }),
  component: ArchitectureScreen,
});

function ArchitectureScreen() {
  return <ArchitectureClient />;
}
