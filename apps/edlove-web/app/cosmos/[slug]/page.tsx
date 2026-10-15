import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCosmosEntries, getCosmosEntryBySlug } from '../../../lib/content/reader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = getAllCosmosEntries();
  return all.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getCosmosEntryBySlug(slug);
  if (!doc) return { title: 'Paradigm Not Found | The Paradigm Cosmos' };

  return {
    title: `${doc.frontmatter.title} | The Paradigm Cosmos`,
    description: doc.frontmatter.subtitle || 'The Paradigm Cosmos by EdLove Foundation.',
  };
}

export default async function CosmosDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getCosmosEntryBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0c1219] text-[#1a1714] dark:text-[#fffdf8] font-sans selection:bg-[#c99436]/30 transition-colors duration-200">
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16 space-y-12">
        <div className="mb-4">
          <Link
            href="/cosmos"
            className="text-xs font-semibold text-[#a85022] dark:text-[#c99436] hover:underline flex items-center gap-1.5 transition-colors"
          >
            <span>←</span>
            <span>Back to The Paradigm Cosmos</span>
          </Link>
        </div>

        <article className="space-y-8">
          <header className="space-y-4 border-b border-[#e5dec9] dark:border-white/10 pb-8 transition-colors">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-2xl">{doc.frontmatter.icon || '✦'}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#fbf0e8] dark:bg-white/10 text-[#a85022] dark:text-[#c99436] font-bold uppercase tracking-wider">
                {doc.frontmatter.origin || 'Ancient'}
              </span>
              <span className="text-[#8e857b] dark:text-white/40">
                {doc.readingTimeMinutes} min read
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[#1a1714] dark:text-white transition-colors">
              {doc.frontmatter.title}
            </h1>

            {doc.frontmatter.subtitle && (
              <p className="text-lg sm:text-xl text-[#615951] dark:text-white/70 italic font-serif leading-relaxed transition-colors">
                {doc.frontmatter.subtitle}
              </p>
            )}

            {doc.frontmatter.coreLogic && (
              <div className="p-4 rounded-xl bg-[#fffefb] dark:bg-white/[0.04] border border-[#e5dec9] dark:border-white/10 text-xs text-[#a85022] dark:text-[#c99436] font-mono transition-colors">
                <strong>Core logic:</strong> {doc.frontmatter.coreLogic}
              </div>
            )}
          </header>

          <div
            className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-[#1a1714]/90 dark:text-white/80 font-serif"
            dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
          />

          <footer className="pt-12 border-t border-[#e5dec9] dark:border-white/10 flex items-center justify-between text-xs text-[#8e857b] dark:text-white/50 transition-colors">
            <Link
              href="/cosmos"
              className="px-4 py-2 rounded-lg bg-[#fffefb] dark:bg-white/5 border border-[#e5dec9] dark:border-white/10 hover:border-[#a85022] dark:hover:border-[#c99436] text-[#a85022] dark:text-[#c99436] font-semibold active:scale-95 transition-all"
            >
              ← Back to Paradigm Cosmos
            </Link>
            <span className="font-mono">EdLove Foundation</span>
          </footer>
        </article>
      </main>
    </div>
  );
}
