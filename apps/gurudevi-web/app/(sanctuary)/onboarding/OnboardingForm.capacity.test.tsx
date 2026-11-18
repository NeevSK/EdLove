import { fireEvent, screen } from '@testing-library/react';
import { render } from '@/tests/support/render';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../auth/browserAuth', () => ({ browserAuthRuntime: () => null }));

import { OnboardingForm } from './OnboardingForm';

describe('primary capacity selection', () => {
  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true }),
    });
    window.scrollTo = vi.fn();
  });

  it('requires an explicit role selection before continuing', () => {
    render(<OnboardingForm />);
    fireEvent.change(screen.getByLabelText('Preferred name'), { target: { value: 'Sam' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    const teacher = screen.getByRole('radio', { name: /teacher/i }) as HTMLInputElement;
    const continueButton = screen.getByRole('button', { name: /continue/i }) as HTMLButtonElement;
    expect(teacher.checked).toBe(false);
    expect(continueButton.disabled).toBe(true);
    fireEvent.click(teacher);
    expect(continueButton.disabled).toBe(false);
  });

  it('supports selecting the principal & leader role and advancing', () => {
    render(<OnboardingForm />);
    fireEvent.change(screen.getByLabelText('Preferred name'), { target: { value: 'Dr. Silva' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    const principal = screen.getByRole('radio', { name: /principal/i }) as HTMLInputElement;
    const continueButton = screen.getByRole('button', { name: /continue/i }) as HTMLButtonElement;
    expect(principal.checked).toBe(false);
    fireEvent.click(principal);
    expect(principal.checked).toBe(true);
    expect(continueButton.disabled).toBe(false);
    fireEvent.click(continueButton);
    expect(screen.getByText(/create your account with tutii/i)).toBeDefined();
  });
});
