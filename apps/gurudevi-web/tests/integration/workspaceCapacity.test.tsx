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
    expect(await screen.findByRole('heading', { name: 'Daily attendance' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open attendance' })).toBeTruthy();
    expect(screen.getByText(/try attendance with a local sample roster/i)).toBeTruthy();
  });

  it('renders school coordination workspace with climate pulse link for principal capacity', async () => {
    render(<WorkspaceFloor capacity="principal" mode="explore" />);
    expect(
      await screen.findByRole('heading', { name: 'School presence & attendance' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: /classroom climate pulse/i })).toBeTruthy();
    expect(screen.getByText(/coordinate whole-school presence/i)).toBeTruthy();
  });

  it('renders learning studio workspace for student capacity', async () => {
    render(<WorkspaceFloor capacity="student" mode="explore" />);
    expect(await screen.findByRole('heading', { name: 'Learning Studio' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /open quiet journal/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /browse library/i })).toBeTruthy();
  });

  it('renders family space workspace for guardian capacity', async () => {
    render(<WorkspaceFloor capacity="guardian" mode="explore" />);
    expect(await screen.findByRole('heading', { name: 'Family Space' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /open community dialogues/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /family guides/i })).toBeTruthy();
  });
});
