import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TutiiSidePanel } from '../../../app/(sanctuary)/components/TutiiSidePanel';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

beforeAll(() => {
  if (typeof window !== 'undefined' && window.HTMLElement) {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }
});

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('TutiiSidePanel (Notion-style Side Panel)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = renderWithClient(
      <TutiiSidePanel
        isOpen={false}
        onClose={vi.fn()}
        pathname="/workspace"
        displayName="Teacher Nimal"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog with header, floor context tag, and tab options when open', () => {
    renderWithClient(
      <TutiiSidePanel
        isOpen={true}
        onClose={vi.fn()}
        pathname="/workspace"
        displayName="Teacher Nimal"
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Tutii Companion Side Panel' })).toBeTruthy();
    expect(screen.getByText('Tutii Companion')).toBeTruthy();
    expect(screen.getByText('Workspace (Teaching & Ops)')).toBeTruthy();

    expect(screen.getByRole('radio', { name: 'Chat' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Subtasks' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Floor Info' })).toBeTruthy();
  });

  it('navigates through tabs: shows Notion-style subtasks and executes on click', async () => {
    renderWithClient(
      <TutiiSidePanel
        isOpen={true}
        onClose={vi.fn()}
        pathname="/workspace"
        displayName="Teacher Nimal"
      />,
    );

    const subtasksTab = screen.getByRole('radio', { name: 'Subtasks' });
    await userEvent.click(subtasksTab);

    expect(screen.getByText('Contextual Subtasks (Notion Style)')).toBeTruthy();
    expect(screen.getByText('Roll Call & Attendance Audit')).toBeTruthy();
    expect(screen.getByText('Lesson Plan & Pacing Draft')).toBeTruthy();

    const rollCallTask = screen.getByText('Roll Call & Attendance Audit');
    await userEvent.click(rollCallTask);

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Chat' }).getAttribute('aria-checked')).toBe('true');
    });
  });

  it('closes on Escape key press or close button click', async () => {
    const onClose = vi.fn();
    renderWithClient(
      <TutiiSidePanel
        isOpen={true}
        onClose={onClose}
        pathname="/self"
        displayName="Teacher Nimal"
      />,
    );

    const closeBtn = screen.getByRole('button', { name: 'Close side panel (Esc)' });
    await userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('pops out to full screen when pop out button is pressed', async () => {
    const onClose = vi.fn();
    renderWithClient(
      <TutiiSidePanel
        isOpen={true}
        onClose={onClose}
        pathname="/community"
        displayName="Teacher Nimal"
        navigationPrefix="/s"
      />,
    );

    const popOutBtn = screen.getByRole('button', { name: 'Open full screen in Community DM' });
    await userEvent.click(popOutBtn);

    expect(onClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/s/community?pillar=messages&dm=tutii');
  });
});