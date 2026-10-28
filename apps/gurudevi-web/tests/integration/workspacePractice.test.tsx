import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/workspace',
  useSearchParams: () => new URLSearchParams(),
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
import {
  resolveWorkspaceAttendanceReadScope,
  workspaceAttendanceCache,
} from '@/lib/domain/hooks/useWorkspaceDomain';

const practiceAccount = 'practice-account-41';

function renderWorkspace(children: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    ...render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>),
    queryClient,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.workbenchState.temporalHorizon = {
    anchor: { kind: 'date', date: '2026-09-17' },
    scale: 'day',
    intent: 'current',
  };
  window.localStorage.clear();
  mocks.loadAccountClassrooms.mockResolvedValue([]);
  mocks.loadAccountAttendance.mockResolvedValue([]);
  mocks.saveAccountAttendance.mockResolvedValue(undefined);
});

afterEach(() => {
  window.localStorage.clear();
});

describe('Workspace attendance Safe Try and scoped reads (G3 mounted / jsdom with mocked account APIs)', () => {
  it('uses local sample attendance for a developer preview instead of account reads', async () => {
    renderWorkspace(<WorkspaceFloor mode="explore" isDevPreview capacity="teacher" />);
    expect(await screen.findByText(/local demo data/i)).toBeTruthy();
    expect(mocks.loadAccountClassrooms).not.toHaveBeenCalled();
    expect(mocks.loadAccountAttendance).not.toHaveBeenCalled();
  });
  it('guides a teacher after a successful empty classroom read', async () => {
    renderWorkspace(
      <WorkspaceFloor mode="account" capacity="teacher" subjectId={practiceAccount}
        scope={{ bondId: 'bond-1', entityId: 'school-a' }} />,
    );

    expect(await screen.findByText(/ask your school administrator to connect/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /audit attendance log|take attendance/i }).hasAttribute('disabled')).toBe(true);
  });

  it('opens the selected classroom from the overview', async () => {
    mocks.loadAccountClassrooms.mockResolvedValue([
      { id: 'grade-a', name: 'Grade A', subject: null },
      { id: 'grade-b', name: 'Grade B', subject: null },
    ]);
    renderWorkspace(
      <WorkspaceFloor mode="account" capacity="teacher" subjectId={practiceAccount}
        scope={{ bondId: 'bond-1', entityId: 'school-a' }} />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Grade B' }));
    await waitFor(() => expect(mocks.loadAccountAttendance).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'grade-b' }), expect.any(String), practiceAccount, expect.anything(),
    ));
  });

  it('does not carry a saved role lens into another bond', async () => {
    window.localStorage.setItem(`sanctuary-role-lens:workspace:${practiceAccount}:bond-1`, 'student');
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const floor = (bondId: string) => (
      <QueryClientProvider client={queryClient}>
        <WorkspaceFloor mode="account" capacity="teacher" subjectId={practiceAccount}
          scope={{ bondId, entityId: 'school-a' }} />
      </QueryClientProvider>
    );
    const view = render(floor('bond-1'));
    await waitFor(() => expect((screen.getByLabelText('Workspace role') as HTMLSelectElement).value).toBe('student'));
    view.rerender(floor('bond-2'));
    await waitFor(() => expect((screen.getByLabelText('Workspace role') as HTMLSelectElement).value).toBe('teacher'));
  });

  it('enters a fictional roster, saves only locally, and discards practice without a live save', async () => {
    const user = userEvent.setup();
    renderWorkspace(
      <WorkspaceFloor
        capacity="teacher"
        mode="account"
        scope={{ bondId: 'bond-1', entityId: 'school-1' }}
        subjectId={practiceAccount}
      />,
    );

    await screen.findByRole('button', { name: /try attendance safely/i });
    await user.click(screen.getByRole('button', { name: /try attendance safely/i }));

    expect((await screen.findAllByText('Practice Learning Circle')).length).toBeGreaterThan(0);
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
    renderWorkspace(
      <WorkspaceFloor
        capacity="teacher"
        mode="account"
        scope={{ bondId: 'bond-1', entityId: 'school-1' }}
        subjectId={practiceAccount}
      />,
    );

    await user.click(await screen.findByRole('button', { name: /try attendance safely/i }));
    expect((await screen.findAllByText('Practice Learning Circle')).length).toBeGreaterThan(0);

    resolveClassrooms?.([{ id: 'live-classroom', name: 'Live classroom', subject: null }]);

    await waitFor(() => {
      expect(screen.getByText('Nila Sen')).toBeTruthy();
      expect(screen.queryByText('Live classroom')).toBeNull();
    });
  });

  it('does not expose cached marks from the prior grade class after a class switch', async () => {
    mocks.workbenchState.temporalHorizon = {
      anchor: { kind: 'date', date: '2026-10-24' },
      scale: 'day',
      intent: 'current',
    };
    mocks.loadAccountClassrooms.mockResolvedValue([
      { id: 'grade-a', name: 'Grade A', subject: null },
      { id: 'grade-b', name: 'Grade B', subject: null },
    ]);
    mocks.loadAccountAttendance.mockResolvedValue([
      { id: 'enrollment-a', studentId: 'student-a', name: 'Ari', rollNumber: 1, status: 'present' },
    ]);
    const { queryClient } = renderWorkspace(
      <WorkspaceFloor
        capacity="teacher"
        mode="account"
        scope={{ bondId: 'bond-1', entityId: 'school-1' }}
        subjectId={practiceAccount}
      />,
    );
    await screen.findByRole('button', { name: 'Open attendance →' });
    fireEvent.click(screen.getByRole('button', { name: 'Open attendance →' }));
    await screen.findByText('Ari');
    const scope = resolveWorkspaceAttendanceReadScope({
      principalId: practiceAccount,
      bondId: 'bond-1',
      entityId: 'school-1',
    });
    if (!scope) throw new Error('scope missing');
    queryClient.setQueryData(workspaceAttendanceCache.roster(scope, 'grade-b', '2026-10-24'), [
      { id: 'enrollment-b', studentId: 'student-b', name: 'Bea', rollNumber: 1, status: 'late' },
    ]);

    fireEvent.change(screen.getByRole('combobox', { name: 'Classroom' }), {
      target: { value: 'grade-b' },
    });

    expect(screen.queryByText('Ari')).toBeNull();
    expect(await screen.findByText('Bea')).toBeTruthy();
  });

  it('clears the prior roster until a changed entity scope resolves', async () => {
    let resolveIncomingRoster: ((students: readonly unknown[]) => void) | undefined;
    mocks.loadAccountClassrooms.mockResolvedValue([
      { id: 'grade-a', name: 'Grade A', subject: null },
    ]);
    mocks.loadAccountAttendance
      .mockResolvedValueOnce([
        {
          id: 'enrollment-a',
          studentId: 'student-a',
          name: 'Ari',
          rollNumber: 1,
          status: 'present',
        },
      ])
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveIncomingRoster = resolve;
          }),
      );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const renderFloor = (entityId: string) => (
      <QueryClientProvider client={queryClient}>
        <WorkspaceFloor
          capacity="teacher"
          mode="account"
          scope={{ bondId: 'bond-1', entityId }}
          subjectId={practiceAccount}
        />
      </QueryClientProvider>
    );
    const rendered = render(renderFloor('school-a'));

    await screen.findByRole('button', { name: 'Open attendance →' });
    fireEvent.click(screen.getByRole('button', { name: 'Open attendance →' }));
    await screen.findByText('Ari');

    rendered.rerender(renderFloor('school-b'));

    await waitFor(() => expect(screen.queryByText('Ari')).toBeNull());
    resolveIncomingRoster?.([
      {
        id: 'enrollment-b',
        studentId: 'student-b',
        name: 'Bea',
        rollNumber: 1,
        status: 'late',
      },
    ]);
    expect(await screen.findByText('Bea')).toBeTruthy();
  });

  it('clears the prior roster until a changed date resolves', async () => {
    let resolveNextDateRoster: ((students: readonly unknown[]) => void) | undefined;
    mocks.loadAccountClassrooms.mockResolvedValue([
      { id: 'grade-a', name: 'Grade A', subject: null },
    ]);
    mocks.loadAccountAttendance
      .mockResolvedValueOnce([
        {
          id: 'enrollment-a',
          studentId: 'student-a',
          name: 'Ari',
          rollNumber: 1,
          status: 'present',
        },
      ])
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveNextDateRoster = resolve;
          }),
      );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const renderFloor = () => (
      <QueryClientProvider client={queryClient}>
        <WorkspaceFloor
          capacity="teacher"
          mode="account"
          scope={{ bondId: 'bond-1', entityId: 'school-a' }}
          subjectId={practiceAccount}
        />
      </QueryClientProvider>
    );
    const rendered = render(renderFloor());

    await screen.findByRole('button', { name: 'Open attendance →' });
    fireEvent.click(screen.getByRole('button', { name: 'Open attendance →' }));
    await screen.findByText('Ari');

    mocks.workbenchState.temporalHorizon = {
      anchor: { kind: 'date', date: '2026-09-18' },
      scale: 'day',
      intent: 'current',
    };
    rendered.rerender(renderFloor());

    await waitFor(() => expect(screen.queryByText('Ari')).toBeNull());
    resolveNextDateRoster?.([
      {
        id: 'enrollment-b',
        studentId: 'student-b',
        name: 'Bea',
        rollNumber: 1,
        status: 'late',
      },
    ]);
    expect(await screen.findByText('Bea')).toBeTruthy();
  });
});
