import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { GURUDEVI_EXPLORE_URL } from '@repo/core/config/publicUrls';

export const metadata: Metadata = {
  title: 'A quick introduction to Explore | Gurudevi',
  description: 'Meet Tutii and get a brief orientation before exploring Gurudevi.',
};

export default function ExploreIntroductionPage() {
  redirect(`${GURUDEVI_EXPLORE_URL}/self`);
}
