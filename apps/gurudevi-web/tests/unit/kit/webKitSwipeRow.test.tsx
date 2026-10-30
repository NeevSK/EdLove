import { SwipeRow } from '@repo/ui/components/web';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('web kit: SwipeRow', () => {
  it('is a named group whose actions are real buttons, reachable by keyboard', async () => {
    const onDone = vi.fn();
    const onDelete = vi.fn();
    render(
      <SwipeRow
        label="Buy chalk"
        start={{ label: 'Done', tone: 'success', onAction: onDone }}
        end={{ label: 'Delete', tone: 'danger', onAction: onDelete }}
      >
        <span>Buy chalk</span>
      </SwipeRow>,
    );
    screen.getByRole('group', { name: 'Buy chalk' });
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Done' }));
    await userEvent.keyboard('{Enter}');
    expect(onDone).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
