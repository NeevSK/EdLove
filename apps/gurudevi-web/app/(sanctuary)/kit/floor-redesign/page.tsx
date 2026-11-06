import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FloorRedesignClient } from './FloorRedesignClient';

export const metadata: Metadata = {
  title: 'Floor Redesign Prototype | Gurudevi Dev',
  description: 'Polished spatial floor and intentional temporal horizon prototype',
  robots: { index: false, follow: false },
};

/**
 * Floor Redesign Prototype route (/kit/floor-redesign)
 * Dev verification route for polished floor layout and temporal horizon.
 */
export default function FloorRedesignPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <FloorRedesignClient />;
}
