import type { Metadata } from 'next';
import Link from 'next/link';
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  JsonLdScript,
} from '@/lib/schema-org';
import { absoluteUrl, SITE_NAME, SITE_URL } from '../../../../seo';
import { getJournalEntry, journalEntries } from '../../content';
import { JournalEntryClient } from './JournalEntryClient';

export function generateStaticParams() {
  return journalEntries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getJournalEntry(slug);

  if (!entry) {
    return {
      title: 'Journal Entry Not Found | Gurudevi',
    };
  }

  const canonicalUrl = absoluteUrl(`/journal/${entry.slug}`);
  const publishIso = `${entry.publishDate}T00:00:00Z`;

  return {
    title: `${entry.title} | Gurudevi Journal`,
    description: entry.subtitle,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${entry.title} | Gurudevi Journal`,
      description: entry.subtitle,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: publishIso,
      authors: [entry.author],
      tags: entry.topics,
      locale: entry.language === 'en' ? 'en_LK' : entry.language === 'si' ? 'si_LK' : 'ta_LK',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${entry.title} | Gurudevi Journal`,
      description: entry.subtitle,
    },
  };
}

export default async function JournalEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getJournalEntry(slug);

  if (!entry) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-24 sm:px-8">
        <h1 className="text-4xl">Journal entry not found</h1>
        <Link className="mt-6 inline-block text-lotus underline" href="/journal">
          Return to the journal
        </Link>
      </main>
    );
  }

  const canonicalUrl = absoluteUrl(`/journal/${entry.slug}`);
  const articleJsonLd = generateArticleJsonLd(entry, canonicalUrl);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: SITE_URL },
    { name: 'Journal', url: absoluteUrl('/journal') },
    { name: entry.title, url: canonicalUrl },
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 pb-24 pt-20 sm:px-8 lg:pt-28">
      {/* Schema.org Structured Data */}
      <JsonLdScript data={articleJsonLd} />
      <JsonLdScript data={breadcrumbJsonLd} />

      <JournalEntryClient entry={entry} />
    </main>
  );
}
