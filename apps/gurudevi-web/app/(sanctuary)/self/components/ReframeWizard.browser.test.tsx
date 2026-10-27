import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ReframeWizard } from './ReframeWizard';

describe('ReframeWizard browser adapter', () => {
  afterEach(() => window.localStorage.clear());

  it('persists every completed reflection field in the signed-in account namespace', async () => {
    render(<ReframeWizard userId="account-a" />);

    fireEvent.change(screen.getByPlaceholderText(/didn't finish grading/i), {
      target: { value: 'I will not finish in time.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.change(screen.getByPlaceholderText(/overwhelmed/i), {
      target: { value: 'Overwhelmed' },
    });
    fireEvent.click(screen.getByRole('button', { name: /spot the trap/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Catastrophizing' }));
    fireEvent.click(screen.getByRole('button', { name: /balanced reframe/i }));
    fireEvent.change(screen.getByPlaceholderText(/one incomplete stack/i), {
      target: { value: 'I can finish the essential work first.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /anchor reframe/i }));

    expect(await screen.findByText('Perspective Restored')).toBeTruthy();
    expect(window.localStorage.getItem('gurudevi:web:self:v1:thoughts:account-a')).toContain(
      'I can finish the essential work first.',
    );
  });
});
