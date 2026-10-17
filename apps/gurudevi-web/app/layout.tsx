import { tokens } from '@repo/ui/tokens';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './styles.css';

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
  title: {
    default: 'Gurudevi',
    template: '%s | Gurudevi',
  },
  description:
    'Gurudevi is an education ecology support system and sanctuary for education in Sri Lanka, supporting teachers, students, schools, families, and communities.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{${sharedTokenCss}}`}</style>
      </head>
      <body className="bg-paper font-serif text-ink antialiased">{children}</body>
    </html>
  );
}
