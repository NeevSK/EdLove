import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { VergerLabClient } from './VergerLabClient';

export const metadata: Metadata = {
  title: 'Verger Lab | Gurudevi Sanctuary',
  description: "Every layer of verger, the page's adaptive runtime, live and tunable",
};

/** Development only: a production build answers 404 (the lab never ships). */
export default function VergerLabPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <SanctuaryShell displayName="Staff / Lab" navigationPrefix="">
      <VergerLabClient />
    </SanctuaryShell>
  );
}
