import type { Metadata } from 'next';
import Link from 'next/link';
import { PUBLIC_LOCALES } from '../../lib/locales';

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
  openGraph: { title: copy.seoTitle, description: copy.seoDescription, locale: 'si_LK', type: 'website' },
};

export default function SinhalaLandingPage() {
  return (
    <main id="main-content" lang={copy.htmlLang} className="mx-auto min-h-screen max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <nav aria-label="භාෂාව / Language" className="mb-16 flex gap-5 font-sans text-sm">
        <Link href="/">English</Link><Link href="/si" aria-current="page">සිංහල</Link><Link href="/ta">தமிழ்</Link>
      </nav>
      <p className="font-sans text-sm font-semibold tracking-wide text-ink-soft">{copy.brand}</p>
      <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">{copy.tagline}</h1>
      <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">{copy.summary}</p>
      <p className="mt-8 max-w-3xl text-lg leading-8">ගුරුදේවි යනු අධ්‍යාපනයේ සම්බන්ධතා ශක්තිමත් කිරීමට සහ ගුරුවරුන්ගේ, සිසුන්ගේ සහ පාසල් ප්‍රජාවන්ගේ ගෞරවය රැකීමට නිර්මාණය කළ ඩිජිටල් වේදිකාවකි.</p>
      <Link className="mt-10 inline-block font-sans text-sm font-semibold underline underline-offset-4" href="/about">අධ්‍යාපනික පරිසරය ගැන කියවන්න ↗</Link>
    </main>
  );
}
