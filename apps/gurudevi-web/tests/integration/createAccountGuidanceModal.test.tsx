import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateAccountGuidanceModal } from '@/app/(sanctuary)/profile/CreateAccountGuidanceModal';

describe('CreateAccountGuidanceModal Integration (G1 boundary / jsdom)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('does not render when isOpen is false', () => {
    render(<CreateAccountGuidanceModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal with role title, sandbox comparison, and sovereign account details', () => {
    render(
      <CreateAccountGuidanceModal
        isOpen={true}
        onClose={vi.fn()}
        exploreRoleTitle="Cognitive Scientist"
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /step into your sovereign sanctuary/i })).toBeTruthy();
    expect(screen.getByText(/Cognitive Scientist/i)).toBeTruthy();

    // Check comparison columns
    expect(screen.getByRole('heading', { level: 3, name: /explore sandbox/i })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: /verified sanctuary/i })).toBeTruthy();
    expect(screen.getByText(/Immutable UUIDv8 account/i)).toBeTruthy();
  });

  it('toggles sandbox data carryover preference and writes to localStorage', async () => {
    const user = userEvent.setup();
    render(<CreateAccountGuidanceModal isOpen={true} onClose={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    // Uncheck carryover
    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(window.localStorage.getItem('gurudevi_preserve_guest_on_signup')).toBeNull();

    // Sign up link should not have query param
    const signUpLink = screen.getByRole('link', { name: /create sovereign account ↗/i });
    expect(signUpLink.getAttribute('href')).toBe('https://sanctuary.gurudevi.app/sign-up');

    // Check carryover back on
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(window.localStorage.getItem('gurudevi_preserve_guest_on_signup')).toBe('true');
    expect(signUpLink.getAttribute('href')).toContain('preserve_guest=1');
  });

  it('invokes onClose when clicking close button or keep exploring button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<CreateAccountGuidanceModal isOpen={true} onClose={onClose} />);

    // Click keep exploring button
    const keepExploringBtn = screen.getByRole('button', { name: /keep exploring sandbox/i });
    await user.click(keepExploringBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click close icon button
    const closeIconBtn = screen.getByRole('button', { name: /close guidance dialog/i });
    await user.click(closeIconBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
