import type { Metadata } from 'next';
import Link from 'next/link';
import { journalEntries } from '../content';

export const metadata: Metadata = { title: 'Journal | Gurudevi', description: 'Stories, practice notes, and reflections for the people who make learning possible.' };

export default function JournalPage() {
  const entries = [...journalEntries].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return <main id="main-content" className="mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-8 lg:px-16 lg:pt-28">
    <header className="max-w-3xl"><p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">Gurudevi Journal</p><h1 className="mt-5 text-5xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-7xl">Notes from an education ecology.</h1><p className="mt-8 text-xl leading-9 text-ink-soft">Stories, practice notes, and reflections for the people who make learning possible.</p></header>
    <section className="mt-16 grid gap-6 md:grid-cols-2" aria-label="Journal articles">
      {entries.map((entry) => <article key={entry.slug} className="rounded-3xl border border-line bg-paper-light/60 p-7 transition hover:-translate-y-1 hover:border-lotus/50"><div className="flex gap-3 font-sans text-xs uppercase tracking-[0.18em] text-lotus"><span>{entry.language}</span><time dateTime={entry.publishDate}>{new Date(`${entry.publishDate}T00:00:00Z`).toLocaleDateString('en-GB')}</time></div><h2 className="mt-4 text-3xl leading-tight"><Link className="hover:text-lotus" href={`/journal/${entry.slug}`}>{entry.title}</Link></h2><p className="mt-3 leading-relaxed text-ink-soft">{entry.subtitle}</p><p className="mt-6 text-sm font-semibold text-lotus">Read the journal entry <span aria-hidden="true">↗</span></p></article>)}
    </section>
  </main>;
}
