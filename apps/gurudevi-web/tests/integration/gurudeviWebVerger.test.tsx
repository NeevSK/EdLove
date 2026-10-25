import { act, render, screen, waitFor } from '@testing-library/react';
import { useVerger } from '@repo/verger-react';
import { afterEach, describe, expect, it } from 'vitest';
import { GurudeviWebVerger } from '../../lib/runtime/GurudeviWebVerger';
import { useGurudeviView } from '../../lib/runtime/useGurudeviView';

function Probe() {
  const view = useGurudeviView();
  return <output data-testid="view">{view === null ? 'unknown' : view.experience.deviceTier}</output>;
}

describe('GurudeviWebVerger (G3, jsdom)', () => {
  it('runs in a browser without matchMedia, Network Information or Battery Status', async () => {
    // jsdom has none of them: verger must still bind and publish its floors.
    expect(typeof window.matchMedia).toBe('undefined');
    render(
      <GurudeviWebVerger>
        <Probe />
      </GurudeviWebVerger>,
    );
    // Hidden memory is unknown, which is never a limit (read as medium).
    await waitFor(() => expect(screen.getByTestId('view').textContent).toBe('medium'));
  });

  it('outside verger the view is unknown, so nothing optional is requested', () => {
    render(<Probe />);
    expect(screen.getByTestId('view').textContent).toBe('unknown');
  });

  describe('the kill switch, read live (R8)', () => {
    afterEach(() => {
      globalThis.__GURUDEVI_RUNTIME_MODE__ = undefined;
    });

    it('set after the page loaded, verger stops the next time the page is shown; the floors remain', async () => {
      const seen: { verger: ReturnType<typeof useVerger> } = { verger: null };
      function Grab() {
        seen.verger = useVerger();
        return null;
      }
      render(
        <GurudeviWebVerger>
          <Grab />
          <Probe />
        </GurudeviWebVerger>,
      );
      // A test build is a development build: the lab runs verger.
      await waitFor(() => expect(seen.verger?.activation).not.toBeNull());
      globalThis.__GURUDEVI_RUNTIME_MODE__ = 'off';
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await waitFor(() => expect(seen.verger?.activation).toBeNull());
      expect(seen.verger?.getSnapshot()).not.toBeNull();
      expect(screen.getByTestId('view').textContent).toBe('medium');
    });
  });
});
