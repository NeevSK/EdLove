import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllInnovations } from '../../lib/content/reader';

export const metadata: Metadata = {
  title: 'Global Educational Innovations (200) | EdLove Foundation',
  description:
    'A living empirical archive of 200 planetary educational technology innovations, local-first architectures, and gift-economy platforms.',
};

export default function InnovationsPage() {
  const innovations = getAllInnovations();

  // Unique tags
  const tags = Array.from(new Set(innovations.flatMap((entry) => entry.tags || [])))
    .sort()
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#111215] text-[#1a1714] dark:text-[#f5f2eb] font-serif selection:bg-[#a85022]/20 transition-colors duration-200">
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3 py-1 bg-[#fbf0e8] dark:bg-[#2d1e16] border border-[#f0d6c5] dark:border-[#4a2f20] rounded-full text-xs uppercase font-mono font-bold tracking-widest text-[#a85022] dark:text-[#f09b6e] transition-colors">
            Living Knowledge Archive • {innovations.length} Dossiers
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1a1714] dark:text-[#f5f2eb] transition-colors">
            Global Educational Innovations
          </h1>
          <p className="text-base sm:text-lg text-[#615951] dark:text-[#a39e95] leading-relaxed font-sans transition-colors">
            An empirical survey of 200 planetary educational breakthroughs across gift economies,
            local-first software, somatic technopedagogy, and open-source learning commons.
          </p>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-4 font-sans text-xs">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] text-[#615951] dark:text-[#a39e95] hover:border-[#a85022] dark:hover:border-[#f09b6e] transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* 200 Innovations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
          {innovations.map((item) => (
            <Link
              key={item.slug}
              href={`/innovations/${item.slug}`}
              className="p-6 rounded-2xl bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] hover:border-[#a85022]/60 dark:hover:border-[#f09b6e]/60 hover:shadow-md dark:hover:shadow-[#000000]/40 active:scale-[0.99] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#8e857b] dark:text-[#736d64] mb-2">
                  <span className="text-[#a85022] dark:text-[#f09b6e] font-semibold">
                    #{item.slug.slice(0, 3)}
                  </span>
                  <span>{item.readingTimeMinutes} min read</span>
                </div>

                <h3 className="font-serif font-bold text-lg text-[#1a1714] dark:text-[#f5f2eb] group-hover:text-[#a85022] dark:group-hover:text-[#f09b6e] transition-colors leading-snug">
                  {item.title}
                </h3>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#faf8f5] dark:bg-[#21242b] text-[#8e857b] dark:text-[#a39e95] border border-[#ebdccb] dark:border-[#292d36]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#ebdccb]/60 dark:border-[#292d36]/60 flex items-center justify-between text-xs text-[#8e857b] dark:text-[#736d64] transition-colors">
                <span className="font-mono">{item.author || 'EdLove Archive'}</span>
                <span className="font-semibold text-[#a85022] dark:text-[#f09b6e] group-hover:translate-x-0.5 transition-transform">
                  Read Dossier ➔
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
