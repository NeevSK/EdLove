'use client';

import { useTranslation } from '../../../../lib/i18n';
import { LOCALIZED_MARKETING } from '../../../../lib/localized-marketing';

const tributes = [
  [
    '🪷',
    'Mrs. Bandara',
    'Kandy',
    'Biology & Environmental Science',
    'For teaching us that life is not a syllabus to memorise, but a living ecosystem to protect. Your warmth in the laboratory shaped my entire career in ecology.',
    'Pasan · Batch 2018',
  ],
  [
    '🌸',
    'Mr. Sivalingam',
    'Jaffna',
    'Pure Mathematics',
    'When I was ready to give up after failing my first term exam, you stayed after school for three weeks just to rebuild my confidence from ground up.',
    'Tharshini · Batch 2015',
  ],
  [
    '🌼',
    'Miss Jayawardena',
    'Galle',
    'Sinhala Literature',
    'You taught us the rhythm of language and the dignity of our cultural roots. May you always be surrounded by peace and honor.',
    'Kavindi · Batch 2021',
  ],
  [
    '🌺',
    'Mr. Fernando',
    'Colombo',
    'Physics',
    'A teacher who never needed to raise his voice. Your patience and clear demonstrations turned abstract equations into pure wonder.',
    'Minura · Batch 2019',
  ],
  [
    '🌻',
    'Mrs. Selvarajah',
    'Batticaloa',
    'English Language',
    'You gave a village child the courage to speak without fear. That gift of confidence has carried me across continents.',
    'Niroshan · Batch 2016',
  ],
  [
    '🌷',
    'Venerable Dhammarakkhitha Thero',
    'Anuradhapura',
    'Buddhism & Philosophy',
    'For showing us that true education begins in the stillness of the mind and the gentleness of one’s actions.',
    'Saman · Batch 2014',
  ],
] as const;

export function ThuthimalClient() {
  const { locale } = useTranslation();
  const isLocalized = locale === 'si' || locale === 'ta';
  const loc = isLocalized ? LOCALIZED_MARKETING[locale].pages.thuthimal : null;

  const eyebrow = loc?.eyebrow ?? 'Reciprocal Care Economy';
  const title = loc?.title ?? 'Thuthimal (තුතිමල්)';
  const lead =
    loc?.lead ??
    'A gift economy protocol enabling students, alumni, and communities to sponsor sovereign tools for teachers.';

  const whatTitle = isLocalized
    ? locale === 'si'
      ? 'තුතිමල් යනු කුමක්ද?'
      : 'துத்திமல் என்றால் என்ன?'
    : 'What is Thuthimal?';

  const whatP1 =
    loc?.paragraphs[0] ??
    'In Sinhala, Thuthimal means “Flower of Gratitude.” It is a concept that embeds gratitude and recognition into our economic model.';

  const whatP2 =
    loc?.paragraphs[1] ??
    'We believe teaching is sacred work that deserves reciprocal care across time. Thuthimal allows anyone—past students, parents, or alumni associations—to sponsor Pro subscriptions for teachers as a gesture of honor.';

  const forTeachersTitle = isLocalized
    ? locale === 'si'
      ? 'ගුරුවරුන් සඳහා'
      : 'ஆசிரியர்களுக்கு'
    : 'For teachers';

  const forTeachersBody =
    loc?.points?.[0]?.body ??
    'Receive a Pro subscription as a gift of gratitude. Your profile will display a badge of honor, acknowledging the impact you’ve made.';

  const forSponsorsTitle = isLocalized
    ? locale === 'si'
      ? 'දායකයන් සඳහා'
      : 'ஆதரவாளர்களுக்கு'
    : 'For sponsors';

  const forSponsorsBody =
    loc?.points?.[1]?.body ??
    'Honor a teacher who changed your life. Provide them with the tools they need to flourish in their sanctuary.';

  const gardenTitle = isLocalized
    ? locale === 'si'
      ? 'තුතිමල් උයන'
      : 'துத்திமல் மலர்வனம்'
    : 'Thuthimal Garden (තුතිමල් උයන)';

  const gardenLead = isLocalized
    ? locale === 'si'
      ? 'සෑම මලක්ම ගුරුවරයෙකුට පිදෙන කෘතඥතාවයේ සහ ගෞරවයේ සංකේතයකි.'
      : 'ஒவ்வொரு மலரும் ஆசிரியருக்கு மரியாதை செலுத்தும் நன்றியின் அடையாளமாகும்.'
    : 'Every flower represents a token of gratitude and reciprocal patronage from a student, honoring a teacher who changed their life.';

  const ctaTitle = isLocalized
    ? locale === 'si'
      ? 'කෘතඥතාව සුදුසු තැනට ළඟා වීමට ඉඩ දෙන්න.'
      : 'நன்றி உரிய சோலையைச் சென்றடையட்டும்.'
    : 'Let gratitude reach its intended sanctuary.';

  const ctaBtn = loc?.contactLabel ?? 'Sponsor a teacher';

  return (
    <main id="main-content">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8 lg:px-16 lg:py-32">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          {eyebrow}
        </p>
        <div aria-hidden="true" className="mt-8 text-5xl text-lotus">
          ♧
        </div>
        <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-7xl">
          {title}
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">
          {lead}
        </p>
      </section>

      <section className="border-y border-line bg-paper-light px-4 py-16 sm:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
            {isLocalized ? (locale === 'si' ? 'ප්‍රොටෝකෝලය' : 'நெறிமுறை') : 'The protocol'}
          </p>
          <div className="max-w-3xl">
            <h2 className="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              {whatTitle}
            </h2>
            <p className="mt-7 text-lg leading-8 text-ink-soft">
              {whatP1}
            </p>
            <p className="mt-5 text-lg leading-8 text-ink-soft">
              {whatP2}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8 lg:px-16 lg:py-24">
        <div className="grid gap-10 border-t border-line pt-8 md:grid-cols-2">
          <article>
            <h2 className="text-3xl font-medium tracking-[-0.04em]">{forTeachersTitle}</h2>
            <p className="mt-4 leading-8 text-ink-soft">
              {forTeachersBody}
            </p>
          </article>
          <article>
            <h2 className="text-3xl font-medium tracking-[-0.04em]">{forSponsorsTitle}</h2>
            <p className="mt-4 leading-8 text-ink-soft">
              {forSponsorsBody}
            </p>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="garden-heading"
        className="border-y border-line bg-paper-light px-4 py-16 sm:px-8 lg:px-16 lg:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
            🌸 {isLocalized ? (locale === 'si' ? 'කෘතඥතාවයේ ජීවමාන පවුර' : 'வாழும் நன்றிச் சுவர்') : 'The living wall of gratitude'}
          </p>
          <h2
            id="garden-heading"
            className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl"
          >
            {gardenTitle}
          </h2>
          <p className="mt-6 max-w-2xl text-lg italic leading-8 text-ink-soft">
            {gardenLead}
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tributes.map(([flower, teacher, district, subject, message, from]) => (
              <details className="border-t border-line py-5" key={teacher}>
                <summary className="cursor-pointer list-none marker:hidden focus:outline-3 focus:outline-offset-4 focus:outline-water">
                  <span className="text-3xl" aria-hidden="true">
                    {flower}
                  </span>
                  <span className="ml-3 font-medium">{teacher}</span>
                  <span className="mt-2 block font-sans text-xs uppercase tracking-wider text-lotus">
                    {subject} · {district}
                  </span>
                </summary>
                <blockquote className="mt-4 border-l-2 border-lotus pl-4 text-sm italic leading-7 text-ink-soft">
                  “{message}”
                  <footer className="mt-3 font-sans text-xs not-italic uppercase tracking-wider text-ink">
                    {from}
                  </footer>
                </blockquote>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8 lg:px-16 lg:py-24">
        <h2 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
          {ctaTitle}
        </h2>
        <a
          className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ink px-5 py-3 font-sans text-sm font-bold text-paper-light no-underline hover:bg-lotus focus:outline-3 focus:outline-offset-4 focus:outline-water"
          href="mailto:gratitude@gurudevi.lk"
        >
          {ctaBtn} ↗
        </a>
      </section>
    </main>
  );
}

