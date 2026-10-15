import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllInnovations, getInnovationBySlug } from '../../../lib/content/reader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = getAllInnovations();
  return all.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getInnovationBySlug(slug);
  if (!doc) return { title: 'Innovation Not Found | EdLove' };

  return {
    title: `${doc.frontmatter.title} | EdLove Innovations`,
    description: `Empirical dossier for ${doc.frontmatter.title} archived in the EdLove planetary innovation repository.`,
  };
}

export default async function InnovationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getInnovationBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1714] font-serif selection:bg-[#a85022]/20">
      {/* Main Article Container */}
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-8">
          <Link
            href="/innovations"
            className="text-xs font-sans font-semibold text-[#a85022] hover:underline flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Back to 200 Innovations</span>
          </Link>
        </div>
        <article className="space-y-8">
          {/* Header */}
          <header className="space-y-4 border-b border-[#ebdccb] pb-8">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-[#fbf0e8] text-[#a85022] border border-[#f0d6c5] font-bold uppercase tracking-wider">
                Innovation Dossier
              </span>
              <span className="text-[#8e857b]">
                {doc.readingTimeMinutes} min read ({doc.wordCount} words)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1a1714] leading-[1.15]">
              {doc.frontmatter.title}
            </h1>

            {/* Provenance Colophon */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-[#615951] pt-2">
              <span>
                Author:{' '}
                {!doc.frontmatter.author || doc.frontmatter.author === 'Naveen' ? (
                  <a
                    href="https://neevsk.intuituilabs.studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#1a1714] hover:text-[#a85022] hover:underline transition-colors"
                  >
                    Naveen ↗
                  </a>
                ) : (
                  <strong className="text-[#1a1714]">{doc.frontmatter.author}</strong>
                )}
              </span>
              <span>•</span>
              <span>
                Scribe:{' '}
                <strong className="text-[#1a1714]">
                  {doc.frontmatter.scribe || 'Antigravity'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Updated:{' '}
                <span className="font-mono">{doc.frontmatter.updated || '2026-09-02'}</span>
              </span>
            </div>

            {/* Tags */}
            {doc.frontmatter.tags && doc.frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {doc.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-[#fffefb] border border-[#ebdccb] text-[#615951]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Rendered Semantic HTML Body */}
          <div
            className="prose prose-stone max-w-none text-base sm:text-lg leading-relaxed text-[#2c2723]"
            dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
          />

          {/* Footer Backlink */}
          <footer className="pt-12 border-t border-[#ebdccb] flex items-center justify-between font-sans text-xs text-[#615951]">
            <Link
              href="/innovations"
              className="px-4 py-2 rounded-lg bg-[#fffefb] border border-[#ebdccb] hover:border-[#a85022] font-semibold text-[#a85022] transition-colors"
            >
              ← Back to Innovation Index
            </Link>
            <span className="font-mono">EdLove Planetary Dossier Archive</span>
          </footer>
        </article>
      </main>
    </div>
  );
}
