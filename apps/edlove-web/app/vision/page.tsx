import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Vision | EdLove Foundation',
  description:
    'The Architecture of Educational Sanctuary: Reimagining human learning from extraction to ecological resonance.',
};

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1714] font-serif selection:bg-[#a85022]/20">
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-20 space-y-16">
        <header className="text-center space-y-4">
          <div className="inline-block px-3 py-1 bg-[#fbf0e8] border border-[#f0d6c5] rounded-full text-xs uppercase font-mono font-bold tracking-widest text-[#a85022]">
            Foundational Philosophical Canon
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1a1714]">
            The Architecture of Educational Sanctuary
          </h1>
          <p className="text-xl sm:text-2xl text-[#615951] italic leading-relaxed max-w-2xl mx-auto">
            Reimagining human learning from Cartesian extraction to ecological resonance.
          </p>
          <div className="pt-2 text-xs font-mono text-[#8e857b]">
            Authored by Naveen • Scribe: Antigravity • Canon v1.0 • Perennial Cadence
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1a1714] border-b border-[#ebdccb] pb-2">
              The Genesis
            </h2>
            <p className="text-base text-[#423c35] leading-relaxed font-sans">
              EdLove was born from a simple yet profound realization: that for education to truly
              transform, it must be rooted in love, sovereignty, and aesthetic excellence. Market
              metrics and surveillance scorecards measure throughput, but they cannot cultivate the
              human soul.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1a1714] border-b border-[#ebdccb] pb-2">
              The Mission
            </h2>
            <p className="text-base text-[#423c35] leading-relaxed font-sans">
              We stand for the dignity of the teacher and the sovereignty of the learner. In an era
              of relentless algorithmic standardization, we choose the intimacy of the sanctuary
              over the bureaucratic efficiency of the factory.
            </p>
          </div>
        </section>

        <section className="p-8 md:p-10 rounded-3xl bg-[#fffefb] border border-[#ebdccb] shadow-xs text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#1a1714]">
            Digital Sanctuaries as Living Forests
          </h2>
          <p className="text-lg text-[#615951] italic leading-relaxed max-w-2xl mx-auto">
            We use high-aesthetic craft and soulful technology to build spaces that feel like the
            forest—organic, breathing, and deep. EdLove is more than a platform; it is a covenant
            with the sacred nature of learning.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs font-sans">
            <Link
              href="/research"
              className="px-5 py-2.5 rounded-full bg-[#a85022] hover:bg-[#824112] text-white font-bold transition-all shadow-xs"
            >
              Explore Education Research ➔
            </Link>
            <Link
              href="/atlas"
              className="px-5 py-2.5 rounded-full bg-[#faf8f5] hover:bg-[#f5eee1] border border-[#ebdccb] text-[#1a1714] font-semibold transition-all"
            >
              Explore Urumaya Atlas ➔
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
