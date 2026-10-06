import type { Metadata } from 'next';
import Link from 'next/link';
import { PUBLIC_LOCALES } from '../../lib/locales';

const copy = PUBLIC_LOCALES.ta;

export const metadata: Metadata = {
  title: { absolute: copy.seoTitle },
  description: copy.seoDescription,
  alternates: {
    canonical: 'https://gurudevi.app/ta',
    languages: {
      en: 'https://gurudevi.app/',
      si: 'https://gurudevi.app/si',
      ta: 'https://gurudevi.app/ta',
      'x-default': 'https://gurudevi.app/',
    },
  },
  openGraph: { title: copy.seoTitle, description: copy.seoDescription, locale: 'ta_LK', type: 'website' },
};

export default function TamilLandingPage() {
  return (
    <main id="main-content" lang={copy.htmlLang} className="mx-auto min-h-screen max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <nav aria-label="மொழி / Language" className="mb-16 flex gap-5 font-sans text-sm">
        <Link href="/">English</Link><Link href="/si">සිංහල</Link><Link href="/ta" aria-current="page">தமிழ்</Link>
      </nav>
      <p className="font-sans text-sm font-semibold tracking-wide text-ink-soft">{copy.brand}</p>
      <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">{copy.tagline}</h1>
      <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">{copy.summary}</p>
      <p className="mt-8 max-w-3xl text-lg leading-8">குருதேவி என்பது கல்விச் சூழலில் உள்ள உறவுகளை வலுப்படுத்தவும், ஆசிரியர்கள், மாணவர்கள் மற்றும் பள்ளிச் சமூகங்களின் கண்ணியத்தைப் பேணவும் உருவாக்கப்பட்ட ஒரு டிஜிட்டல் தளமாகும்.</p>
      <Link className="mt-10 inline-block font-sans text-sm font-semibold underline underline-offset-4" href="/about">கல்விச் சூழலமைப்பைப் பற்றி அறியுங்கள் ↗</Link>
    </main>
  );
}
