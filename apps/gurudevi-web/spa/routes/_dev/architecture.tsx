import { createFileRoute } from '@tanstack/react-router';
import { ArchitectureClient } from '../../../app/(sanctuary)/architecture/ArchitectureClient';

export const Route = createFileRoute('/_dev/architecture')({
  component: ArchitectureScreen,
});

function ArchitectureScreen() {
  return <ArchitectureClient />;
}
