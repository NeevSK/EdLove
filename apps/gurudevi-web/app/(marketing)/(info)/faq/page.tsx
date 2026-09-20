import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Clear answers about Gurudevi, its people, and its multi-year horizon.',
};

const questions = [
  [
    'What is Gurudevi?',
    'Gurudevi is an education ecology support system for teachers, students, schools, families, and communities. It brings practical work and respectful support into connected spaces.',
  ],
  [
    'Who is it for?',
    'Teachers are our first design beneficiary, but the ecology includes students, principals and school leaders, families, and community partners.',
  ],
  [
    'When does it launch and what is the multi-year roadmap?',
    'Our journey unfolds across three grounded phases: Alpha Release on October 6, 2026 (Design Cycle artifact genesis for pilot teachers); Beta Release on October 6, 2027 (Relevance Cycle field evaluation and multi-workspace expansion); and GA Stable Sanctuary on October 6, 2028 (Rigor Cycle nationwide availability). Pacing remains responsive to capital flow, founder capacity, and research rigor.',
  ],
  [
    'What can a principal see?',
    'School leaders can see the shared patterns needed for coordination and support. Personal reflections and private inner work are not treated as institutional surveillance.',
  ],
  [
    'Does Gurudevi replace teachers?',
    'No. Gurudevi is designed to reduce avoidable friction around teaching and learning so educators have more room for professional judgment and human connection.',
  ],
  [
    'How can my school get involved?',
    'Write to institutional@gurudevi.app. We are speaking with principals and school heads who want to explore a careful, invite-led transition.',
  ],
] as const;

export default function FaqPage() {
  return (
    <main id="main-content">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8 lg:px-16 lg:py-32">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">FAQ</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-7xl">
          Clear answers for a living system.
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">
          We are early, so we will be direct about what Gurudevi is, what it is not, and where the
          work is heading.
        </p>
        <details className="mt-10 border-y border-line py-4 font-sans text-sm text-ink-soft">
          <summary className="cursor-pointer font-semibold text-ink">
            Gurudevi Institutional Communications · Aug 28, 2026 · Living Framework · v1.1
          </summary>
          <p className="mt-5 max-w-2xl leading-7">
            Living FAQ updated periodically as new school inquiries and community feedback arrive.
          </p>
        </details>
      </section>

      <section
        aria-labelledby="questions-heading"
        className="border-y border-line bg-paper-light px-4 py-16 sm:px-8 lg:px-16 lg:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="questions-heading"
            className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl"
          >
            Questions people ask.
          </h2>
          <div className="mt-10 border-t border-line">
            {questions.map(([question, answer]) => (
              <details className="group border-b border-line" key={question}>
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium marker:hidden focus:outline-3 focus:outline-offset-4 focus:outline-water sm:text-2xl">
                  <span>{question}</span>
                  <span
                    aria-hidden="true"
                    className="font-sans text-2xl font-normal text-lotus transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-3xl pb-7 pr-10 text-base leading-8 text-ink-soft">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-16 lg:py-24">
        <div>
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
            Still wondering?
          </p>
          <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Ask a human.</h2>
        </div>
        <div>
          <p className="max-w-xl text-lg leading-8 text-ink-soft">
            We welcome practical questions from teachers, families, and school leaders.
          </p>
          <a
            className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ink px-5 py-3 font-sans text-sm font-bold text-paper-light no-underline hover:bg-lotus focus:outline-3 focus:outline-offset-4 focus:outline-water"
            href="mailto:support@gurudevi.app"
          >
            Contact support ↗
          </a>
        </div>
      </section>
    </main>
  );
}
