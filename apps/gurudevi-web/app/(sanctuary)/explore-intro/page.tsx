import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { resolveSurfaceUrl } from '@/lib/surface-urls';

export const metadata: Metadata = {
  title: 'A quick introduction to Explore | Gurudevi',
  description: 'Meet Tutii and get a brief orientation before exploring Gurudevi.',
};

export default function ExploreIntroductionPage() {
  redirect(resolveSurfaceUrl('explore', '/self'));
}
