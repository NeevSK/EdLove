import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});
