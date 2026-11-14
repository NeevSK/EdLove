import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';
import { LocaleProvider, useTranslation, getTranslation } from '../../lib/i18n';
import { LanguagePicker } from '@repo/ui/components/web';

function TestConsumer() {
  const { t, locale, setLocale } = useTranslation();
  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="brand-name">{t('brand.name')}</span>
      <span data-testid="tagline">{t('brand.sanctuaryTagline')}</span>
      <span data-testid="reflection-title">{t('learningReflection.title')}</span>
      <span data-testid="recheck-due">{t('reframe.savedRecheckDue', { hours: 6 })}</span>
      <button data-testid="switch-si" onClick={() => setLocale('si')} type="button">
        Switch Sinhala
      </button>
      <button data-testid="switch-ta" onClick={() => setLocale('ta')} type="button">
        Switch Tamil
      </button>
      <button data-testid="switch-en" onClick={() => setLocale('en')} type="button">
        Switch English
      </button>
    </div>
  );
}

describe('In-Place Multilingual Localization Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.removeAttribute('data-locale');
  });

  it('renders default English translations without full-page navigation', () => {
    render(
      <LocaleProvider initialLocale="en">
        <TestConsumer />
      </LocaleProvider>,
    );

    expect(screen.getByTestId('current-locale').textContent).toBe('en');
    expect(screen.getByTestId('brand-name').textContent).toBe('Gurudevi');
    expect(screen.getByTestId('reflection-title').textContent).toBe('Learning Reflection');
    expect(screen.getByTestId('recheck-due').textContent).toContain('6 hour');
  });

  it('switches to Sinhala in-place and updates DOM root attributes', async () => {
    const user = userEvent.setup();

    render(
      <LocaleProvider initialLocale="en">
        <TestConsumer />
      </LocaleProvider>,
    );

    await user.click(screen.getByTestId('switch-si'));

    expect(screen.getByTestId('current-locale').textContent).toBe('si');
    expect(screen.getByTestId('brand-name').textContent).toBe('ගුරුදෙවි');
    expect(screen.getByTestId('tagline').textContent).toBe('සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');
    expect(document.documentElement.lang).toBe('si');
    expect(document.documentElement.getAttribute('data-locale')).toBe('si');
  });

  it('switches to Tamil in-place and updates DOM root attributes', async () => {
    const user = userEvent.setup();

    render(
      <LocaleProvider initialLocale="en">
        <TestConsumer />
      </LocaleProvider>,
    );

    await user.click(screen.getByTestId('switch-ta'));

    expect(screen.getByTestId('current-locale').textContent).toBe('ta');
    expect(screen.getByTestId('brand-name').textContent).toBe('குருதெவி');
    expect(screen.getByTestId('tagline').textContent).toBe('கல்வியின் உயிரோட்டமான அமைதிச் சோலை');
    expect(document.documentElement.lang).toBe('ta');
    expect(document.documentElement.getAttribute('data-locale')).toBe('ta');
  });

  it('interpolates parameters correctly across languages', () => {
    const enText = getTranslation('en', 'reframe.savedRecheckDue', { hours: 24 });
    const siText = getTranslation('si', 'reframe.savedRecheckDue', { hours: 24 });
    const taText = getTranslation('ta', 'reframe.savedRecheckDue', { hours: 24 });

    expect(enText).toContain('24');
    expect(siText).toContain('24');
    expect(taText).toContain('24');
  });

  function LanguagePickerWrapper() {
    const { locale, setLocale } = useTranslation();
    return (
      <LanguagePicker
        value={locale as 'en' | 'si' | 'ta'}
        onChange={(l) => setLocale(l)}
        variant="dropdown"
      />
    );
  }

  it('unblocks LanguagePicker and switches language reactively', async () => {
    const user = userEvent.setup();

    render(
      <LocaleProvider initialLocale="en">
        <LanguagePickerWrapper />
        <TestConsumer />
      </LocaleProvider>,
    );

    // Click toggle button to open dropdown
    const toggleBtn = screen.getByRole('button', { name: /language selector/i });
    await user.click(toggleBtn);

    // Click Sinhala option
    const sinhalaOption = screen.getByRole('option', { name: /සිංහල/i });
    await user.click(sinhalaOption);

    // Verify in-place update without any blocking toast or navigation
    expect(screen.getByTestId('current-locale').textContent).toBe('si');
    expect(screen.getByTestId('brand-name').textContent).toBe('ගුරුදෙවි');
    expect(document.documentElement.lang).toBe('si');
  });

  it('strictly enforces sacred orthographic invariants', () => {
    const siBrand = getTranslation('si', 'brand.name');
    const taBrand = getTranslation('ta', 'brand.name');
    const siTagline = getTranslation('si', 'brand.sanctuaryTagline');

    // Short-vowel checks
    expect(siBrand).toBe('ගුරුදෙවි');
    expect(siBrand).not.toMatch(/ගුරුදේවි|ගුරුදේවී/);
    expect(taBrand).toBe('குருதெவி');
    expect(taBrand).not.toMatch(/குருதேவி|குருதேவீ/);

    // Tagline checks
    expect(siTagline).toBe('සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');
    expect(siTagline).not.toMatch(/සුරක්ෂිත කෙම්බිම|සමෝධානික|සමෝදානිත/);
  });
});
