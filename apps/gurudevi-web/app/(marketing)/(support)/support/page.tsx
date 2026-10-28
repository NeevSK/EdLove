import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  classifyGurudeviHost,
  extractSchoolSubdomain,
  GurudeviHost,
} from '../../../../lib/host-routing';
import { getSupportConfig } from '../../../../lib/support/supportConfig';
import {
  GRATITUDE_EMAIL,
  INSTITUTIONAL_EMAIL,
  SUPPORT_EMAIL,
} from '../../../seo';
import { SanctuaryShell } from '../../../(sanctuary)/components/SanctuaryShell';
import { SupportHub } from '../SupportHub';

export const metadata: Metadata = {
  title: 'Support, Guides & Contribution · Gurudevi Sanctuary',
  description:
    'Comprehensive functionality guides, troubleshooting, direct support channels, and contribution pathways for Gurudevi Explore and Sanctuary web surfaces.',
  keywords: [
    'Gurudevi support',
    'Gurudevi guide',
    'Explore web',
    'Sanctuary workspace',
    'offline school sync',
    'contribute to Gurudevi',
    'Sri Lanka education technology',
  ],
  openGraph: {
    title: 'Support, Guides & Contribution · Gurudevi Sanctuary',
    description:
      'Grounded functionality guides, direct support lines, and contribution pathways for Gurudevi Explore and Sanctuary web surfaces.',
    url: 'https://gurudevi.app/support',
    siteName: 'Gurudevi',
    locale: 'en_US',
    type: 'website',
  },
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams?: Promise<{
    mode?: string;
    surface?: string;
    school?: string;
    role?: string;
    name?: string;
  }>;
} = {}) {
  const params = searchParams ? await searchParams : undefined;
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const hostKind = classifyGurudeviHost(host);
  const schoolHandle = extractSchoolSubdomain(host) ?? params?.school ?? null;

  let resolvedSurface: GurudeviHost = hostKind;
  if (params?.surface === 'explore' || params?.mode === 'explore') {
    resolvedSurface = 'explore';
  } else if (params?.surface === 'sanctuary' || params?.mode === 'sanctuary') {
    resolvedSurface = 'sanctuary';
  } else if (params?.surface === 'public' || params?.mode === 'public') {
    resolvedSurface = 'public';
  } else if (params?.school) {
    resolvedSurface = 'school';
  }

  const config = getSupportConfig(resolvedSurface, schoolHandle);

  const supportEmail = SUPPORT_EMAIL;
  const institutionalEmail = INSTITUTIONAL_EMAIL;
  const gratitudeEmail = GRATITUDE_EMAIL;
  const formAction = process.env.NEXT_PUBLIC_SUPPORT_FORM_ACTION;

  // On Sanctuary subdomain: render inside the authenticated SanctuaryShell
  if (resolvedSurface === 'sanctuary') {
    return (
      <SanctuaryShell
        displayName={params?.name ?? 'Sanctuary Member'}
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={false}
      >
        <main id="main-content" className="min-h-screen px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <header className="mb-10 space-y-3">
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-emerald-900">
                {config.badge}
              </span>
              <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-5xl">
                {config.title}
              </h1>
              <p className="max-w-3xl text-base text-ink-soft leading-relaxed">
                {config.description}
              </p>
            </header>

            <SupportHub
              config={config}
              supportEmail={supportEmail}
              institutionalEmail={institutionalEmail}
              gratitudeEmail={gratitudeEmail}
              formAction={formAction}
            />
          </div>
        </main>
      </SanctuaryShell>
    );
  }

  // On Explore subdomain: render inside the Guest House SanctuaryShell
  if (resolvedSurface === 'explore') {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <main id="main-content" className="min-h-screen px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <header className="mb-10 space-y-3">
              <span className="rounded-full bg-purple-100 border border-purple-200 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-purple-900">
                {config.badge}
              </span>
              <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-5xl">
                {config.title}
              </h1>
              <p className="max-w-3xl text-base text-ink-soft leading-relaxed">
                {config.description}
              </p>
            </header>

            <SupportHub
              config={config}
              supportEmail={supportEmail}
              institutionalEmail={institutionalEmail}
              gratitudeEmail={gratitudeEmail}
              formAction={formAction}
            />
          </div>
        </main>
      </SanctuaryShell>
    );
  }

  // On School vanity subdomain: render with campus header
  if (resolvedSurface === 'school' && schoolHandle) {
    return (
      <main id="main-content" className="min-h-screen">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16 lg:px-16">
          <header className="mb-10 space-y-3">
            <span className="rounded-full bg-blue-100 border border-blue-200 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-blue-900">
              {config.badge}
            </span>
            <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-5xl">
              {config.title}
            </h1>
            <p className="max-w-3xl text-base text-ink-soft leading-relaxed">
              {config.description}
            </p>
          </header>

          <SupportHub
            config={config}
            supportEmail={supportEmail}
            institutionalEmail={institutionalEmail}
            gratitudeEmail={gratitudeEmail}
            formAction={formAction}
          />
        </section>
      </main>
    );
  }

  // Default: Public Marketing Origin
  return (
    <main id="main-content" className="min-h-screen">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-8 sm:pt-24 sm:pb-16 lg:px-16">
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
            {config.badge}
          </span>
          <span className="text-ink-soft/40">·</span>
          <span className="font-sans text-xs font-medium text-ink-soft">
            Explore &amp; Sanctuary Webs
          </span>
        </div>

        <h1 className="mt-4 max-w-4xl text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-ink sm:text-6xl lg:text-7xl">
          {config.title}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-soft sm:text-xl sm:leading-9">
          {config.description}
        </p>
      </section>

      {/* Main Support Sanctuary Surface */}
      <section className="mx-auto max-w-6xl border-t border-line px-4 py-12 sm:px-8 sm:py-16 lg:px-16">
        <SupportHub
          config={config}
          supportEmail={supportEmail}
          institutionalEmail={institutionalEmail}
          gratitudeEmail={gratitudeEmail}
          formAction={formAction}
        />
      </section>
    </main>
  );
}
