import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: 'The Ecology & Philosophy',
  description:
    'Gurudevi is an education ecology support system and sanctuary for education in Sri Lanka.',
};

export default function AboutPage() {
  return <AboutClient />;
}
