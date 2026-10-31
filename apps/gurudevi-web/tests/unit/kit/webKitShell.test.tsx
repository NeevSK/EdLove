import { AppHeader } from '@repo/ui/components/web';
import type { KitIconProps } from '@repo/ui/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function Glyph(_: KitIconProps) {
  return <svg aria-hidden />;
}

describe('web kit: AppHeader', () => {
  it('is a banner with the usual places and the title as the heading', async () => {
    const onBack = vi.fn();
    render(
      <AppHeader
        title="Grade 7B"
        eyebrow="Good morning"
        leading={{ kind: 'back', label: 'Go back', onPress: onBack }}
        actions={[{ key: 'qr', label: 'Scan QR code', icon: Glyph, onPress: () => {} }]}
        ruled
      />,
    );
    expect(screen.getByRole('banner').hasAttribute('data-ruled')).toBe(true);
    expect(screen.getByRole('heading', { level: 1, name: 'Grade 7B' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('a count is said in the name; a toggle says whether it is open; search is labelled', async () => {
    const onChange = vi.fn();
    render(
      <AppHeader
        title="Library"
        actions={[
          { key: 'search', label: 'Close search', icon: Glyph, onPress: () => {}, expanded: true },
          {
            key: 'bell',
            label: 'Notifications',
            icon: Glyph,
            onPress: () => {},
            badge: 3,
            badgeLabel: '3 unread',
          },
        ]}
        search={{ open: true, value: '', onChange, label: 'Search the library' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Notifications, 3 unread' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close search' }).getAttribute('aria-expanded')).toBe(
      'true',
    );
    const search = screen.getByRole('searchbox', { name: 'Search the library' });
    expect(document.activeElement).toBe(search);
    await userEvent.type(search, 'l');
    expect(onChange).toHaveBeenCalledWith('l');
  });

  it('a perspective takes the title place; the page keeps its heading for screen readers', async () => {
    const onSwitch = vi.fn();
    render(
      <AppHeader title="Workspace" perspective={{ label: 'Royal College', onPress: onSwitch }} />,
    );
    expect(screen.getByRole('heading', { name: 'Workspace' }).className).toContain(
      'gd-visually-hidden',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Royal College' }));
    expect(onSwitch).toHaveBeenCalled();
  });
});
