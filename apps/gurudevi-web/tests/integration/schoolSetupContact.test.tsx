import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SchoolSetupContact } from '../../app/(sanctuary)/workspace/SchoolSetupContact';

describe('school contact', () => {
  it('prepares optional details for WhatsApp without claiming delivery', () => {
    render(<SchoolSetupContact phone="94123456789" />);
    fireEvent.click(screen.getByText('Contact us on WhatsApp'));
    fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'A & B School' } });
    const link = screen.getByRole('link', { name: 'Open WhatsApp' });
    const url = new URL(link.getAttribute('href')!);
    expect(url.hostname).toBe('wa.me');
    expect(url.pathname).toBe('/94123456789');
    expect(url.searchParams.get('text')).toContain('School: A & B School');
    expect(url.searchParams.get('text')).not.toContain('Principal:');
    fireEvent.click(link);
    expect(screen.getByRole('status').textContent).toContain('Send the message in WhatsApp');
  });
});
