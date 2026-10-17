import type { Metadata } from 'next';
import Link from 'next/link';
import { getJournalEntry, journalEntries } from '../../content';

export function generateStaticParams() {
  return journalEntries.map(({ slug }) => ({ slug }));
}
export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const entry = getJournalEntry(slug);
    return {
      title: entry ? `${entry.title} | Gurudevi Journal` : 'Journal | Gurudevi',
      description: entry?.subtitle,
    };
  });
}

export default async function JournalEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getJournalEntry((await params).slug);
  if (!entry)
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-24 sm:px-8">
        <h1 className="text-4xl">Journal entry not found</h1>
        <Link className="mt-6 inline-block text-lotus underline" href="/journal">
          Return to the journal
        </Link>
      </main>
    );
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 pb-24 pt-20 sm:px-8 lg:pt-28">
      <Link className="font-sans text-sm text-lotus underline underline-offset-4" href="/journal">
        ← All journal entries
      </Link>
      <header className="mt-10 border-b border-line pb-10">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          {entry.contentKind} · {entry.readingTime} min read
        </p>
        <h1 className="mt-5 text-5xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-6xl">
          {entry.title}
        </h1>
        <p className="mt-6 text-xl leading-9 text-ink-soft">{entry.subtitle}</p>
        <p className="mt-6 font-sans text-sm text-ink-soft">
          By{' '}
          <Link className="text-lotus underline" href={`/authors/${entry.authorId}`}>
            {entry.author}
          </Link>{' '}
          ·{' '}
          <time dateTime={entry.publishDate}>
            {new Date(`${entry.publishDate}T00:00:00Z`).toLocaleDateString('en-GB')}
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
        Published under {entry.license}.
        {entry.source && (
          <>
            {' '}
            Source:{' '}
            <a className="text-lotus underline" href={entry.source} rel="noreferrer">
              original publication
            </a>
            .
          </>
        )}
      </footer>
    </main>
  );
}
