import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchitectureClient } from './ArchitectureClient';

export const metadata: Metadata = {
  title: 'Architecture & Code-ERD Explorer | Gurudevi DevTools',
  description: 'Inspect topological file layers, internal functions/types, and view full source code down to bedrock.',
};

export default function ArchitecturePage() {
  // CRITICAL GATE: Development tool only. Strictly disabled in production.
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <ArchitectureClient />;
}
