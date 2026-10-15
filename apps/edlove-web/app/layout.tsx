import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { ThemeProvider } from './components/ThemeProvider';
import './styles.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://edlove.org'),
  title: {
    default: 'EdLove Foundation | Reimagining Education, With Love',
    template: '%s | EdLove Foundation',
  },
  description:
    'EdLove Foundation is the apex educational transformation ecosystem connecting philosophy, 200 global innovations, pedagogical canon, and empirical field research.',
  keywords: [
    'EdLove',
    'Educational Transformation',
    'Pedagogy',
    'Convivial Tools',
    '200 Innovations',
    'Sri Lanka Education Atlas',
    'Offline-First Education',
    'Teacher Dignity',
    'Relational Sanctuary',
  ],
  authors: [
    { name: 'EdLove Foundation', url: 'https://edlove.org' },
    { name: 'Naveen Sandeepa Kumara', url: 'https://neevsk.intuituilabs.studio' },
  ],
  creator: 'EdLove Foundation',
  publisher: 'EdLove Foundation',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://edlove.org',
    siteName: 'EdLove Foundation',
    title: 'EdLove Foundation | Reimagining Education, With Love',
    description:
      'The educational transformation ecosystem connecting philosophy, 200 global innovations, pedagogical canon, and empirical field research.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EdLove Foundation | Reimagining Education, With Love',
    description:
      'The educational transformation ecosystem connecting philosophy, 200 global innovations, pedagogical canon, and empirical field research.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('edlove-theme') || 'system';
                  var isDark = saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#faf7f2] dark:bg-[#111215] text-[#1a1714] dark:text-[#f5f2eb] font-serif antialiased selection:bg-[#c99436]/20 transition-colors duration-200">
        <ThemeProvider>
          {/* Global EdLove Header */}
          <header className="sticky top-0 z-50 bg-[#fffefb]/90 dark:bg-[#181a1f]/90 backdrop-blur-md border-b border-[#e5dec9] dark:border-[#292d36] px-4 sm:px-6 py-3.5 transition-colors">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <span className="text-2xl group-hover:scale-110 transition-transform">🕊️</span>
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#1a1714] dark:text-[#f5f2eb]">
                  EdLove Foundation
                </span>
              </Link>

              <HeaderNav />
            </div>
          </header>

          <div className="flex-1">{children}</div>

          {/* Global EdLove Footer */}
          <footer className="border-t border-[#e5dec9] dark:border-[#292d36] bg-[#fffefb] dark:bg-[#181a1f] py-12 px-6 font-sans text-xs text-[#615951] dark:text-[#a39e95] transition-colors">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🕊️</span>
                <span className="font-serif font-bold text-sm text-[#1a1714] dark:text-[#f5f2eb]">
                  EdLove Foundation
                </span>
                <span>— Reimagining Education, With Love.</span>
              </div>
              <div className="flex items-center gap-4 text-[#8e857b] dark:text-[#736d64]">
                <Link
                  href="/research"
                  className="hover:text-[#1a1714] dark:hover:text-[#f5f2eb] transition-colors"
                >
                  Research
                </Link>
                <Link
                  href="/innovations"
                  className="hover:text-[#1a1714] dark:hover:text-[#f5f2eb] transition-colors"
                >
                  Innovations
                </Link>
                <Link
                  href="/pedagogy"
                  className="hover:text-[#1a1714] dark:hover:text-[#f5f2eb] transition-colors"
                >
                  Pedagogy
                </Link>
                <Link
                  href="/atlas"
                  className="hover:text-[#1a1714] dark:hover:text-[#f5f2eb] transition-colors"
                >
                  Atlas
                </Link>
                <span>•</span>
                <a
                  href="https://neevsk.intuituilabs.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1a1714] dark:hover:text-[#f5f2eb] transition-colors"
                >
                  Founder ↗
                </a>
                <span>•</span>
                <span>Perennial Epistemic Commons</span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
