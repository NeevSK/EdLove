import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'The Ecology & Philosophy' };

const principles = [
  [
    '01',
    'Support before extraction',
    'Every tool returns more energy and clarity than it takes from educators and learners.',
  ],
  [
    '02',
    'Different views, shared dignity',
    'Teachers, students, leaders, and families need distinct workspaces—not different human worth.',
  ],
  [
    '03',
    'Human review stays sovereign',
    'Algorithms may organize patterns, but they never replace human judgment, relationship, or consent.',
  ],
] as const;

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8 lg:px-16 lg:py-32">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          The ecology & manifesto
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-7xl">
          Learning does not happen in isolation.
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">
          Gurudevi is an epistemic sanctuary and education support system for Sri Lanka—grounding
          software artifacts in pedagogical care, teacher dignity, and decentralized digital
          sovereignty.
        </p>
        <div className="mt-12 border-y border-line py-5 font-sans text-xs uppercase tracking-[0.14em] text-ink-soft">
          Gurudevi Epistemic Core <span className="mx-2 text-lotus">·</span> Canonical Ecology{' '}
          <span className="mx-2 text-lotus">·</span> August 2026
        </div>
      </section>
      <section className="border-y border-line bg-paper-light px-4 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
            The concept of Teaning
          </p>
          <div className="max-w-3xl">
            <h2 className="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              Teaning is where teaching and learning meet.
            </h2>
            <p className="mt-7 text-lg leading-8 text-ink-soft">
              We use “teaning” to name the living relationship between the person who teaches, the
              person who learns, and the conditions around them. Educational technology should make
              that human relationship easier to inhabit—never harder.
            </p>
            <p className="mt-5 text-lg leading-8 text-ink-soft">
              Gurudevi is neither a corporate LMS nor a surveillance platform. It is a set of
              connected, local-first spaces calibrated for the real conditions of Sri Lankan
              schools.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
              Core pedagogical principles
            </p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              One ecology. Many centers of practice.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-8 text-ink-soft">
            Shared reality does not require identical access. Good systems coordinate without
            violating privacy, agency, or care.
          </p>
        </div>
        <div className="mt-14 grid gap-8 border-t border-line pt-8 md:grid-cols-3">
          {principles.map(([number, title, body]) => (
            <article key={number}>
              <span className="font-sans text-sm text-lotus">{number}</span>
              <h3 className="mt-8 text-2xl font-medium">{title}</h3>
              <p className="mt-4 leading-7 text-ink-soft">{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-t border-line bg-ink px-4 py-20 text-paper-light sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-water">
            Epistemic grounding
          </p>
          <div className="max-w-3xl">
            <h2 className="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              Built on Design Science Research.
            </h2>
            <p className="mt-7 text-lg leading-8 text-paper-light/70">
              Gurudevi is developed through the rigorous cadence of Design Science Research (Hevner
              3-Cycle framework), linking classroom realities with pedagogical science and open data
              protocols.
            </p>
            <Link
              className="mt-8 inline-block font-sans text-sm font-bold text-paper-light underline decoration-water underline-offset-8"
              href="/#roadmap"
            >
              Explore our multi-year horizon (Alpha 2026 → Beta 2027 → GA 2028) ↗
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
