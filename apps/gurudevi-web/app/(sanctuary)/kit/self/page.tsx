import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SelfKitClient } from './SelfKitClient';

export const metadata: Metadata = {
  title: 'Self Floor Reorganization & Progressive Disclosure Showcase | Gurudevi Dev',
  description: 'Comparative arena showcasing 4 distinct architectural paradigms for the Self Floor with Pebble cards and progressive disclosure.',
  robots: { index: false, follow: false },
};

export default function SelfKitPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <SelfKitClient />;
}
