import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllLibraryEntries } from '../../lib/content/reader';

export const metadata: Metadata = {
  title: 'Pedagogical Library | EdLove Foundation',
  description:
    'Archived foundational pedagogical frameworks, diagnostic patterns, and living treatises on educational transformation.',
};

export default function PedagogyPage() {
  const entries = getAllLibraryEntries();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1714] font-serif selection:bg-[#a85022]/20">
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3 py-1 bg-[#fbf0e8] border border-[#f0d6c5] rounded-full text-xs uppercase font-mono font-bold tracking-widest text-[#a85022]">
            Perennial Archives • {entries.length} Works
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1a1714]">
            EdLove Pedagogical Library
          </h1>
          <p className="text-base sm:text-lg text-[#615951] leading-relaxed font-sans">
            Living treatises, thinkers, and somatic frameworks grounding learning as an
            impedance-matched resonance rather than an extractive market transaction.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {entries.map((entry) => (
            <Link
              key={entry.slug}
              href={`/pedagogy/${entry.slug}`}
              className="p-6 rounded-2xl bg-[#fffefb] border border-[#ebdccb] hover:border-[#a85022]/60 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#8e857b] mb-2">
                  <span className="uppercase text-[#a85022] font-semibold">{entry.category}</span>
                  <span>{entry.readingTimeMinutes} min read</span>
                </div>

                <h3 className="font-serif font-bold text-xl text-[#1a1714] group-hover:text-[#a85022] transition-colors">
                  {entry.title}
                </h3>

                {entry.subtitle && (
                  <p className="text-xs text-[#615951] italic mt-1 font-serif">{entry.subtitle}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#ebdccb]/60 flex items-center justify-between text-xs text-[#8e857b]">
                <span>{entry.author || 'EdLove Working Group'}</span>
                <span className="font-semibold text-[#a85022] group-hover:translate-x-0.5 transition-transform">
                  Read Work ➔
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
