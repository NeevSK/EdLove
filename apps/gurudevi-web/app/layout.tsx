import { DEFAULT_WORLD, WORLD_IDS } from '@repo/ui/theme';
import { PHASE_START_HOUR } from '@repo/ui/theme/scene';
import { sharedTokenCss, WorldStyles } from '@repo/ui/theme/web';
import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import './styles.css';

/** Phase start hours, latest first, so the pre-paint script picks the same phase as `phaseAt`. */
const PHASE_STARTS_DESC = JSON.stringify(
  Object.entries(PHASE_START_HOUR).sort(([, a], [, b]) => b - a),
);



export const metadata: Metadata = {
  metadataBase: new URL('https://gurudevi.app'),
  title: {
    default: 'Gurudevi',
    template: '%s | Gurudevi',
  },
  description:
    'Gurudevi is an education ecology support system and sanctuary for education in Sri Lanka, supporting teachers, students, schools, families, and communities.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'Gurudevi',
    type: 'website',
    locale: 'en_LK',
    alternateLocale: ['si_LK', 'ta_LK'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

import { PDPAConsentBanner } from './components/PDPAConsentBanner';
import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
} from '@repo/core/logic/i18n/web-locales';
import { LocaleProvider } from '../lib/i18n/LocaleContext';

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const initialLocale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={initialLocale}
      data-locale={initialLocale}
      data-world={DEFAULT_WORLD}
      data-mode="light"
      data-phase="morning"
      data-default-world={DEFAULT_WORLD}
      data-world-ids={JSON.stringify(WORLD_IDS)}
      data-phase-starts={PHASE_STARTS_DESC}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{${sharedTokenCss}}`}</style>
        <WorldStyles />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var root=document.documentElement;var l=localStorage.getItem('gd_locale');if(l&&['en','si','ta'].includes(l)){root.lang=l;root.setAttribute('data-locale',l);}var worldIds=JSON.parse(root.dataset.worldIds||'${JSON.stringify(WORLD_IDS)}');var savedWorld=localStorage.getItem('gurudevi_world');if(savedWorld&&worldIds.includes(savedWorld)){root.setAttribute('data-world',savedWorld);}var mode=localStorage.getItem('gurudevi_mode');var legacyPreset=localStorage.getItem('gurudevi_appearance_preset');if(!mode&&legacyPreset==='night'){mode='dark';}mode=mode||'system';var resolvedMode=mode==='system'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;root.setAttribute('data-mode',resolvedMode);var phaseStarts=JSON.parse(root.dataset.phaseStarts||'[]');var hour=new Date().getHours();var phase='night';for(var i=0;i<phaseStarts.length;i++){if(hour>=phaseStarts[i][1]){phase=phaseStarts[i][0];break;}}root.setAttribute('data-phase',phase);var d=localStorage.getItem('gurudevi_density')||'default';if(d==='simplified')root.setAttribute('data-density','simplified');var c=localStorage.getItem('gurudevi_pdpa_consent');if(c)root.setAttribute('data-pdpa-consent',c);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-serif text-ink antialiased">
        <LocaleProvider initialLocale={initialLocale}>
          {children}
          <PDPAConsentBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
