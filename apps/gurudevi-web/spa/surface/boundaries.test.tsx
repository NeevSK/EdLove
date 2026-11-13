import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestRouter, render } from '@/tests/support/render';
import { PageNotFound, RouteError } from './boundaries';

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('route boundaries (G3 / jsdom; in-memory router)', () => {
  it('offers to try again, resetting the route and reloading its data', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const router = createTestRouter('/self');
    const invalidate = vi.spyOn(router, 'invalidate');
    const reset = vi.fn();
    render(<RouteError error={new Error('boom')} reset={reset} />, { router });
    expect(screen.getByRole('alert').textContent).toMatch(/could not open/i);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledOnce();
  });

  it('tells a tab on the previous release that Gurudevi was updated', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    // Already reloaded this minute, so it shows the message instead of reloading again.
    sessionStorage.setItem('gurudevi_stale_build_reload', String(Date.now()));
    render(
      <RouteError
        error={new TypeError('Failed to fetch dynamically imported module: /assets/a.js')}
        reset={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert').textContent).toMatch(/has been updated/i);
  });

  it('sends a lost visitor home', async () => {
    const router = createTestRouter('/no-such-place');
    render(<PageNotFound />, { router });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Go to Gurudevi' }));
    expect(router.history.location.pathname).toBe('/');
  });
});
