import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RadarGalleryClient } from './RadarGalleryClient';

export const metadata: Metadata = {
  title: 'Radar examples | Gurudevi Dev',
  robots: { index: false, follow: false },
};

export default function RadarGalleryPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <RadarGalleryClient />;
}
