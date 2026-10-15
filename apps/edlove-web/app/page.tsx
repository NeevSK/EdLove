import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EdLove Foundation | Reimagining Education, With Love',
  description:
    'EdLove is the educational transformation ecosystem connecting philosophy, global innovations, pedagogical canon, field research, and sovereign learning tools.',
};

export default function EdLoveHomePage() {
  return (
    <main className="space-y-24 py-12 sm:py-20">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 text-center space-y-8 animate-fade-in">
        <div className="inline-block px-4 py-1.5 bg-[#fbf0e8] dark:bg-[#2d1e16] border border-[#f0d6c5] dark:border-[#4a2f20] rounded-full text-xs uppercase font-mono font-bold tracking-widest text-[#a85022] dark:text-[#f09b6e] transition-colors">
          🕊️ The Educational Transformation Ecosystem
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl sm:text-8xl font-serif font-bold text-[#1a1714] dark:text-[#f5f2eb] tracking-tight leading-none transition-colors">
            EdLove
          </h1>
          <p className="font-serif italic text-2xl sm:text-4xl text-[#615951] dark:text-[#a39e95] max-w-2xl mx-auto leading-snug transition-colors">
            Reimagining Education,{' '}
            <span className="text-[#a85022] dark:text-[#f09b6e] font-bold not-italic">
              With Love.
            </span>
          </p>
        </div>

        <p className="font-sans text-base sm:text-lg text-[#615951] dark:text-[#a39e95] max-w-2xl mx-auto leading-relaxed transition-colors">
          We treat learning not as an extractive market commodity or factory compliance loop, but as
          a relational sanctuary honoring teacher dignity, learner sovereignty, and ecological
          resonance.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-sans text-xs font-bold uppercase tracking-wider">
          <Link
            href="/cosmos"
            className="px-8 py-3.5 rounded-full bg-[#1a1714] dark:bg-[#f5f2eb] text-[#fffefb] dark:text-[#111215] hover:bg-[#332e29] dark:hover:bg-white active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
          >
            Enter Cosmos ➔
          </Link>
          <Link
            href="/focus"
            className="px-8 py-3.5 rounded-full bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] text-[#1a1714] dark:text-[#f5f2eb] hover:border-[#a85022] dark:hover:border-[#f09b6e] active:scale-[0.98] transition-all shadow-xs"
          >
            Our Focus
          </Link>
          <Link
            href="/vision"
            className="px-8 py-3.5 rounded-full bg-transparent text-[#615951] dark:text-[#a39e95] hover:text-[#1a1714] dark:hover:text-[#f5f2eb] active:scale-[0.98] transition-colors"
          >
            Our Vision
          </Link>
        </div>
      </section>

      {/* The 4 Foundation Gateways */}
      <section className="max-w-6xl mx-auto px-6 space-y-8 font-sans">
        <div className="border-b border-[#ebdccb] dark:border-[#292d36] pb-4 flex items-center justify-between transition-colors">
          <h2 className="font-serif text-2xl font-bold text-[#1a1714] dark:text-[#f5f2eb]">
            Foundation Gateways
          </h2>
          <span className="text-xs uppercase font-mono text-[#8e857b] dark:text-[#736d64]">
            Epistemic Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Research Archive */}
          <Link
            href="/research"
            className="p-6 rounded-2xl bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] hover:border-[#a85022]/60 dark:hover:border-[#f09b6e]/60 hover:shadow-md dark:hover:shadow-[#000000]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <span className="text-3xl">🔬</span>
              <h3 className="font-serif font-bold text-xl text-[#1a1714] dark:text-[#f5f2eb] group-hover:text-[#a85022] dark:group-hover:text-[#f09b6e] transition-colors">
                Research Archive
              </h3>
              <p className="text-xs text-[#615951] dark:text-[#a39e95] leading-relaxed">
                4 Canonical Research Clusters and 8 empirical field monographs unpacking
                student-teacher ratios, shadow education, and macroeconomic audits.
              </p>
            </div>
            <span className="mt-6 text-xs font-bold text-[#a85022] dark:text-[#f09b6e] group-hover:translate-x-1 transition-transform">
              Explore Research ➔
            </span>
          </Link>

          {/* 200 Global Innovations */}
          <Link
            href="/innovations"
            className="p-6 rounded-2xl bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] hover:border-[#a85022]/60 dark:hover:border-[#f09b6e]/60 hover:shadow-md dark:hover:shadow-[#000000]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <span className="text-3xl">💡</span>
              <h3 className="font-serif font-bold text-xl text-[#1a1714] dark:text-[#f5f2eb] group-hover:text-[#a85022] dark:group-hover:text-[#f09b6e] transition-colors">
                Innovations (200)
              </h3>
              <p className="text-xs text-[#615951] dark:text-[#a39e95] leading-relaxed">
                Comprehensive worldwide catalog of 200 grassroots, open-source, and decolonial
                educational innovations from Scandinavia to the Global South.
              </p>
            </div>
            <span className="mt-6 text-xs font-bold text-[#a85022] dark:text-[#f09b6e] group-hover:translate-x-1 transition-transform">
              Browse 200 Dossiers ➔
            </span>
          </Link>

          {/* Pedagogical Library */}
          <Link
            href="/pedagogy"
            className="p-6 rounded-2xl bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] hover:border-[#a85022]/60 dark:hover:border-[#f09b6e]/60 hover:shadow-md dark:hover:shadow-[#000000]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <span className="text-3xl">📜</span>
              <h3 className="font-serif font-bold text-xl text-[#1a1714] dark:text-[#f5f2eb] group-hover:text-[#a85022] dark:group-hover:text-[#f09b6e] transition-colors">
                Pedagogical Library
              </h3>
              <p className="text-xs text-[#615951] dark:text-[#a39e95] leading-relaxed">
                Foundational thinkers (Freire, Montessori) and the living treatise on Teaning:
                dissolving the false binary of teaching and learning.
              </p>
            </div>
            <span className="mt-6 text-xs font-bold text-[#a85022] dark:text-[#f09b6e] group-hover:translate-x-1 transition-transform">
              Read Perennial Canon ➔
            </span>
          </Link>

          {/* Urumaya Atlas */}
          <Link
            href="/atlas"
            className="p-6 rounded-2xl bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] hover:border-[#a85022]/60 dark:hover:border-[#f09b6e]/60 hover:shadow-md dark:hover:shadow-[#000000]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <span className="text-3xl">🗺️</span>
              <h3 className="font-serif font-bold text-xl text-[#1a1714] dark:text-[#f5f2eb] group-hover:text-[#a85022] dark:group-hover:text-[#f09b6e] transition-colors">
                Urumaya Atlas
              </h3>
              <p className="text-xs text-[#615951] dark:text-[#a39e95] leading-relaxed">
                The living civic atlas mapping all 10,155 Sri Lankan schools, tertiary universities,
                vocational institutes, and regional resource distribution.
              </p>
            </div>
            <span className="mt-6 text-xs font-bold text-[#a85022] dark:text-[#f09b6e] group-hover:translate-x-1 transition-transform">
              Open Live Atlas ➔
            </span>
          </Link>
        </div>
      </section>

      {/* Ecosystem Manifestation: Gurudevi Sanctuary Bridge */}
      <section className="max-w-6xl mx-auto px-6 font-sans">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] flex flex-col md:flex-row items-center justify-between gap-8 transition-colors">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-block px-3 py-1 bg-[#1a1714] dark:bg-[#f5f2eb] text-white dark:text-[#111215] rounded-full text-[10px] font-mono uppercase font-bold tracking-widest transition-colors">
              Living Digital Instrument
            </div>
            <h3 className="font-serif text-3xl font-bold text-[#1a1714] dark:text-[#f5f2eb] transition-colors">
              Gurudevi: A Digital Sanctuary for Educators
            </h3>
            <p className="text-sm text-[#615951] dark:text-[#a39e95] leading-relaxed transition-colors">
              EdLove Foundation holds the research, philosophy, and public commons; Gurudevi is our
              dedicated software instrument—an offline-first, zero-surveillance sanctuary designed
              to give energy back to teachers.
            </p>
          </div>
          <a
            href="https://sanctuary.gurudevi.app"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-8 py-4 rounded-full bg-[#a85022] dark:bg-[#e07a43] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#8c3f17] dark:hover:bg-[#f08d59] active:scale-[0.98] transition-all shadow-md"
          >
            Open Gurudevi Sanctuary ↗
          </a>
        </div>
      </section>
    </main>
  );
}
