import { createFileRoute } from '@tanstack/react-router';
import { ArchitectureLabClient } from '../../app/(sanctuary)/architecture-lab/ArchitectureLabClient';

export const Route = createFileRoute('/architecture-lab')({
  head: () => ({ meta: [{ title: 'Architecture Lab & Seam Simulator | Gurudevi DevTools' }] }),
  component: ArchitectureLabScreen,
});

function ArchitectureLabScreen() {
  return <ArchitectureLabClient />;
}
