import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thuthimal (තුතිමල්) | Reciprocal Care for Teachers',
  description: 'A gift economy protocol enabling communities to sponsor sovereign tools for teachers.',
};

const tributes = [
  ['🪷', 'Mrs. Bandara', 'Kandy', 'Biology & Environmental Science', 'For teaching us that life is not a syllabus to memorise, but a living ecosystem to protect. Your warmth in the laboratory shaped my entire career in ecology.', 'Pasan · Batch 2018'],
  ['🌸', 'Mr. Sivalingam', 'Jaffna', 'Pure Mathematics', 'When I was ready to give up after failing my first term exam, you stayed after school for three weeks just to rebuild my confidence from ground up.', 'Tharshini · Batch 2015'],
  ['🌼', 'Miss Jayawardena', 'Galle', 'Sinhala Literature', 'You taught us the rhythm of language and the dignity of our cultural roots. May you always be surrounded by peace and honor.', 'Kavindi · Batch 2021'],
  ['🌺', 'Mr. Fernando', 'Colombo', 'Physics', 'A teacher who never needed to raise his voice. Your patience and clear demonstrations turned abstract equations into pure wonder.', 'Minura · Batch 2019'],
  ['🌻', 'Mrs. Selvarajah', 'Batticaloa', 'English Language', 'You gave a village child the courage to speak without fear. That gift of confidence has carried me across continents.', 'Niroshan · Batch 2016'],
  ['🌷', 'Venerable Dhammarakkhitha Thero', 'Anuradhapura', 'Buddhism & Philosophy', 'For showing us that true education begins in the stillness of the mind and the gentleness of one’s actions.', 'Saman · Batch 2014'],
] as const;

export default function ThuthimalPage() {
  return (
    <main id="main-content">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8 lg:px-16 lg:py-32">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">Reciprocal Care Economy</p>
        <div aria-hidden="true" className="mt-8 text-5xl text-lotus">♧</div>
        <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-7xl">Thuthimal (තුතිමල්)</h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">A gift economy protocol enabling students, alumni, and communities to sponsor sovereign tools for teachers.</p>
        <details className="mt-10 border-y border-line py-4 font-sans text-sm text-ink-soft">
          <summary className="cursor-pointer font-semibold text-ink">Naveen · Jul 1, 2026 · Rev. Sep 1, 2026 · Alpha Protocol v1.0</summary>
          <p className="mt-5 max-w-2xl leading-7">Living specification defining the Thuthimal reciprocal patronage protocol for Sri Lankan teachers. 3 min read.</p>
        </details>
      </section>

      <section className="border-y border-line bg-paper-light px-4 py-16 sm:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.7fr_1.3fr]"><p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">The protocol</p><div className="max-w-3xl"><h2 className="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">What is Thuthimal?</h2><p className="mt-7 text-lg leading-8 text-ink-soft">In Sinhala, <strong className="text-ink">Thuthimal</strong> means “Flower of Gratitude.” It is a concept that embeds gratitude and recognition into our economic model.</p><p className="mt-5 text-lg leading-8 text-ink-soft">We believe teaching is sacred work that deserves reciprocal care across time. Thuthimal allows anyone—past students, parents, or alumni associations—to sponsor Pro subscriptions for teachers as a gesture of honor.</p></div></div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8 lg:px-16 lg:py-24"><div className="grid gap-10 border-t border-line pt-8 md:grid-cols-2"><article><h2 className="text-3xl font-medium tracking-[-0.04em]">For teachers</h2><p className="mt-4 leading-8 text-ink-soft">Receive a Pro subscription as a gift of gratitude. Your profile will display a badge of honor, acknowledging the impact you’ve made.</p></article><article><h2 className="text-3xl font-medium tracking-[-0.04em]">For sponsors</h2><p className="mt-4 leading-8 text-ink-soft">Honor a teacher who changed your life. Provide them with the tools they need to flourish in their sanctuary.</p></article></div></section>

      <section aria-labelledby="garden-heading" className="border-y border-line bg-paper-light px-4 py-16 sm:px-8 lg:px-16 lg:py-24"><div className="mx-auto max-w-5xl"><p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">🌸 The living wall of gratitude</p><h2 id="garden-heading" className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Thuthimal Garden (තුතිමල් උයන)</h2><p className="mt-6 max-w-2xl text-lg italic leading-8 text-ink-soft">Every flower represents a token of gratitude and reciprocal patronage from a student, honoring a teacher who changed their life.</p><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tributes.map(([flower, teacher, district, subject, message, from]) => <details className="border-t border-line py-5" key={teacher}><summary className="cursor-pointer list-none marker:hidden focus:outline-3 focus:outline-offset-4 focus:outline-water"><span className="text-3xl" aria-hidden="true">{flower}</span><span className="ml-3 font-medium">{teacher}</span><span className="mt-2 block font-sans text-xs uppercase tracking-wider text-lotus">{subject} · {district}</span></summary><blockquote className="mt-4 border-l-2 border-lotus pl-4 text-sm italic leading-7 text-ink-soft">“{message}”<footer className="mt-3 font-sans text-xs not-italic uppercase tracking-wider text-ink">{from}</footer></blockquote></details>)}</div></div></section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8 lg:px-16 lg:py-24"><p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">Become part of the economy</p><h2 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Let gratitude reach its intended sanctuary.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-ink-soft">During our Alpha phase, we are processing Thuthimal gifts manually to ensure every flower reaches its intended sanctuary.</p><a className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ink px-5 py-3 font-sans text-sm font-bold text-paper-light no-underline hover:bg-lotus focus:outline-3 focus:outline-offset-4 focus:outline-water" href="mailto:gratitude@gurudevi.lk">Sponsor a teacher</a></section>
    </main>
  );
}
