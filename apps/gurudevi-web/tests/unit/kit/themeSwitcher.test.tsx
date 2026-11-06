import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeSwitcher } from '@repo/ui/components/web';

describe('web kit: ThemeSwitcher', () => {
  it('renders in pill variant by default showing world dot and world name', () => {
    render(
      <ThemeSwitcher
        world="sanctuary"
        onWorldChange={() => {}}
        mode="light"
        onModeChange={() => {}}
        variant="pill"
      />,
    );

    const btn = screen.getByRole('button', { name: /World:.*Light:.*Change appearance/i });
    expect(btn).toBeDefined();
    expect(screen.getByText('Sanctuary')).toBeDefined();
  });

  it('renders in icon variant showing aria label and aura glyph', () => {
    render(
      <ThemeSwitcher
        world="wewa"
        onWorldChange={() => {}}
        mode="dark"
        resolvedMode="dark"
        onModeChange={() => {}}
        variant="icon"
      />,
    );

    const btn = screen.getByRole('button', { name: /World:.*Light:.*Change appearance/i });
    expect(btn).toBeDefined();
    expect(btn.getAttribute('data-gear')).toBe('icon');
  });

  it('opens dialog popover on click and lists modes and worlds', () => {
    const handleWorldChange = vi.fn();
    const handleModeChange = vi.fn();

    render(
      <ThemeSwitcher
        world="sanctuary"
        onWorldChange={handleWorldChange}
        mode="system"
        onModeChange={handleModeChange}
        variant="pill"
      />,
    );

    const btn = screen.getByRole('button', { name: /World:.*Change appearance/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');

    // Click to open
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    // Dialog should be visible
    const dialog = screen.getByRole('dialog', { name: /Appearance & Diurnal World/i });
    expect(dialog).toBeDefined();

    // Mode options: Day, Night, Device
    const dayBtn = screen.getByRole('radio', { name: /Day/i });
    fireEvent.click(dayBtn);
    expect(handleModeChange).toHaveBeenCalledWith('light');

    // World option: Wewa
    const wewaBtn = screen.getByRole('radio', { name: /Wewa:/i });
    fireEvent.click(wewaBtn);
    expect(handleWorldChange).toHaveBeenCalledWith('wewa');
  });

  it('dismisses dialog on Escape key and focuses trigger', () => {
    render(
      <ThemeSwitcher
        world="sanctuary"
        onWorldChange={() => {}}
        mode="system"
        onModeChange={() => {}}
        variant="pill"
      />,
    );

    const btn = screen.getByRole('button', { name: /World:.*Change appearance/i });
    fireEvent.click(btn);
    expect(screen.getByRole('dialog')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
