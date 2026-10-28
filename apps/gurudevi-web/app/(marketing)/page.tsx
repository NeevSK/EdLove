import type { Metadata } from 'next';
import { MarketingClient } from './MarketingClient';

export const metadata: Metadata = {
  title: { absolute: 'Gurudevi | Education Ecology Support System and Sanctuary for Education' },
  description:
    'Gurudevi is an education ecology support system and sanctuary for education in Sri Lanka, connecting teachers, students, schools, families, and communities.',
  alternates: {
    canonical: 'https://gurudevi.app/',
    languages: {
      en: 'https://gurudevi.app/',
      si: 'https://gurudevi.app/si',
      ta: 'https://gurudevi.app/ta',
      'x-default': 'https://gurudevi.app/',
    },
  },
  openGraph: {
    title: 'Gurudevi | Education Ecology Support System and Sanctuary for Education',
    description: 'An education ecology support system and sanctuary for education in Sri Lanka.',
    locale: 'en_LK',
    alternateLocale: ['si_LK', 'ta_LK'],
    type: 'website',
  },
};

export default function MarketingPage() {
  return <MarketingClient />;
}
