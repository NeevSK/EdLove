import {
  Dialog,
  Popover,
  Sheet,
  SidePanel,
  ToastHost,
  Tooltip,
  toast,
} from '@repo/ui/components/web';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// jsdom has <dialog> but not its modal methods. Substitute the open/close part
// only; focus trapping, inertness and ::backdrop need a real browser (G4).
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  act(() => {
    toast.dismissAll();
  });
});

describe('web kit: Dialog', () => {
  it('is a modal dialog named by its title and described by its description', () => {
    render(
      <Dialog open onClose={() => {}} title="Leave the class?" description="Your notes stay." />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Leave the class?' });
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(screen.getByRole('heading', { name: 'Leave the class?' })).toBeTruthy();
    expect(dialog.getAttribute('aria-describedby')).toBe(screen.getByText('Your notes stay.').id);
  });

  it('Escape and the backdrop dismiss; when not dismissable only an action can close it', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Dialog open onClose={onClose} title="Note" />);
    const dialog = screen.getByRole('dialog', { name: 'Note' });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(2);
    rerender(<Dialog open onClose={onClose} title="Note" dismissable={false} />);
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('a click inside the panel does not dismiss', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="Note" description="Inside" />);
    fireEvent.click(screen.getByText('Inside'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when `open` turns false', () => {
    const { rerender } = render(<Dialog open onClose={() => {}} title="Note" />);
    rerender(<Dialog open={false} onClose={() => {}} title="Note" />);
    expect(screen.getByRole('dialog', { hidden: true }).hasAttribute('open')).toBe(false);
  });
});

describe('web kit: Sheet', () => {
  it('is a named modal dialog laid out as a sheet, with a grabber when dismissable', () => {
    const { container } = render(<Sheet open onClose={() => {}} title="Choose a class" />);
    const sheet = screen.getByRole('dialog', { name: 'Choose a class' });
    expect(sheet.className).toContain('gd-sheet');
    expect(container.querySelector('.gd-sheet-grabber')).not.toBeNull();
  });
});

describe('web kit: SidePanel', () => {
  it('is a named modal dialog laid out as a side panel, on the end edge by default', () => {
    render(<SidePanel open onClose={() => {}} title="Lesson notes" />);
    const panel = screen.getByRole('dialog', { name: 'Lesson notes' });
    expect(panel.className).toContain('gd-side-panel');
    expect(panel.getAttribute('data-side')).toBe('end');
    expect(screen.getByRole('heading', { name: 'Lesson notes' })).toBeTruthy();
  });

  it('comes from the start edge when asked', () => {
    render(<SidePanel open onClose={() => {}} title="Filters" side="start" />);
    expect(screen.getByRole('dialog', { name: 'Filters' }).getAttribute('data-side')).toBe('start');
  });

  it('Escape closes it, unless only `open` may', () => {
    const onClose = vi.fn();
    const { rerender } = render(<SidePanel open onClose={onClose} title="Filters" />);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<SidePanel open onClose={onClose} title="Filters" dismissable={false} />);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('web kit: ToastHost', () => {
  it('announces news politely and failures assertively, and runs an action', async () => {
    const undo = vi.fn();
    render(<ToastHost />);
    act(() => {
      toast.show({ message: 'Saved' });
      toast.show({ message: 'Could not sync', tone: 'danger' });
      toast.show({ message: 'Deleted', action: { label: 'Undo', onPress: undo } });
    });
    expect(screen.getByRole('status').textContent).toContain('Saved');
    expect(screen.getByRole('alert').textContent).toContain('Could not sync');
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(undo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Deleted')).toBeNull();
  });
});

describe('web kit: ToastHost stack', () => {
  it('gathers several, newest in front, and fans out on hover', async () => {
    const { container } = render(<ToastHost />);
    act(() => {
      toast.show({ message: 'First' });
      toast.show({ message: 'Second' });
    });
    const first = screen.getByText('First').closest('.gd-toast');
    expect(first?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('Second').closest('.gd-toast')?.hasAttribute('aria-hidden')).toBe(false);
    fireEvent.mouseEnter(container.querySelector('.gd-toasts') as Element);
    expect(first?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('puts banners at the top, counts repeats under one key, and lets Escape dismiss the newest', () => {
    render(<ToastHost />);
    act(() => {
      toast.show({ message: 'Offline', size: 'banner' });
      toast.show({ message: 'Retrying', key: 'sync' });
      toast.show({ message: 'Retrying', key: 'sync' });
    });
    expect(screen.getByText('Offline').closest('.gd-toast')?.classList.contains('gd-toast-banner')).toBe(true);
    expect(screen.getByText('×2')).toBeTruthy();
    fireEvent.keyDown(screen.getByText('Retrying'), { key: 'Escape' });
    expect(screen.queryByText('Retrying')).toBeNull();
    expect(screen.getByText('Offline')).toBeTruthy();
  });
});

describe('web kit: Tooltip', () => {
  it('describes its control, and Escape hides it without moving focus', async () => {
    const { container } = render(
      <Tooltip label="Mark everyone present">
        <button type="button" aria-label="All present" />
      </Tooltip>,
    );
    const control = screen.getByRole('button', { name: 'All present' });
    expect(control.getAttribute('aria-describedby')).toBe(
      screen.getByRole('tooltip', { hidden: true }).id,
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(control);
    await userEvent.keyboard('{Escape}');
    expect(container.querySelector('.gd-tipwrap')?.hasAttribute('data-dismissed')).toBe(true);
    expect(document.activeElement).toBe(control);
  });
});

function PopoverDemo({ onClose }: { onClose: () => void }) {
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchor} type="button">
        Options
      </button>
      <Popover open onClose={onClose} label="Class options" anchorRef={anchor}>
        <button type="button">Rename</button>
      </Popover>
    </>
  );
}

describe('web kit: Popover', () => {
  it('opens as a named panel, takes focus, and Escape closes it back to the anchor', async () => {
    const onClose = vi.fn();
    render(<PopoverDemo onClose={onClose} />);
    const panel = screen.getByRole('dialog', { name: 'Class options' });
    expect(document.activeElement).toBe(panel);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Options' }));
  });

  it('a press outside closes it; a press inside does not', () => {
    const onClose = vi.fn();
    render(<PopoverDemo onClose={onClose} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Rename' }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
