import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadAccountAttendance: vi.fn(),
  loadAccountClassrooms: vi.fn(),
  saveAccountAttendance: vi.fn(),
  workbenchState: {
    domain: 'workspace',
    tasks: [],
    focusedTaskKey: null,
    temporalHorizon: {
      anchor: { kind: 'date', date: new Date().toISOString().slice(0, 10) },
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
    open: vi.fn(() => ({ kind: 'ok' })),
    close: vi.fn(() => ({ kind: 'overview' })),
    focus: vi.fn(),
    setTemporalHorizon: vi.fn(),
  }),
}));

import { WorkspaceFloor } from '@/app/(sanctuary)/workspace/WorkspaceFloor';

describe('Workspace capacity contextualization (G1 boundary)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('renders daily attendance workspace for teacher capacity', async () => {
    render(<WorkspaceFloor capacity="teacher" mode="explore" />);
    expect(await screen.findByRole('heading', { name: 'Daily Attendance Roll Call' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Take Attendance' })).toBeTruthy();
    expect(screen.getByText(/take a classroom roll call/i)).toBeTruthy();
  });

  it('renders school coordination workspace for principal capacity', async () => {
    render(<WorkspaceFloor capacity="principal" mode="explore" />);
    expect(
      await screen.findByRole('heading', { name: 'Real-Time Campus Presence & Kiosks' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /open doorway kiosk/i })).toBeTruthy();
    expect(screen.getByText(/monitor live school attendance/i)).toBeTruthy();
  });

  it('renders learning studio workspace for student capacity', async () => {
    render(<WorkspaceFloor capacity="student" mode="explore" />);
    expect(await screen.findByRole('heading', { name: 'Today’s Classes & Daily Presence' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /open daily check-in/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /view timetable/i })).toBeTruthy();
  });

  it('renders family space workspace for guardian capacity', async () => {
    render(<WorkspaceFloor capacity="guardian" mode="explore" />);
    expect(await screen.findByRole('heading', { name: 'Daily Family Space & Presence' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /open family space/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /community dialogues/i })).toBeTruthy();
  });
});
