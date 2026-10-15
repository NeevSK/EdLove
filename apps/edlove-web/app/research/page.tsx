import type { Metadata } from 'next';
import Link from 'next/link';
import { CANONICAL_RESEARCH_MONOGRAPHS } from '../../lib/content/reader';

export const metadata: Metadata = {
  title: 'Education Research & Epistemic Diagnostics | EdLove Foundation',
  description:
    'Foundational research monographs, systemic field chronicles, bodily pedagogy frameworks, and macroeconomic audits by EdLove Foundation.',
};

export default function ResearchPage() {
  const clusters = [
    {
      id: 'institutional-macro',
      number: '01',
      badge: 'Systemic Diagnostics',
      title: 'Institutional School Systems & Macroeconomic Audits',
      subtitle:
        'Unpacking the 10,000-school apparatus, the Rs. 122B shadow tuition economy, and structural funding dualisms.',
      icon: '🏛️',
      papers: CANONICAL_RESEARCH_MONOGRAPHS.filter((m) => m.cluster.includes('Institutional')),
    },
    {
      id: 'pedagogy-somatic',
      number: '02',
      badge: 'Embodied Learning',
      title: 'Bodily Pedagogy & Triadic Processual Learning Theory',
      subtitle:
        'Reclaiming the physical, vocal, and relational substrate of human cognition beyond Cartesian extraction.',
      icon: '🌱',
      papers: CANONICAL_RESEARCH_MONOGRAPHS.filter((m) => m.cluster.includes('Bodily')),
    },
    {
      id: 'teacher-wellbeing',
      number: '03',
      badge: 'Educator Sovereignty',
      title: 'Teacher Wellbeing, Occupational Stress & Relational Dyads',
      subtitle:
        'Examining the educator not as a bureaucratic delivery pipe, but as the living emotional anchor of childhood.',
      icon: '✨',
      papers: CANONICAL_RESEARCH_MONOGRAPHS.filter((m) => m.cluster.includes('Teacher')),
    },
    {
      id: 'metaresearch',
      number: '04',
      badge: 'Epistemic Rigor',
      title: 'Metaresearch & Epistemic Diagnostics',
      subtitle:
        'Auditing Sri Lankan educational research mechanisms, epistemic biases, and cybernetic feedback loops.',
      icon: '🔍',
      papers: CANONICAL_RESEARCH_MONOGRAPHS.filter((m) => m.cluster.includes('Metaresearch')),
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#111215] text-[#1a1714] dark:text-[#f5f2eb] selection:bg-[#a85022]/20 font-serif transition-colors duration-200">
      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-16 space-y-16">
        {/* Header Hero */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3 py-1 bg-[#fbf0e8] dark:bg-[#2d1e16] border border-[#f0d6c5] dark:border-[#4a2f20] rounded-full text-xs uppercase font-mono font-bold tracking-widest text-[#a85022] dark:text-[#f09b6e] transition-colors">
            EdLove Foundation • Research Archive
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1a1714] dark:text-[#f5f2eb] transition-colors">
            Education Research &amp; Epistemic Diagnostics
          </h1>
          <blockquote className="text-lg sm:text-xl text-[#615951] dark:text-[#a39e95] italic leading-relaxed pt-2 transition-colors">
            &quot;Education cannot be transformed through sentimental slogans or bureaucratic
            cosmetic reform. It requires fearless diagnostics, ontological honesty, and empirical
            ground-truthing.&quot;
          </blockquote>

          <div className="pt-2 text-xs font-mono text-[#8e857b] dark:text-[#736d64]">
            EdLove Research &amp; Field Observation Group • Updated Oct 10, 2026 • Grounded from{' '}
            <code className="bg-[#f5eee1] dark:bg-[#21242b] px-1.5 py-0.5 rounded text-[#a85022] dark:text-[#f09b6e]">
              E:\edresearch
            </code>
          </div>
        </header>

        {/* The EdLove Foundation Architecture Card */}
        <section className="p-8 rounded-3xl bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] shadow-xs transition-colors">
          <div className="flex items-center gap-2 mb-2 text-[#a85022] dark:text-[#f09b6e] font-bold text-xs uppercase tracking-widest font-mono">
            <span>🏛️</span>
            <span>Foundation Architecture</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a1714] dark:text-[#f5f2eb]">
            The EdLove Foundation (edlove.org)
          </h2>
          <p className="text-sm text-[#615951] dark:text-[#a39e95] mt-1.5 leading-relaxed font-sans">
            <strong>EdLove Foundation</strong> is the umbrella civic foundation and epistemic anchor
            holding three interconnected pillars:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-xs font-sans">
            <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-[#21242b] border border-[#ebdccb] dark:border-[#292d36] transition-colors">
              <span className="font-bold text-sm text-[#1a1714] dark:text-[#f5f2eb] block mb-1">
                1. Research &amp; Epistemic Core
              </span>
              <p className="text-[#615951] dark:text-[#a39e95] leading-relaxed">
                Housed here: Foundational research monographs, bodily pedagogy models, teacher
                wellbeing studies, and policy audits.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-[#21242b] border border-[#ebdccb] dark:border-[#292d36] transition-colors">
              <span className="font-bold text-sm text-[#1a1714] dark:text-[#f5f2eb] block mb-1">
                2. Gurudevi Digital Sanctuary
              </span>
              <p className="text-[#615951] dark:text-[#a39e95] leading-relaxed">
                The lived software application and mobile sanctuary for teachers, classrooms, and
                learners held by EdLove.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-[#21242b] border border-[#ebdccb] dark:border-[#292d36] transition-colors">
              <span className="font-bold text-sm text-[#1a1714] dark:text-[#f5f2eb] block mb-1">
                3. Charity &amp; Solidarity Care Flow
              </span>
              <p className="text-[#615951] dark:text-[#a39e95] leading-relaxed">
                Future direct-to-need student sponsorships, material support, teacher relief funds,
                and philanthropic endowments.
              </p>
            </div>
          </div>
        </section>

        {/* Urumaya Atlas Manifestation Card */}
        <section className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#1a1714] to-[#2c241e] dark:from-[#181a1f] dark:to-[#121316] border border-transparent dark:border-[#292d36] text-white shadow-lg relative overflow-hidden transition-colors">
          <div className="relative z-10 space-y-4">
            <div className="inline-block px-3 py-1 bg-[#a85022]/30 border border-[#a85022]/50 rounded-full text-[10px] uppercase font-mono font-bold tracking-widest text-[#f5c796]">
              Contextual Empirical Manifestation • Sri Lanka
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              The Sri Lanka Education Atlas (&quot;Urumaya&quot;)
            </h2>
            <p className="text-sm md:text-base text-white/80 leading-relaxed font-sans max-w-2xl">
              <strong>Urumaya</strong> is EdLove&apos;s empirical civic intelligence manifestation
              in Sri Lanka. It maps 9,962 public schools, audits multi-year census drift (19,924
              snapshots), surfaces the School Development Society (SDS) shadow treasury inversion,
              and exposes stark national disparities in sports and aesthetic specialist teachers.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/atlas"
                className="px-6 py-2.5 rounded-full bg-[#a85022] hover:bg-[#824112] text-white font-sans font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Explore Urumaya Spatial Atlas</span>
                <span>➔</span>
              </Link>
              <span className="text-xs font-mono text-white/50">
                9,962 Schools • 100% Geocoded • Public &amp; Provincial Budgets
              </span>
            </div>
          </div>
        </section>

        {/* The 4 Research Clusters */}
        <section className="space-y-16">
          <div className="border-b border-[#ebdccb] dark:border-[#292d36] pb-4 transition-colors">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1714] dark:text-[#f5f2eb]">
              Canonical Research Clusters ({clusters.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#615951] dark:text-[#a39e95] font-sans mt-1">
              Archived from the E:\edresearch substrate, authored by Neev Edirisuriya and the EdLove
              Field Observation Group.
            </p>
          </div>

          {clusters.map((cluster) => (
            <article key={cluster.id} id={cluster.id} className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#ebdccb]/60 dark:border-[#292d36]/60 pb-3 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#a85022] dark:text-[#f09b6e]">
                      {cluster.number}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#fbf0e8] dark:bg-[#2d1e16] text-[#a85022] dark:text-[#f09b6e] border border-[#f0d6c5] dark:border-[#4a2f20] transition-colors">
                      {cluster.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1714] dark:text-[#f5f2eb] flex items-center gap-2">
                    <span>{cluster.icon}</span>
                    <span>{cluster.title}</span>
                  </h3>
                  <p className="text-xs text-[#615951] dark:text-[#a39e95] font-sans mt-1">
                    {cluster.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {cluster.papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="p-6 rounded-2xl bg-[#fffefb] dark:bg-[#181a1f] border border-[#ebdccb] dark:border-[#292d36] hover:border-[#a85022]/60 dark:hover:border-[#f09b6e]/60 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                        <span className="font-mono text-[10px] text-[#8e857b] dark:text-[#736d64]">
                          {paper.id}
                        </span>
                        <span className="font-mono font-bold text-[#a85022] dark:text-[#f09b6e]">
                          {paper.author} • {paper.year}
                        </span>
                      </div>

                      <h4 className="font-bold text-lg text-[#1a1714] dark:text-[#f5f2eb] leading-snug">
                        {paper.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-[#615951] dark:text-[#a39e95] font-sans mt-2 leading-relaxed">
                        {paper.summary}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5 font-sans">
                        {paper.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#faf8f5] dark:bg-[#21242b] border border-[#ebdccb] dark:border-[#292d36] text-[#615951] dark:text-[#a39e95]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#ebdccb]/60 dark:border-[#292d36]/60 flex items-center justify-between text-xs text-[#8e857b] dark:text-[#736d64] font-mono transition-colors">
                      <span className="truncate max-w-md">Vault: {paper.localUri}</span>
                      <span className="font-sans font-semibold text-[#a85022] dark:text-[#f09b6e]">
                        Archived
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
