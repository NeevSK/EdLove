import Link from 'next/link';
import { PUBLIC_LOCALES } from './locales';
import { LOCALIZED_MARKETING, type PublicLocale, type PublicSection } from './localized-marketing';

const sectionSlugs: Record<PublicSection, string> = {
  about: 'about',
  faq: 'faq',
  support: 'support',
  thuthimal: 'thuthimal',
  journal: 'journal',
};

export function getLocalizedSection(section: string): PublicSection | null {
  return (
    (Object.keys(sectionSlugs) as PublicSection[]).find((key) => sectionSlugs[key] === section) ??
    null
  );
}

export function LocalizedMarketingPage({
  locale,
  section,
}: {
  locale: PublicLocale;
  section: PublicSection;
}) {
  const copy = LOCALIZED_MARKETING[locale];
  const page = copy.pages[section];
  const emails = {
    support: 'support@gurudevi.app',
    faq: 'support@gurudevi.app',
    about: 'institutional@gurudevi.app',
    thuthimal: 'gratitude@gurudevi.app',
    journal: 'support@gurudevi.app',
  } as const;

  return (
    <main
      id="main-content"
      lang={PUBLIC_LOCALES[locale].htmlLang}
      className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <header className="border-b border-line pb-6">
        <nav
          aria-label={locale === 'si' ? 'භාෂාව තෝරන්න' : 'மொழியைத் தேர்ந்தெடுக்கவும்'}
          className="flex flex-wrap items-center justify-between gap-4 font-sans text-sm"
        >
          <Link className="font-semibold" href={`/${locale}`}>
            {PUBLIC_LOCALES[locale].brand}
          </Link>
          <div className="flex gap-4">
            <Link href="/">English</Link>
            <Link href="/si" lang="si">
              සිංහල
            </Link>
            <Link href="/ta" lang="ta">
              தமிழ்
            </Link>
          </div>
        </nav>
        <nav
          aria-label={locale === 'si' ? 'ප්‍රධාන මෙනුව' : 'முதன்மை வழிசெலுத்தல்'}
          className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-sans text-sm"
        >
          <Link href={`/${locale}`}>{copy.homeLabel}</Link>
          {(Object.keys(copy.nav) as PublicSection[]).map((item) => (
            <Link key={item} href={`/${locale}/${sectionSlugs[item]}`}>
              {copy.nav[item]}
            </Link>
          ))}
        </nav>
      </header>

      <section className="py-16 sm:py-24">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-lotus">
          {page.eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-6xl">
          {page.title}
        </h1>
        <p className="mt-7 max-w-3xl text-xl leading-9 text-ink-soft">{page.lead}</p>
        <div className="mt-8 max-w-3xl space-y-5 text-lg leading-8 text-ink-soft">
          {page.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {page.points ? (
          <div className="mt-14 grid gap-8 border-t border-line pt-8 md:grid-cols-2">
            {page.points.map((point) =>
              section === 'faq' ? (
                <details className="border-b border-line py-5" key={point.title}>
                  <summary className="cursor-pointer text-xl font-medium">{point.title}</summary>
                  <p className="mt-4 leading-8 text-ink-soft">{point.body}</p>
                </details>
              ) : (
                <article className="border-b border-line py-5" key={point.title}>
                  <h2 className="text-2xl font-medium">{point.title}</h2>
                  <p className="mt-4 leading-8 text-ink-soft">{point.body}</p>
                </article>
              ),
            )}
          </div>
        ) : null}
        {section === 'journal' ? (
          <Link
            className="mt-8 inline-flex min-h-12 items-center underline underline-offset-4"
            href="/journal"
          >
            {locale === 'si' ? 'මුල් භාෂාවෙන් ඇති ලිපි බලන්න' : 'கட்டுரைகளை அவற்றின் மூல மொழியில் படிக்கவும்'} ↗
          </Link>
        ) : null}
        {page.contactLabel ? (
          <a
            className="mt-10 inline-flex min-h-12 items-center rounded-full bg-ink px-6 py-3 font-sans text-sm font-bold text-paper-light no-underline hover:bg-lotus focus:outline-3 focus:outline-offset-4 focus:outline-water"
            href={`mailto:${emails[section]}`}
          >
            {page.contactLabel} ↗
          </a>
        ) : null}
      </section>

      <footer className="border-t border-line py-6 font-sans text-sm text-ink-soft">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/privacy">Privacy (English)</Link>
          <Link href="/terms">Terms (English)</Link>
          <Link href="/support">English support</Link>
        </div>
      </footer>
    </main>
  );
}

export function localizedSectionMetadata(locale: PublicLocale, section: PublicSection) {
  const page = LOCALIZED_MARKETING[locale].pages[section];
  const englishPath =
    section === 'about'
      ? '/about'
      : section === 'faq'
        ? '/faq'
        : section === 'thuthimal'
          ? '/thuthimal'
          : `/${section}`;
  const localizedPath = `/${locale}/${sectionSlugs[section]}`;
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `https://gurudevi.app${localizedPath}`,
      languages: {
        en: `https://gurudevi.app${englishPath}`,
        si: `https://gurudevi.app/si/${sectionSlugs[section]}`,
        ta: `https://gurudevi.app/ta/${sectionSlugs[section]}`,
        'x-default': `https://gurudevi.app${englishPath}`,
      },
    },
    openGraph: {
      title: page.title,
      description: page.description,
      locale: locale === 'si' ? 'si_LK' : 'ta_LK',
      type: 'website' as const,
    },
  };
}
