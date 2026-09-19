import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  batchRecord: vi.fn(),
  getSession: vi.fn(),
  registerTokenResolver: vi.fn(),
}));

vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: { attendance: { batchRecord: mocks.batchRecord } },
}));
vi.mock('@repo/core/api/clientRuntime', () => ({
  registerTokenResolver: mocks.registerTokenResolver,
}));
vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { getSession: mocks.getSession } }),
}));

import {
  loadAccountAttendance,
  loadAccountClassrooms,
  saveAccountAttendance,
  type WorkspaceClassroom,
  type WorkspaceStudent,
} from './attendance';

const subject = '00000000-0000-4000-8000-000000000001';
const classroom: WorkspaceClassroom = {
  id: '00000000-0000-4000-8000-000000000010',
  name: 'Learning group',
  subject: null,
};

function setSession(id = subject) {
  mocks.getSession.mockResolvedValue({
    data: { session: { access_token: 'session-token', user: { id } } },
    error: null,
  });
}

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Workspace attendance account boundary', () => {
  it('uses verified browser credentials for the server-owned classroom list', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    setSession();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse([{ id: classroom.id, name: classroom.name, subject: null }]));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadAccountClassrooms(subject)).resolves.toEqual([classroom]);

    const [url, request] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      `https://sanctuary.example/api/openapi/educational/classrooms/by-teacher?teacher_id=${subject}&limit=100`,
    );
    expect(new Headers(request?.headers).get('Authorization')).toBe('Bearer session-token');
  });

  it('rejects a session that changed accounts before issuing a request', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    setSession('00000000-0000-4000-8000-000000000099');
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadAccountClassrooms(subject)).rejects.toThrow('Your secure session has ended');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reads roster and marks from protected routes and leaves unlinked students unmarkable', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    setSession();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: '00000000-0000-4000-8000-000000000020',
            student_id: '00000000-0000-4000-8000-000000000030',
            full_name: 'Mina',
            roll_number: 2,
          },
          {
            id: '00000000-0000-4000-8000-000000000021',
            student_id: null,
            full_name: null,
            roll_number: null,
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            student_id: '00000000-0000-4000-8000-000000000030',
            status: 'late',
          },
        ]),
      );
    vi.stubGlobal('fetch', fetchMock);

    const students = await loadAccountAttendance(classroom, '2026-09-17', subject);

    expect(students).toEqual([
      {
        id: '00000000-0000-4000-8000-000000000020',
        studentId: '00000000-0000-4000-8000-000000000030',
        name: 'Mina',
        rollNumber: 2,
        status: 'late',
      },
      {
        id: '00000000-0000-4000-8000-000000000021',
        studentId: null,
        name: 'Learner 000000',
        rollNumber: null,
        status: 'present',
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends a batch for linked students only and rechecks identity for mutation credentials', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    setSession();
    mocks.batchRecord.mockResolvedValue([
      { student_id: '00000000-0000-4000-8000-000000000030', status: 'late' },
    ]);
    const students: readonly WorkspaceStudent[] = [
      {
        id: '00000000-0000-4000-8000-000000000020',
        studentId: '00000000-0000-4000-8000-000000000030',
        name: 'Mina',
        rollNumber: 2,
        status: 'late',
      },
      {
        id: '00000000-0000-4000-8000-000000000021',
        studentId: null,
        name: 'Learner 000000',
        rollNumber: null,
        status: 'present',
      },
    ];

    await saveAccountAttendance(classroom, '2026-09-17', students, subject);

    expect(mocks.batchRecord).toHaveBeenCalledWith({
      body: [
        {
          gradeClassId: classroom.id,
          studentId: '00000000-0000-4000-8000-000000000030',
          status: 'late',
          date: '2026-09-17',
        },
      ],
    });
    const resolver = mocks.registerTokenResolver.mock.calls[0]?.[0];
    expect(resolver).toBeTypeOf('function');
    if (typeof resolver !== 'function')
      throw new Error('The API token resolver was not registered.');
    setSession('00000000-0000-4000-8000-000000000099');
    await expect(resolver()).rejects.toThrow('Your active account changed');
  });

  it('does not report success when the batch response omits a saved mark', async () => {
    setSession();
    mocks.batchRecord.mockResolvedValue([]);

    await expect(
      saveAccountAttendance(
        classroom,
        '2026-09-17',
        [
          {
            id: '00000000-0000-4000-8000-000000000020',
            studentId: '00000000-0000-4000-8000-000000000030',
            name: 'Mina',
            rollNumber: 2,
            status: 'late',
          },
        ],
        subject,
      ),
    ).rejects.toThrow('Attendance was not saved');
  });
});
