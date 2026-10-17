import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadAccountAttendance: vi.fn(),
  loadAccountClassrooms: vi.fn(),
  saveAccountAttendance: vi.fn(),
  openTask: vi.fn(() => ({ kind: 'ok' })),
  workbenchState: {
    domain: 'workspace',
    tasks: [
      {
        domain: 'workspace',
        featureId: 'attendance',
        route: '/workspace',
        title: 'Daily attendance',
        icon: '◷',
        temporalBinding: { kind: 'none' },
        localStatePolicy: 'restore-permitted',
        taskKey: 'attendance-task',
        openedAt: '2026-09-17T00:00:00.000Z',
        lastFocusedAt: '2026-09-17T00:00:00.000Z',
      },
    ],
    focusedTaskKey: 'attendance-task',
    temporalHorizon: {
      anchor: { kind: 'date', date: '2026-09-17' },
      scale: 'day',
      intent: 'current',
    },
  },
}));

vi.mock('@/lib/workspace/attendance', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/workspace/attendance')>();
  return {
    ...actual,
    loadAccountAttendance: mocks.loadAccountAttendance,
    loadAccountClassrooms: mocks.loadAccountClassrooms,
    saveAccountAttendance: mocks.saveAccountAttendance,
  };
});

vi.mock('@/lib/workbench', () => ({
  useDomainWorkbench: () => ({
    state: mocks.workbenchState,
    open: mocks.openTask,
    close: vi.fn(() => ({ kind: 'overview' })),
    focus: vi.fn(),
    setTemporalHorizon: vi.fn(),
  }),
}));

import { WorkspaceFloor } from '@/app/(sanctuary)/workspace/WorkspaceFloor';

const practiceAccount = 'practice-account-41';

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  mocks.loadAccountClassrooms.mockResolvedValue([]);
  mocks.loadAccountAttendance.mockResolvedValue([]);
  mocks.saveAccountAttendance.mockResolvedValue(undefined);
});

afterEach(() => {
  window.localStorage.clear();
});

describe('Workspace attendance Safe Try (G1 boundary / jsdom with mocked account APIs)', () => {
  it('enters a fictional roster, saves only locally, and discards practice without a live save', async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceFloor
        capacity="teacher"
        mode="account"
        scope={{ bondId: 'bond-1', entityId: 'school-1' }}
        subjectId={practiceAccount}
      />,
    );

    await screen.findByRole('button', { name: /try attendance safely/i });
    await user.click(screen.getByRole('button', { name: /try attendance safely/i }));

    expect(await screen.findByText('Practice Learning Circle')).toBeTruthy();
    expect(screen.getByText('Nila Sen')).toBeTruthy();
    expect(screen.getByText(/fictional sample students/i)).toBeTruthy();
    expect(mocks.loadAccountAttendance).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /nila sen, present/i }));
    await user.click(screen.getByRole('button', { name: /save practice changes/i }));

    expect(await screen.findByText(/saved on this device/i)).toBeTruthy();
    const storedKeys = Array.from({ length: window.localStorage.length }, (_, index) =>
      window.localStorage.key(index),
    );
    expect(
      storedKeys.some((key) =>
        key?.includes(
          'sandbox:account:practice-account-41:practice%3Aattendance%3Adaily-roll-call',
        ),
      ),
    ).toBe(true);
    expect(mocks.saveAccountAttendance).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /end practice and discard/i }));

    await waitFor(() => expect(window.localStorage.length).toBe(0));
    expect(screen.getByText(/practice was discarded/i)).toBeTruthy();
    expect(mocks.saveAccountAttendance).not.toHaveBeenCalled();
  });

  it('ignores an in-flight live roster response after Safe Try starts', async () => {
    let resolveClassrooms:
      | ((classrooms: readonly { id: string; name: string; subject: null }[]) => void)
      | undefined;
    mocks.loadAccountClassrooms.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveClassrooms = resolve;
        }),
    );
    const user = userEvent.setup();
    render(
      <WorkspaceFloor
        capacity="teacher"
        mode="account"
        scope={{ bondId: 'bond-1', entityId: 'school-1' }}
        subjectId={practiceAccount}
      />,
    );

    await user.click(await screen.findByRole('button', { name: /try attendance safely/i }));
    expect(await screen.findByText('Practice Learning Circle')).toBeTruthy();

    resolveClassrooms?.([{ id: 'live-classroom', name: 'Live classroom', subject: null }]);

    await waitFor(() => {
      expect(screen.getByText('Nila Sen')).toBeTruthy();
      expect(screen.queryByText('Live classroom')).toBeNull();
    });
  });
});
