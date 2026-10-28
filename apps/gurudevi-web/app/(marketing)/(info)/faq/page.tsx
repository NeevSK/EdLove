import type { Metadata } from 'next';
import { FaqClient } from './FaqClient';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Clear answers about Gurudevi, its people, and its multi-year horizon.',
};

export default function FaqPage() {
  return <FaqClient />;
}
