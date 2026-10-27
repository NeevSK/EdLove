import { showToast } from '@repo/core/lib/feedback';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { act, render } from '@testing-library/react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../providers/ToastProvider';

afterEach(() => {
  vi.useRealTimers();
});
describe('canonical feedback host', () => {
  it('clears outgoing account feedback when scoped state is reset', async () => {
    vi.useFakeTimers();
    const view = await render(<ToastProvider>{null}</ToastProvider>);
    await act(async () => {
      showToast('Outgoing account', 'info');
    });
    expect(view.getByText('Outgoing account')).toBeTruthy();
    await act(async () => {
      sovereignBus.emit('feedback:clear', {});
    });
    expect(view.queryByText('Outgoing account')).toBeNull();
    await view.unmount();
  });
  it('renders imperative requests without auth state and retains the requested duration', async () => {
    vi.useFakeTimers();
    const view = await render(<ToastProvider>{null}</ToastProvider>);
    await act(async () => {
      showToast('Saved offline', 'info', 5000);
    });
    expect(view.getByText('Saved offline')).toBeTruthy();
    await act(async () => {
      vi.advanceTimersByTime(4999);
    });
    expect(view.getByText('Saved offline')).toBeTruthy();
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(view.queryByText('Saved offline')).toBeNull();
    await view.unmount();
  });
  it('releases its bus listener before a replacement host mounts', async () => {
    vi.useFakeTimers();
    const first = await render(<ToastProvider>{null}</ToastProvider>);
    await act(async () => {
      showToast('Outgoing', 'success');
    });
    expect(first.getByText('Outgoing')).toBeTruthy();
    await first.unmount();
    await act(async () => {
      showToast('No host', 'error');
    });
    const replacement = await render(<ToastProvider>{null}</ToastProvider>);
    expect(replacement.queryByText('No host')).toBeNull();
    await act(async () => {
      showToast('Incoming', 'info');
    });
    expect(replacement.getAllByText('Incoming')).toHaveLength(1);
    await replacement.unmount();
  });
});
