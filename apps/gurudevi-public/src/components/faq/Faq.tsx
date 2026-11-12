import { translator, type SupportedLocale } from '../../site';
import { LOCALIZED_MARKETING } from '../../content/localized';

const ENGLISH_QUESTIONS = [
  {
    question: 'What is Gurudevi?',
    answer:
      'Gurudevi is an education ecology support system for teachers, students, schools, families, and communities. It brings practical work and respectful support into connected spaces.',
  },
  {
    question: 'Who is it for?',
    answer:
      'Teachers are our first design beneficiary, but the ecology includes students, principals and school leaders, families, and community partners.',
  },
  {
    question: 'When does it launch and what is the multi-year roadmap?',
    answer:
      'Our journey unfolds across three grounded phases: Alpha Release (Design Cycle artifact genesis for pilot teachers); Beta Release (Relevance Cycle field evaluation and multi-workspace expansion); and GA Stable Sanctuary (Rigor Cycle nationwide availability). Pacing remains responsive to capital flow, founder capacity, and research rigor.',
  },
  {
    question: 'What can a principal see?',
    answer:
      'School leaders can see the shared patterns needed for coordination and support. Personal reflections and private inner work are not treated as institutional surveillance.',
  },
  {
    question: 'Does Gurudevi replace teachers?',
    answer:
      'No. Gurudevi is designed to reduce avoidable friction around teaching and learning so educators have more room for professional judgment and human connection.',
  },
  {
    question: 'How can my school get involved?',
    answer:
      'Write to institutional@gurudevi.lk. We are speaking with principals and school heads who want to explore a careful, invite-led transition.',
  },
];

export function Faq({ locale }: { readonly locale: SupportedLocale }) {
  const t = translator(locale);

  const isLocalized = locale === 'si' || locale === 'ta';
  const locFaq = isLocalized ? LOCALIZED_MARKETING[locale].pages.faq : null;

  const header = {
    eyebrow: isLocalized ? t('nav.faq') : 'FAQ',
    title: locFaq?.title ?? 'Clear answers for a living system.',
    lead:
      locFaq?.lead ??
      'We are early, so we will be direct about what Gurudevi is, what it is not, and where the work is heading.',
    summaryBadge: isLocalized
      ? `${t('brand.name')} · ${t('nav.faq')}`
      : 'Gurudevi Institutional Communications · Living Framework',
    summaryNote: isLocalized
      ? locale === 'si'
        ? 'පාසල් සහ ප්‍රජා ප්‍රතිචාර අනුව නිරන්තරයෙන් යාවත්කාලීන වන ප්‍රශ්නෝත්තර සටහන.'
        : 'பள்ளிகள் மற்றும் சமூகக் கருத்துக்களுக்கு ஏற்ப தொடர்ச்சியாகப் புதுப்பிக்கப்படும் வினா-விடைத் தொகுப்பு.'
      : 'Living FAQ updated periodically as new school inquiries and community feedback arrive.',
    sectionHeading: isLocalized
      ? locale === 'si'
        ? 'නිතර අසන ප්‍රශ්න සහ පිළිතුරු'
        : 'பொதுவான வினாக்களும் விடைகளும்'
      : 'Questions people ask.',
    askTitle: isLocalized
      ? locale === 'si'
        ? 'තවදුරටත් ගැටලු තිබේද?'
        : 'மேலும் சந்தேகங்களா?'
      : 'Still wondering?',
    askHeading: isLocalized
      ? locale === 'si'
        ? 'අපෙන් විමසන්න.'
        : 'எம்மிடம் கேளுங்கள்.'
      : 'Ask a human.',
    askLede: isLocalized
      ? locale === 'si'
        ? 'ගුරුභවතුන්, පවුල් සහ පාසල් නායකයන්ගෙන් ලැබෙන ප්‍රායෝගික විමසීම් අපි සාදරයෙන් පිළිගනිමු.'
        : 'ஆசிரியர்கள், குடும்பங்கள் மற்றும் பள்ளித் தலைவர்களின் நடைமுறை வினாக்களை வரவேற்கிறோம்.'
      : 'We welcome practical questions from teachers, families, and school leaders.',
    askCta: isLocalized
      ? locale === 'si'
        ? 'විද්‍යුත් තැපෑලෙන් අසන්න ↗'
        : 'மின்னஞ்சல் வழியே கேட்க ↗'
      : 'Email the team ↗',
  };

  const questions =
    locFaq?.points?.map((pt) => ({
      question: pt.title,
      answer: pt.body,
    })) ?? ENGLISH_QUESTIONS;

  return (
    <main id="main-content">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8 lg:px-16 lg:py-32">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          {header.eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.97] tracking-[-0.04em] sm:text-7xl">
          {header.title}
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">{header.lead}</p>
        <details className="mt-10 border-y border-line py-4 font-sans text-sm text-ink-soft">
          <summary className="cursor-pointer font-semibold text-ink">{header.summaryBadge}</summary>
          <p className="mt-5 max-w-2xl leading-7">{header.summaryNote}</p>
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
            {header.sectionHeading}
          </h2>
          <div className="mt-10 border-t border-line">
            {questions.map((item) => (
              <details className="group border-b border-line" key={item.question}>
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium marker:hidden focus:outline-3 focus:outline-offset-4 focus:outline-water sm:text-2xl">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="font-sans text-2xl font-normal text-lotus transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-3xl pb-7 pr-10 text-base leading-8 text-ink-soft">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-16 lg:py-24">
        <div>
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
            {header.askTitle}
          </p>
          <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
            {header.askHeading}
          </h2>
        </div>
        <div>
          <p className="max-w-xl text-lg leading-8 text-ink-soft">{header.askLede}</p>
          <a
            className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ink px-5 py-3 font-sans text-sm font-bold text-paper-light no-underline hover:bg-lotus focus:outline-3 focus:outline-offset-4 focus:outline-water"
            href="mailto:support@gurudevi.lk"
          >
            {header.askCta}
          </a>
        </div>
      </section>
    </main>
  );
}
