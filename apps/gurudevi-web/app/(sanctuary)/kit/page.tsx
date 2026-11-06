import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KitGalleryClient } from './KitGalleryClient';

export const metadata: Metadata = {
  title: 'UI Kit Gallery | Gurudevi Dev',
  description: 'Exhaustive verification gallery for @repo/ui components',
  robots: { index: false, follow: false },
};

/**
 * Development only route: in production builds this renders 404.
 * Never ships to end users.
 */
export default function KitGalleryPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <KitGalleryClient />;
}
