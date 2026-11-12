'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import type { EditorialJournalEntry } from '../../content';

export function JournalEntryClient({ entry }: { readonly entry: EditorialJournalEntry }) {
  const { t, locale } = useTranslation();

  return (
    <>
      <Link className="font-sans text-sm text-lotus underline underline-offset-4" href="/journal">
        {t('journal.allEntries')}
      </Link>
      <header className="mt-10 border-b border-line pb-10">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          {entry.contentKind} · {t('journal.minRead', { count: entry.readingTime ?? 5 })}
        </p>
        <h1 className="mt-5 text-5xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-6xl">
          {entry.title}
        </h1>
        <p className="mt-6 text-xl leading-9 text-ink-soft">{entry.subtitle}</p>
        <p className="mt-6 font-sans text-sm text-ink-soft">
          {t('journal.byAuthor')}{' '}
          <Link className="text-lotus underline" href={`/authors/${entry.authorId}`}>
            {entry.author}
          </Link>{' '}
          ·{' '}
          <time dateTime={entry.publishDate}>
            {new Date(`${entry.publishDate}T00:00:00Z`).toLocaleDateString(
              locale === 'si' ? 'si-LK' : locale === 'ta' ? 'ta-LK' : 'en-GB',
            )}
          </time>
        </p>
      </header>
      <article className="mt-12 text-lg leading-8 text-ink-soft">
        <p className="sr-only">Article contents</p>
        {entry.sections.map((section) => (
          <section key={section.heading ?? 'introduction'} className="mb-10">
            {section.heading && (
              <h2 className="mb-4 text-3xl font-medium leading-tight tracking-[-0.03em] text-ink">
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((paragraph) => (
              <p className="mb-5" key={paragraph}>
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mb-5 list-disc space-y-3 pl-6">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
      <footer className="mt-12 border-t border-line pt-6 text-sm text-ink-soft">
        {t('journal.publishedUnder')} {entry.license}.
        {entry.source && (
          <>
            {' '}
            {t('journal.source')}:{' '}
            <a className="text-lotus underline" href={entry.source} rel="noreferrer">
              original publication
            </a>
            .
          </>
        )}
      </footer>
    </>
  );
}
