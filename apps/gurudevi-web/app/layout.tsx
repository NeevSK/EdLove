import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { tokens } from '@repo/ui/tokens';
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
  description: 'A sanctuary for educational practice, reflection, and belonging.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <style>{`:root{${sharedTokenCss}}`}</style>
      </head>
      <body className="bg-paper font-serif text-ink antialiased">{children}</body>
    </html>
  );
}
