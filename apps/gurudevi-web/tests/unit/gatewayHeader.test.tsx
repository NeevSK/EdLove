import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GatewayHeader } from '../../app/(sanctuary)/components/GatewayHeader';
import { LocaleProvider } from '../../lib/i18n';

describe('GatewayHeader canonical web component', () => {
  it('renders default brand link, language picker, and theme toggle', () => {
    render(
      <LocaleProvider initialLocale="en">
        <GatewayHeader />
      </LocaleProvider>,
    );

    // Brand link
    const brandLink = screen.getByRole('link', { name: /Gurudevi welcome/i });
    expect(brandLink).toBeDefined();
    expect(brandLink.getAttribute('href')).toBe('/welcome');

    // Language picker should be present
    const langPicker = screen.getByRole('radiogroup', { name: /Language selector/i });
    expect(langPicker).toBeDefined();

    // Theme toggle button should be present
    const themeBtn = screen.getByRole('button', { name: /World:.*Change appearance/i });
    expect(themeBtn).toBeDefined();
  });

  it('renders extra contextual action items cleanly alongside standard controls', () => {
    render(
      <LocaleProvider initialLocale="en">
        <GatewayHeader
          extraActions={<span data-testid="guest-house-link">Guest House</span>}
        />
      </LocaleProvider>,
    );

    expect(screen.getByTestId('guest-house-link')).toBeDefined();
    expect(screen.getByRole('button', { name: /World:.*Change appearance/i })).toBeDefined();
  });

  it('allows suppressing language or theme controls via boolean flags', () => {
    render(
      <LocaleProvider initialLocale="en">
        <GatewayHeader showLanguage={false} showTheme={false} />
      </LocaleProvider>,
    );

    expect(screen.queryByRole('button', { name: /World:.*Change appearance/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Language selector/i })).toBeNull();
    expect(screen.queryByRole('radiogroup', { name: /Language selector/i })).toBeNull();
  });

  it('supports custom homeHref', () => {
    render(
      <LocaleProvider initialLocale="en">
        <GatewayHeader homeHref="/custom-home" />
      </LocaleProvider>,
    );

    const brandLink = screen.getByRole('link', { name: /Gurudevi welcome/i });
    expect(brandLink.getAttribute('href')).toBe('/custom-home');
  });
});
