'use client';

import Link from 'next/link';
import { useTranslation } from '../../../lib/i18n';
import { LOCALIZED_MARKETING } from '../../../lib/localized-marketing';

const ENGLISH_CONTENT = {
  eyebrow: 'The ecology & manifesto',
  title: 'Learning does not happen in isolation.',
  lead:
    'Gurudevi is an epistemic sanctuary and education support system for Sri Lanka—grounding software artifacts in pedagogical care, teacher dignity, and decentralized digital sovereignty.',
  badge: 'Gurudevi Epistemic Core · Canonical Ecology',
  teaningEyebrow: 'The concept of Teaning',
  teaningTitle: 'Teaning is where teaching and learning meet.',
  teaningP1:
    'We use “teaning” to name the living relationship between the person who teaches, the person who learns, and the conditions around them. Educational technology should make that human relationship easier to inhabit—never harder.',
  teaningP2:
    'Gurudevi is neither a corporate LMS nor a surveillance platform. It is a set of connected, local-first spaces calibrated for the real conditions of Sri Lankan schools.',
  principlesEyebrow: 'Core pedagogical principles',
  principlesTitle: 'One ecology. Many centers of practice.',
  principlesLede:
    'Shared reality does not require identical access. Good systems coordinate without violating privacy, agency, or care.',
  principles: [
    {
      number: '01',
      title: 'Support before extraction',
      body: 'Every tool returns more energy and clarity than it takes from educators and learners.',
    },
    {
      number: '02',
      title: 'Different views, shared dignity',
      body: 'Teachers, students, leaders, and families need distinct workspaces—not different human worth.',
    },
    {
      number: '03',
      title: 'Human review stays sovereign',
      body: 'Algorithms may organize patterns, but they never replace human judgment, relationship, or consent.',
    },
  ],
  epistemicEyebrow: 'Epistemic grounding',
  epistemicTitle: 'Built on Design Science Research.',
  epistemicP1:
    'Gurudevi is developed through the rigorous cadence of Design Science Research (Hevner 3-Cycle framework), linking classroom realities with pedagogical science and open data protocols.',
  epistemicCta: 'Explore our multi-year horizon (Alpha 2026 → Beta 2027 → GA 2028) ↗',
};

export function AboutClient() {
  const { locale, t } = useTranslation();

  const isLocalized = locale === 'si' || locale === 'ta';
  const locData = isLocalized ? LOCALIZED_MARKETING[locale].pages.about : null;

  const content = {
    eyebrow: locData?.eyebrow ?? ENGLISH_CONTENT.eyebrow,
    title: locData?.title ?? ENGLISH_CONTENT.title,
    lead: locData?.lead ?? ENGLISH_CONTENT.lead,
    badge: isLocalized
      ? `${t('brand.name')} · ${t('brand.sanctuaryTagline')}`
      : ENGLISH_CONTENT.badge,
    teaningEyebrow: isLocalized
      ? locale === 'si'
        ? 'ඉගැන්වීම සහ ඉගෙනුම'
        : 'கற்பித்தலும் கற்றலும்'
      : ENGLISH_CONTENT.teaningEyebrow,
    teaningTitle: isLocalized
      ? locData?.paragraphs[0] ?? ENGLISH_CONTENT.teaningTitle
      : ENGLISH_CONTENT.teaningTitle,
    teaningP1: isLocalized
      ? locData?.paragraphs[0] ?? ENGLISH_CONTENT.teaningP1
      : ENGLISH_CONTENT.teaningP1,
    teaningP2: isLocalized
      ? locData?.paragraphs[1] ?? ENGLISH_CONTENT.teaningP2
      : ENGLISH_CONTENT.teaningP2,
    principlesEyebrow: isLocalized
      ? locale === 'si'
        ? 'මූලික අධ්‍යාපන ප්‍රතිපත්ති'
        : 'அடிப்படை கல்விக் கோட்பாடுகள்'
      : ENGLISH_CONTENT.principlesEyebrow,
    principlesTitle: isLocalized
      ? locale === 'si'
        ? 'එක් ජීවමාන පරිසරයක්. සුවිශේෂී ප්‍රායෝගික කෙම්බිම්.'
        : 'ஓர் உயிரோட்டமான சூழல். பல நடைமுறை வெளிகள்.'
      : ENGLISH_CONTENT.principlesTitle,
    principlesLede: isLocalized
      ? locale === 'si'
        ? 'සැබෑ අධ්‍යාපනික සහාය පෞද්ගලිකත්වය හෝ ගෞරවය උල්ලංඝනය නොකර සම්බන්ධීකරණය වේ.'
        : 'தனியுரிமையையோ அல்லது கண்ணியத்தையோ மீறாமல் உண்மையான கல்விச் சூழல் ஒருங்கிணைக்கப்படுகிறது.'
      : ENGLISH_CONTENT.principlesLede,
    principles:
      locData?.points?.map((pt, idx) => ({
        number: `0${idx + 1}`,
        title: pt.title,
        body: pt.body,
      })) ?? ENGLISH_CONTENT.principles,
    epistemicEyebrow: isLocalized
      ? locale === 'si'
        ? 'පර්යේෂණ පදනම'
        : 'ஆய்வு அடித்தளம்'
      : ENGLISH_CONTENT.epistemicEyebrow,
    epistemicTitle: isLocalized
      ? locale === 'si'
        ? 'පර්යේෂණාත්මක සැලසුම් විද්‍යාව මත පදනම්ව.'
        : 'வடிவமைப்பு அறிவியல் ஆய்வின் அடிப்படையில் உருவானது.'
      : ENGLISH_CONTENT.epistemicTitle,
    epistemicP1: isLocalized
      ? locale === 'si'
        ? 'ගුරුදෙවි පන්ති කාමරයේ සැබෑ යථාර්ථය අධ්‍යාපන විද්‍යාව සහ විවෘත දත්ත ප්‍රොටෝකෝල සමඟ සම්බන්ධ කරමින් නිර්මාණය වේ.'
        : 'குருதெவி வகுப்பறையின் நடைமுறை உண்மைகளை கல்வி அறிவியலுடனும் திறந்த தரவு நெறிமுறைகளுடனும் இணைத்து உருவாக்கப்படுகிறது.'
      : ENGLISH_CONTENT.epistemicP1,
    epistemicCta: isLocalized
      ? locale === 'si'
        ? 'අපගේ බහු-වාර්ෂික ගමන් මඟ සොයා යන්න ↗'
        : 'எமது பல்லாண்டு பயணப் பாதையைக் காண்க ↗'
      : ENGLISH_CONTENT.epistemicCta,
  };

  return (
    <main id="main-content">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8 lg:px-16 lg:py-32">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          {content.eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.97] tracking-[-0.04em] sm:text-7xl">
          {content.title}
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">{content.lead}</p>
        <div className="mt-12 border-y border-line py-5 font-sans text-xs uppercase tracking-[0.14em] text-ink-soft">
          {content.badge}
        </div>
      </section>

      <section className="border-y border-line bg-paper-light px-4 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
            {content.teaningEyebrow}
          </p>
          <div className="max-w-3xl">
            <h2 className="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              {content.teaningTitle}
            </h2>
            <p className="mt-7 text-lg leading-8 text-ink-soft">{content.teaningP1}</p>
            <p className="mt-5 text-lg leading-8 text-ink-soft">{content.teaningP2}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
              {content.principlesEyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              {content.principlesTitle}
            </h2>
          </div>
          <p className="max-w-md text-lg leading-8 text-ink-soft">{content.principlesLede}</p>
        </div>
        <div className="mt-14 grid gap-8 border-t border-line pt-8 md:grid-cols-3">
          {content.principles.map((principle) => (
            <article key={principle.number}>
              <span className="font-sans text-sm text-lotus">{principle.number}</span>
              <h3 className="mt-8 text-2xl font-medium">{principle.title}</h3>
              <p className="mt-4 leading-7 text-ink-soft">{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink px-4 py-20 text-paper-light sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-water">
            {content.epistemicEyebrow}
          </p>
          <div className="max-w-3xl">
            <h2 className="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              {content.epistemicTitle}
            </h2>
            <p className="mt-7 text-lg leading-8 text-paper-light/70">{content.epistemicP1}</p>
            <Link
              className="mt-8 inline-block font-sans text-sm font-bold text-paper-light underline decoration-water underline-offset-8"
              href="/#roadmap"
            >
              {content.epistemicCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

