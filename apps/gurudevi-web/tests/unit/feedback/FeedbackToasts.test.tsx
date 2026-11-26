import { showToast } from '@repo/core/lib/feedback.adapter';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FeedbackToasts } from '../../../app/(sanctuary)/components/FeedbackToasts';

// The kit's toast queue is module state; each test uses its own messages.
afterEach(() => cleanup());

describe('G3 FeedbackToasts: core feedback reaches the web toast region', () => {
  it('shows an info toast politely and a failure assertively', () => {
    render(<FeedbackToasts />);
    act(() => showToast("Saved. It will be sent when you're back online.", 'info'));
    act(() => showToast('Something went wrong', 'error'));
    expect(screen.getByRole('status').textContent).toContain('Saved.');
    expect(screen.getByRole('alert').textContent).toContain('Something went wrong');
  });

  it('stops listening when it unmounts', () => {
    const { unmount } = render(<FeedbackToasts />);
    unmount();
    act(() => showToast('after unmount', 'info'));
    render(<FeedbackToasts />);
    expect(screen.getByRole('status').textContent).not.toContain('after unmount');
  });
});
