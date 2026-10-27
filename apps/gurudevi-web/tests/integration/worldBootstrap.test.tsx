import { WORLD_IDS } from '@repo/ui/world';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RootLayout from '@/app/layout';

vi.mock('@/app/components/PDPAConsentBanner', () => ({ PDPAConsentBanner: () => null }));

const html = renderToStaticMarkup(
  <RootLayout>
    <span>Content</span>
  </RootLayout>,
);
const page = new DOMParser().parseFromString(html, 'text/html');
const bootstrap = Array.from(page.scripts).find((script) =>
  script.textContent?.includes('gurudevi_world'),
)?.textContent;

afterEach(() => {
  localStorage.clear();
  for (const attribute of [
    'data-world',
    'data-theme',
    'data-mode',
    'data-appearance',
    'data-phase',
    'data-density',
  ]) {
    document.documentElement.removeAttribute(attribute);
  }
});

describe('World selection before hydration', () => {
  it.each(WORLD_IDS)('restores the saved %s world from the canonical registry', (world) => {
    localStorage.setItem('gurudevi_world', world);
    expect(bootstrap).toBeTruthy();
    new Function(bootstrap ?? '')();
    expect(document.documentElement.getAttribute('data-world')).toBe(world);
  });

  it('ignores unknown stored values and preserves the legacy appearance preference', () => {
    localStorage.setItem('gurudevi_world', 'unrecognized-world');
    localStorage.setItem('gurudevi_appearance_preset', 'night');
    new Function(bootstrap ?? '')();
    expect(document.documentElement.hasAttribute('data-world')).toBe(false);
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });
});
