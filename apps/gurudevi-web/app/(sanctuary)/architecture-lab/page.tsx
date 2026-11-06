import type { Metadata } from 'next';
import { ArchitectureLabClient } from './ArchitectureLabClient';

export const metadata: Metadata = {
  title: 'Architecture Lab & Seam Simulator | Gurudevi DevTools',
  description:
    'Interactive first-principles playground: Seam pipelines, anti-pattern battle arena, monorepo quarantine, and architectural rosetta stone.',
};

export default function ArchitectureLabPage() {
  return <ArchitectureLabClient />;
}
