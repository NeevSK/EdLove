import { tokens } from '@repo/ui/tokens';
import { WORLD_IDS } from '@repo/ui/theme';
import { PHASE_START_HOUR } from '@repo/ui/theme/scene';
import { WorldStyles } from '@repo/ui/theme/web';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './styles.css';

/** Phase start hours, latest first, so the pre-paint script picks the same phase as `phaseAt`. */
const PHASE_STARTS_DESC = JSON.stringify(
  Object.entries(PHASE_START_HOUR).sort(([, a], [, b]) => b - a),
);

const sharedTokenCss = [
  `--gd-primary:${tokens.colors.primary}`,
  `--gd-secondary:${tokens.colors.secondary}`,
  `--gd-surface-page:${tokens.semantic.surface.page}`,
  `--gd-surface-canvas:${tokens.semantic.surface.canvas}`,
  `--gd-text-primary:${tokens.semantic.text.primary}`,
  `--gd-text-secondary:${tokens.semantic.text.secondary}`,
  `--gd-text-inverse:${tokens.semantic.text.inverse}`,
  `--gd-border-subtle:${tokens.semantic.border.subtle}`,
  `--gd-border-focus:${tokens.semantic.border.focus}`,
  `--gd-accent-atmospheric:${tokens.colors.accentAtmospheric}`,
  `--gd-accent-depth:${tokens.colors.accentDepth}`,
  `--gd-touch-target:${tokens.interaction.minTouchTarget}px`,
].join(';');

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
} from '../lib/i18n/types';
import { LocaleProvider } from '../lib/i18n/LocaleContext';

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const initialLocale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} data-locale={initialLocale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{${sharedTokenCss}}`}</style>
        <WorldStyles />
        <script>{`(function(){try{
var l=localStorage.getItem('gd_locale');
if(l&&['en','si','ta'].includes(l)){document.documentElement.lang=l;document.documentElement.setAttribute('data-locale',l);}
var t=localStorage.getItem('gurudevi_theme')||'sanctuary';
var m=localStorage.getItem('gurudevi_mode')||'system';
var d=localStorage.getItem('gurudevi_density')||'default';
var legacy=localStorage.getItem('gurudevi_appearance_preset');
if(legacy==='night'){m='dark';}else if(legacy==='garden'||legacy==='dawn'){t=legacy;}
var resolvedMode=m==='system'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;
var w=localStorage.getItem('gurudevi_world');
if(w&&${JSON.stringify(WORLD_IDS)}.includes(w)){document.documentElement.setAttribute('data-world',w);if(w!=='sanctuary'){t='sanctuary';}}
var h=new Date().getHours(),p='night',s=${PHASE_STARTS_DESC};
for(var i=0;i<s.length;i++){if(h>=s[i][1]){p=s[i][0];break;}}
document.documentElement.setAttribute('data-phase',p);
document.documentElement.setAttribute('data-theme',t);
document.documentElement.setAttribute('data-mode',resolvedMode);
document.documentElement.setAttribute('data-appearance',resolvedMode==='dark'?'night':t);
if(d==='simplified'){document.documentElement.setAttribute('data-density','simplified');}
var c=localStorage.getItem('gurudevi_pdpa_consent');
if(c){document.documentElement.setAttribute('data-pdpa-consent',c);}
}catch(e){}})();`}</script>
      </head>
      <body className="bg-paper font-serif text-ink antialiased">
        <LocaleProvider initialLocale={initialLocale}>
          {children}
          <PDPAConsentBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
