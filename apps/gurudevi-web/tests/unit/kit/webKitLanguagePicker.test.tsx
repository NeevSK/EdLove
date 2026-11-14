import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguagePicker } from '@repo/ui/components/web';

describe('webKit LanguagePicker', () => {
  it('renders capsule variant with canonical languages and changes language on click', () => {
    const handleChange = vi.fn();
    render(<LanguagePicker value="en" onChange={handleChange} variant="capsule" />);

    const sinBtn = screen.getByRole('radio', { name: /Sinhala/i });
    expect(sinBtn).toBeDefined();
    expect(sinBtn.getAttribute('aria-checked')).toBe('false');

    const engBtn = screen.getByRole('radio', { name: /English/i });
    expect(engBtn.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(sinBtn);
    expect(handleChange).toHaveBeenCalledWith('si');
  });

  it('renders dropdown variant and opens popout menu on trigger click', () => {
    const handleChange = vi.fn();
    render(<LanguagePicker value="en" onChange={handleChange} variant="dropdown" />);

    const trigger = screen.getByRole('button', { name: /Language selector/i });
    expect(trigger).toBeDefined();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Click trigger to unfold dropdown
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const optionTamil = screen.getByRole('option', { name: /தமிழ்/i });
    expect(optionTamil).toBeDefined();

    fireEvent.click(optionTamil);
    expect(handleChange).toHaveBeenCalledWith('ta');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
