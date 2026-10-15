import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllLibraryEntries, getLibraryEntryBySlug } from '../../../lib/content/reader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = getAllLibraryEntries();
  return all.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLibraryEntryBySlug(slug);
  if (!doc) return { title: 'Work Not Found | EdLove Pedagogical Library' };

  return {
    title: `${doc.frontmatter.title} | EdLove Pedagogical Library`,
    description: doc.frontmatter.subtitle || 'Archived in the EdLove Pedagogical Library.',
  };
}

export default async function PedagogyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getLibraryEntryBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1714] font-serif selection:bg-[#a85022]/20">
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-8">
          <Link
            href="/pedagogy"
            className="text-xs font-sans font-semibold text-[#a85022] hover:underline flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Back to Pedagogical Library</span>
          </Link>
        </div>
        <article className="space-y-8">
          <header className="space-y-3 border-b border-[#ebdccb] pb-8">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-[#fbf0e8] text-[#a85022] border border-[#f0d6c5] font-bold uppercase tracking-wider">
                {doc.frontmatter.category || 'Framework'}
              </span>
              <span className="text-[#8e857b]">{doc.readingTimeMinutes} min read</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1a1714]">
              {doc.frontmatter.title}
            </h1>

            {doc.frontmatter.subtitle && (
              <p className="text-lg sm:text-xl text-[#615951] italic leading-relaxed">
                {doc.frontmatter.subtitle}
              </p>
            )}

            <div className="pt-2 text-xs font-sans text-[#8e857b] flex items-center gap-2">
              <span>
                Author:{' '}
                <strong className="text-[#1a1714]">{doc.frontmatter.author || 'EdLove'}</strong>
              </span>
              <span>•</span>
              <span>
                Cadence: <strong className="text-[#1a1714]">Living Document</strong>
              </span>
            </div>
          </header>

          <div
            className="prose prose-stone max-w-none text-base sm:text-lg leading-relaxed text-[#2c2723]"
            dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
          />

          <footer className="pt-12 border-t border-[#ebdccb] flex items-center justify-between font-sans text-xs text-[#615951]">
            <Link
              href="/pedagogy"
              className="px-4 py-2 rounded-lg bg-[#fffefb] border border-[#ebdccb] hover:border-[#a85022] font-semibold text-[#a85022] transition-colors"
            >
              ← Back to Pedagogical Library
            </Link>
            <span className="font-mono">EdLove Pedagogical Archive</span>
          </footer>
        </article>
      </main>
    </div>
  );
}
