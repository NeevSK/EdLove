import type { Metadata } from 'next';
import Link from 'next/link';
import { authors, getAuthor, journalEntries } from '../../content';

export function generateStaticParams() { return authors.map(({ id }) => ({ id })); }
export function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { return params.then(({ id }) => { const author = getAuthor(id); return { title: author ? `${author.displayName} | Gurudevi Journal` : 'Author | Gurudevi', description: author?.biography }; }); }

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const author = getAuthor((await params).id);
  if (!author) return <main id="main-content" className="mx-auto max-w-3xl px-4 py-24 sm:px-8"><h1 className="text-4xl">Author not found</h1><Link className="mt-6 inline-block text-lotus underline" href="/journal">Return to the journal</Link></main>;
  const entries = journalEntries.filter((entry) => entry.authorId === author.id);
  return <main id="main-content" className="mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-8 lg:px-16 lg:pt-28"><Link className="font-sans text-sm text-lotus underline underline-offset-4" href="/journal">← All journal entries</Link><header className="mt-10 max-w-3xl border-b border-line pb-10"><p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">Journal author</p><h1 className="mt-5 text-5xl font-medium tracking-[-0.06em] sm:text-7xl">{author.displayName}</h1><p className="mt-6 text-xl leading-9 text-ink-soft">{author.biography}</p><p className="mt-5 leading-7 text-ink-soft">{author.note}</p></header><section className="mt-14" aria-labelledby="author-work"><h2 id="author-work" className="text-3xl font-medium">Writing by {author.attributionName}</h2><div className="mt-8 grid gap-6 md:grid-cols-2">{entries.map((entry) => <article key={entry.slug} className="rounded-3xl border border-line bg-paper-light/60 p-7"><h3 className="text-2xl leading-tight"><Link className="hover:text-lotus" href={`/journal/${entry.slug}`}>{entry.title}</Link></h3><p className="mt-3 leading-relaxed text-ink-soft">{entry.subtitle}</p><p className="mt-5 font-sans text-sm text-lotus"><time dateTime={entry.publishDate}>{new Date(`${entry.publishDate}T00:00:00Z`).toLocaleDateString('en-GB')}</time></p></article>)}</div></section></main>;
}
