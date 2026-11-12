import { createFileRoute } from '@tanstack/react-router';
import { ArchitectureLabClient } from '../../app/(sanctuary)/architecture-lab/ArchitectureLabClient';

export const Route = createFileRoute('/architecture-lab')({
  component: ArchitectureLabScreen,
});

function ArchitectureLabScreen() {
  return <ArchitectureLabClient />;
}
