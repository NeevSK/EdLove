import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCosmosEntries } from '../../lib/content/reader';

export const metadata: Metadata = {
  title: 'The Paradigm Cosmos | EdLove Foundation',
  description:
    'Mapping constellations of how learning happens, from the factory floor to the forest floor.',
};

export default function CosmosPage() {
  const entries = getAllCosmosEntries();

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0c1219] text-[#1a1714] dark:text-[#fffdf8] font-sans selection:bg-[#c99436]/30 transition-colors duration-200">
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3 py-1 bg-[#fbf0e8] dark:bg-white/5 border border-[#ebdccb] dark:border-white/10 rounded-full text-xs uppercase font-mono font-bold tracking-widest text-[#a85022] dark:text-[#c99436] transition-colors">
            Domain I: The Infinite Stream
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-[#1a1714] dark:text-white transition-colors">
            The Paradigm Cosmos
          </h1>
          <p className="text-lg sm:text-xl text-[#615951] dark:text-white/70 italic leading-relaxed font-serif max-w-2xl mx-auto transition-colors">
            &ldquo;We map the constellations of how learning happens. From the factory floor to the
            forest floor.&rdquo;
          </p>
        </header>

        {/* Timeline / Paradigm Journey */}
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <Link
              key={entry.slug}
              href={`/cosmos/${entry.slug}`}
              className="block p-8 rounded-2xl bg-[#fffefb] dark:bg-[#131d27]/70 border border-[#e5dec9] dark:border-white/10 hover:border-[#c99436] dark:hover:border-[#c99436]/60 hover:shadow-lg dark:hover:shadow-[#000000]/40 active:scale-[0.99] transition-all group"
            >
              <div className="grid md:grid-cols-[1fr_3fr] gap-6 items-start">
                <div className="space-y-1 border-b md:border-b-0 md:border-r border-[#ebdccb] dark:border-white/10 pb-4 md:pb-0 md:pr-6 transition-colors">
                  <span className="text-3xl block mb-2">{entry.icon || '✦'}</span>
                  <div className="text-xs font-mono uppercase tracking-widest text-[#a85022] dark:text-[#c99436] font-bold">
                    {entry.origin || `Epoch ${index + 1}`}
                  </div>
                  <div className="text-xs text-[#8e857b] dark:text-white/50">
                    {entry.readingTimeMinutes} min read
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-2xl text-[#1a1714] dark:text-white group-hover:text-[#a85022] dark:group-hover:text-[#c99436] transition-colors flex items-center justify-between">
                    <span>{entry.title}</span>
                    <span className="text-sm font-sans text-[#8e857b] dark:text-white/40 group-hover:text-[#a85022] dark:group-hover:text-[#c99436] group-hover:translate-x-1 transition-all">
                      Explore ➔
                    </span>
                  </h3>
                  {entry.subtitle && (
                    <p className="text-sm text-[#615951] dark:text-white/70 italic font-serif leading-relaxed">
                      {entry.subtitle}
                    </p>
                  )}
                  {entry.coreLogic && (
                    <div className="p-3 rounded-xl bg-[#faf7f2] dark:bg-white/[0.04] border border-[#ebdccb] dark:border-white/10 text-xs text-[#615951] dark:text-white/60 font-mono mt-3">
                      <strong className="text-[#a85022] dark:text-[#c99436]">Core logic:</strong>{' '}
                      {entry.coreLogic}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
