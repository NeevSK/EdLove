import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/browser', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  init: vi.fn(),
  setUser: vi.fn(),
}));

import { BrowserSentryTelemetryAdapter } from '@repo/core/adapters/web/SentryTelemetryAdapter';
import * as BrowserSentry from '@sentry/browser';

describe('BrowserSentryTelemetryAdapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('initializes without default PII collection', () => {
    new BrowserSentryTelemetryAdapter().init({
      dsn: 'https://example.invalid/1',
      environment: 'test',
      release: 'test@1',
    });

    expect(BrowserSentry.init).toHaveBeenCalledWith(
      expect.objectContaining({ sendDefaultPii: false }),
    );
  });

  it('redacts sensitive context and explicit user PII', () => {
    const adapter = new BrowserSentryTelemetryAdapter();
    adapter.captureException(new Error('boom'), {
      operation: 'save_profile',
      user_id: 'user-1',
      school_id: 'school-1',
    });
    adapter.setUser({ id: 'user-1', email: 'teacher@example.com', username: 'Teacher' });

    expect(BrowserSentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
      extra: { operation: 'save_profile' },
    });
    expect(BrowserSentry.setUser).toHaveBeenCalledWith({ id: 'user-1' });
  });
});
