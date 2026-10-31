import { Launcher } from '@repo/ui/components/web';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const ITEMS = [
  { id: 'att', title: 'Attendance', description: 'Mark today', group: 'Teaching' },
  { id: 'fees', title: 'Fees', description: 'Payments', group: 'Records' },
];

describe('web kit: Launcher', () => {
  it('a named region of tiles by kind; open, keep and search', async () => {
    const onOpen = vi.fn();
    const onKeep = vi.fn();
    render(<Launcher label="Workspace tools" items={ITEMS} onOpen={onOpen} onKeep={onKeep} />);
    expect(screen.getByRole('region', { name: 'Workspace tools' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Teaching' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /^Attendance/ }));
    expect(onOpen).toHaveBeenCalledWith('att');
    await userEvent.click(screen.getByRole('button', { name: 'Keep in tabs: Fees' }));
    expect(onKeep).toHaveBeenCalledWith('fees');
    expect(screen.getByText('Fees kept in tabs')).toBeTruthy();
    await userEvent.type(screen.getByRole('searchbox'), 'pay');
    expect(screen.getByText('1 result')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Attendance/ })).toBeNull();
  });
});
