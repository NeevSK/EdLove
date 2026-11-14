import { AppHeader, NotificationItem, SwitchRow } from '@repo/ui/components/web';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('web kit: NotificationItem', () => {
  it('says Unread to screen readers, opens, and offers mark-as-read', async () => {
    const onPress = vi.fn();
    const onMarkRead = vi.fn();
    render(
      <NotificationItem
        title="New submission"
        time="9:41"
        unread
        onPress={onPress}
        onMarkRead={onMarkRead}
      />,
    );
    const open = screen.getByRole('button', { name: /Unread: New submission/ });
    await userEvent.click(open);
    expect(onPress).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    expect(onMarkRead).toHaveBeenCalled();
  });

  it('a read item offers no mark-as-read', () => {
    render(
      <NotificationItem title="Saved" time="Yesterday" unread={false} onMarkRead={() => {}} />,
    );
    expect(screen.queryByRole('button', { name: 'Mark as read' })).toBeNull();
  });
});

describe('web kit: SwitchRow and the compact header', () => {
  it('the whole row is one switch, described by its hint', async () => {
    const onChange = vi.fn();
    render(<SwitchRow label="Sound effects" hint="Quiet clicks" value onChange={onChange} />);
    const row = screen.getByRole('switch', { name: 'Sound effects' });
    expect(row.getAttribute('aria-checked')).toBe('true');
    expect(row.getAttribute('aria-describedby')).toBe(screen.getByText('Quiet clicks').id);
    await userEvent.click(row);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('a compact header keeps its title as the heading with the perspective beside it', () => {
    render(
      <AppHeader
        compact
        title="Workspace"
        subtitle="Grade 7B"
        perspective={{ label: 'Royal College', onPress: () => {}, beside: true }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Workspace' }).className).toBe(
      'gd-app-header-title',
    );
    expect(screen.getByRole('button', { name: 'Royal College' })).toBeTruthy();
    expect(screen.getByText('Grade 7B')).toBeTruthy();
  });
});
