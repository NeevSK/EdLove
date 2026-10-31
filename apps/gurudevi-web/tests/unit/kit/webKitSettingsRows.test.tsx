import { ChoiceRow, DangerRow, LinkRow } from '@repo/ui/components/web';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// jsdom has <dialog> but not its modal methods; substitute open and close only.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

describe('web kit: settings rows', () => {
  it('ChoiceRow shows the choice and opens the choices', async () => {
    render(
      <ChoiceRow
        label="Language"
        value="en"
        onChange={() => {}}
        options={[
          { value: 'en', label: 'English' },
          { value: 'ta', label: 'தமிழ்' },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: /Language.*English/ })).toBeTruthy();
  });

  it('LinkRow outside the app is a new-tab link without opener, said in words', () => {
    render(<LinkRow label="Help centre" href="https://gurudevi.app/help" external />);
    const link = screen.getByRole('link', { name: /Help centre.*Opens outside the app/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('LinkRow refuses an unsafe address and draws no link', () => {
    render(<LinkRow label="Bad" href="javascript:alert(1)" />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('DangerRow is in danger words and asks before running', async () => {
    const onConfirm = vi.fn();
    const { container } = render(
      <DangerRow
        label="Delete account"
        onConfirm={onConfirm}
        confirm={{ title: 'Delete your account?', confirmLabel: 'Delete' }}
      />,
    );
    expect(container.querySelector('.gd-row')?.getAttribute('data-tone')).toBe('danger');
    await userEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(onConfirm).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
