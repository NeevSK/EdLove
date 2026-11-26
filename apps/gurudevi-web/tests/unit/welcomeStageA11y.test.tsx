import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '@/tests/support/render';
import { describe, expect, it } from 'vitest';
import { WelcomeStage } from '../../app/(sanctuary)/welcome/WelcomeStage';
import { LocaleProvider } from '../../lib/i18n';

describe('WelcomeStage A11y & Dual-Standard Compliance', () => {
  it('renders semantic landmarks: banner, main, and contentinfo', () => {
    render(
      <LocaleProvider initialLocale="en">
        <WelcomeStage mode="sanctuary" />
      </LocaleProvider>,
    );

    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByRole('main')).toBeDefined();
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });

  it('contains accessible heading hierarchy and descriptive mascot alternative text', () => {
    render(
      <LocaleProvider initialLocale="en">
        <WelcomeStage mode="sanctuary" />
      </LocaleProvider>,
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toContain('Welcome to');
    expect(heading.textContent).toContain('Gurudevi Sanctuary.');

    const mascotImg = screen.getByAltText(/Tutii the firefly guide floating warmly with a lantern/i);
    expect(mascotImg).toBeDefined();
  });

  it('does NOT autofocus the primary sign-in link on page load to preserve document landmark order', () => {
    render(
      <LocaleProvider initialLocale="en">
        <WelcomeStage mode="sanctuary" />
      </LocaleProvider>,
    );

    const signInLink = screen.getByRole('link', { name: /Sign in to Sanctuary/i });
    expect(signInLink).toBeDefined();
    expect(signInLink.getAttribute('autofocus')).toBeNull();
  });

  it('provides an explicit accessible name on the external explore sandbox link', () => {
    render(
      <LocaleProvider initialLocale="en">
        <WelcomeStage mode="sanctuary" />
      </LocaleProvider>,
    );

    const sandboxLink = screen.getByLabelText(/Looking for the public sandbox\? Visit Explore Guest House/i);
    expect(sandboxLink).toBeDefined();
    expect(sandboxLink.getAttribute('href')).toContain('explore');
  });

  it('renders quick launch role links in dev environment with accessible role labels', () => {
    render(
      <LocaleProvider initialLocale="en">
        <WelcomeStage mode="sanctuary" />
      </LocaleProvider>,
    );

    expect(screen.getByRole('link', { name: /Teacher/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Student/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Principal/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Guardian/i })).toBeDefined();
  });

  it('renders all footer legal links inside navigation landmark', () => {
    render(
      <LocaleProvider initialLocale="en">
        <WelcomeStage mode="sanctuary" />
      </LocaleProvider>,
    );

    const legalNav = screen.getByRole('navigation', { name: /Legal and guidelines/i });
    expect(legalNav).toBeDefined();

    expect(screen.getByRole('link', { name: /Privacy/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Terms/i })).toBeDefined();
  });
});
