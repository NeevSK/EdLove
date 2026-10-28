import type { Metadata } from 'next';
import { PUBLIC_LOCALES } from '../../lib/locales';
import { MarketingHeader } from '../(marketing)/MarketingHeader';
import { MarketingClient } from '../(marketing)/MarketingClient';
import { MarketingFooter } from '../(marketing)/MarketingFooter';
import { LocaleProvider } from '../../lib/i18n';

const copy = PUBLIC_LOCALES.si;

export const metadata: Metadata = {
  title: { absolute: copy.seoTitle },
  description: copy.seoDescription,
  alternates: {
    canonical: 'https://gurudevi.app/si',
    languages: {
      en: 'https://gurudevi.app/',
      si: 'https://gurudevi.app/si',
      ta: 'https://gurudevi.app/ta',
      'x-default': 'https://gurudevi.app/',
    },
  },
  openGraph: {
    title: copy.seoTitle,
    description: copy.seoDescription,
    locale: 'si_LK',
    type: 'website',
  },
};

export default function SinhalaLandingPage() {
  return (
    <LocaleProvider initialLocale="si">
      <MarketingHeader />
      <MarketingClient />
      <MarketingFooter />
    </LocaleProvider>
  );
}
