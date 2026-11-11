import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { NetworkError, OfflineMutationError, UnauthorizedError } from '@repo/core/effect/Errors';
import { Schema } from 'effect';
import i18next from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import en from '../../logic/i18n/locales/en.json';
import si from '../../logic/i18n/locales/si.json';
import ta from '../../logic/i18n/locales/ta.json';

const mocks = vi.hoisted(() => ({ showToast: vi.fn(), captureException: vi.fn() }));
vi.mock('@repo/core/lib/feedback', () => ({ showToast: mocks.showToast }));
vi.mock('@repo/core/monitoring', () => ({ captureException: mocks.captureException }));

import {
  DEFECT_FEEDBACK,
  FEEDBACK,
  feedbackFor,
  presentFailure,
} from '@repo/core/lib/failureFeedback';

const SRC = resolve(__dirname, '../..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === '__tests__' || name === 'node_modules' ? [] : sourceFiles(path);
    }
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

function lookup(locale: unknown, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        typeof node === 'object' && node !== null ? Reflect.get(node, part) : undefined,
      locale,
    );
}

beforeEach(() => {
  mocks.showToast.mockClear();
  mocks.captureException.mockClear();
});

describe('failure feedback', { tags: ['fast'] }, () => {
  it('has an entry for every Schema.TaggedError declared in @repo/core', () => {
    const declared = new Set<string>();
    for (const file of sourceFiles(SRC)) {
      for (const match of readFileSync(file, 'utf8').matchAll(
        /Schema\.TaggedError<\w+>\(\)\(\s*'(\w+)'/g,
      )) {
        declared.add(match[1] ?? '');
      }
    }
    // OnboardingCommandError is the onboarding client's own command result, shown by its screen.
    declared.delete('OnboardingCommandError');
    expect(declared.size).toBeGreaterThanOrEqual(23);
    const missing = [...declared].filter((tag) => !Object.hasOwn(FEEDBACK, tag));
    expect(missing).toEqual([]);
  });

  it('uses message keys that exist in English, Sinhala and Tamil', () => {
    const keys = new Set([...Object.values(FEEDBACK), DEFECT_FEEDBACK].map((f) => f.messageKey));
    for (const key of keys) {
      for (const [name, locale] of Object.entries({ en, si, ta })) {
        expect(typeof lookup(locale, key), `${key} in ${name}`).toBe('string');
      }
    }
  });

  it('maps tagged failures by tag, also after a JSON round trip', () => {
    const offline = new OfflineMutationError({ operation: 'attendance.record' });
    expect(feedbackFor(offline)).toBe(FEEDBACK.OfflineMutationError);
    const wire = Schema.encodeUnknownSync(Schema.toCodecJson(UnauthorizedError))(
      new UnauthorizedError({ message: 'token expired' }),
    );
    expect(feedbackFor(JSON.parse(JSON.stringify(wire)))).toBe(FEEDBACK.UnauthorizedError);
  });

  it('treats anything else as a defect: reported, with a generic message', () => {
    const feedback = presentFailure(new Error('relation "users" does not exist'), 'profile.save');
    expect(feedback).toBe(DEFECT_FEEDBACK);
    expect(mocks.captureException).toHaveBeenCalledTimes(1);
    expect(mocks.showToast).toHaveBeenCalledWith('Something went wrong', 'error');
  });

  it('never shows the technical message of an expected failure', () => {
    presentFailure(new NetworkError({ cause: new Error('ECONNRESET'), url: 'https://x' }));
    expect(mocks.showToast).toHaveBeenCalledWith('Something went wrong', 'error');
    expect(mocks.captureException).not.toHaveBeenCalled();
  });

  it('shows queued work as information, not as an error', () => {
    presentFailure(new OfflineMutationError({}));
    expect(mocks.showToast).toHaveBeenCalledWith(
      "Saved. It will be sent when you're back online.",
      'info',
    );
  });

  it("speaks the person's language once i18n is running", async () => {
    await i18next.init({
      lng: 'si',
      fallbackLng: 'en',
      resources: { en: { translation: en }, si: { translation: si } },
    });
    presentFailure(new UnauthorizedError({}));
    expect(mocks.showToast).toHaveBeenCalledWith(si.errors.signInAgain, 'error');
  });
});
