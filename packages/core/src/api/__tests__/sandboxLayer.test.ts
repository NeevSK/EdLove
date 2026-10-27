import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageMock = vi.hoisted(() => ({ records: new Map<string, string | number | boolean>() }));
vi.mock('@repo/core/lib/storage', () => ({
  storage: {
    getString: (key: string) => {
      const val = storageMock.records.get(key);
      return typeof val === 'string' ? val : undefined;
    },
    getStringAsync: async (key: string) => {
      const val = storageMock.records.get(key);
      return typeof val === 'string' ? val : undefined;
    },
    getBoolean: (key: string) => {
      const val = storageMock.records.get(key);
      return typeof val === 'boolean' ? val : undefined;
    },
    getNumber: (key: string) => {
      const val = storageMock.records.get(key);
      return typeof val === 'number' ? val : undefined;
    },
    set: (key: string, value: string | number | boolean) => {
      storageMock.records.set(key, value);
    },
    setAsync: async (key: string, value: string | number | boolean) => {
      storageMock.records.set(key, value);
    },
    delete: (key: string) => {
      storageMock.records.delete(key);
    },
    deleteAsync: async (key: string) => {
      storageMock.records.delete(key);
    },
    contains: (key: string) => storageMock.records.has(key),
    getAllKeys: () => Array.from(storageMock.records.keys()),
    clearAll: () => {
      storageMock.records.clear();
    },
  },
}));

import { useExperienceState } from '@repo/core/lib/experienceState';
import {
  _getSandboxRegistry,
  getSandboxDomainConfig,
  isEmptyArray,
  isEmptyOrNull,
  registerSandboxDomain,
} from '../sandboxDataset';
import {
  isBridgingActive,
  isDemoActive,
  isGhostActive,
  isSandboxActive,
  resolveSandboxMode,
  useSandboxMode,
} from '../sandboxMode';
import {
  WHITELISTED_REPLAY_ACTIONS,
  getPendingReplaySummary,
  isReplayableAction,
  replayDemoLogs,
} from '../sandboxBridge';
import { api } from '../index';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function setMode({
  isDemoMode = false,
  isExplorerMode = false,
  isBridging = false,
}: {
  isDemoMode?: boolean;
  isExplorerMode?: boolean;
  isBridging?: boolean;
}) {
  useExperienceState.setState({ isDemoMode, isExplorerMode, isBridging });
}

beforeEach(() => {
  storageMock.records.clear();
  setMode({});
});

// ─────────────────────────────────────────────────────────────────────────────
// sandboxMode — resolveSandboxMode
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveSandboxMode', () => {
  it('returns "live" when all flags are false', () => {
    setMode({});
    expect(resolveSandboxMode()).toBe('live');
  });

  it('returns "ghost" when isExplorerMode is true', () => {
    setMode({ isExplorerMode: true });
    expect(resolveSandboxMode()).toBe('ghost');
  });

  it('returns "demo" when isDemoMode is true', () => {
    setMode({ isDemoMode: true });
    expect(resolveSandboxMode()).toBe('demo');
  });

  it('returns "bridging" when isBridging is true, even if isDemoMode is also true', () => {
    setMode({ isDemoMode: true, isBridging: true });
    expect(resolveSandboxMode()).toBe('bridging');
  });

  it('prioritises bridging > demo > ghost > live', () => {
    setMode({ isDemoMode: true, isExplorerMode: true, isBridging: true });
    expect(resolveSandboxMode()).toBe('bridging');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// sandboxMode — narrow helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('narrow sandbox helpers', () => {
  it('isSandboxActive — false when live, true for all other modes', () => {
    setMode({});
    expect(isSandboxActive()).toBe(false);

    setMode({ isExplorerMode: true });
    expect(isSandboxActive()).toBe(true);

    setMode({ isDemoMode: true });
    expect(isSandboxActive()).toBe(true);

    setMode({ isBridging: true });
    expect(isSandboxActive()).toBe(true);
  });

  it('isDemoActive — true only in demo mode', () => {
    setMode({ isDemoMode: true });
    expect(isDemoActive()).toBe(true);
    setMode({ isExplorerMode: true });
    expect(isDemoActive()).toBe(false);
  });

  it('isGhostActive — true only in ghost mode', () => {
    setMode({ isExplorerMode: true });
    expect(isGhostActive()).toBe(true);
    setMode({ isDemoMode: true });
    expect(isGhostActive()).toBe(false);
  });

  it('isBridgingActive — true only in bridging mode', () => {
    setMode({ isBridging: true });
    expect(isBridgingActive()).toBe(true);
    setMode({ isDemoMode: true });
    expect(isBridgingActive()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// sandboxDataset — registry
// ─────────────────────────────────────────────────────────────────────────────

describe('sandboxDataset registry', () => {
  it('registerSandboxDomain stores config and getSandboxDomainConfig retrieves it', () => {
    registerSandboxDomain({
      domain: '__test_domain__',
      ghostMethods: ['getAll', 'getById'],
      isEmpty: (_, data) => isEmptyArray(data),
      getSamples: () => [{ id: 'sample-t1', is_sample: true }],
    });

    const config = getSandboxDomainConfig('__test_domain__');
    expect(config).toBeDefined();
    expect(config!.domain).toBe('__test_domain__');
    expect(config!.ghostMethods).toContain('getAll');
  });

  it('returns undefined for unregistered domains', () => {
    expect(getSandboxDomainConfig('__nonexistent__')).toBeUndefined();
  });

  it('re-registering a domain replaces the previous entry', () => {
    registerSandboxDomain({
      domain: '__rewrite_test__',
      ghostMethods: ['getAll'],
      isEmpty: () => true,
      getSamples: () => [{ id: 'v1' }],
    });

    registerSandboxDomain({
      domain: '__rewrite_test__',
      ghostMethods: ['getAll', 'getById'],
      isEmpty: () => true,
      getSamples: () => [{ id: 'v2' }],
    });

    const config = getSandboxDomainConfig('__rewrite_test__');
    expect(config!.ghostMethods).toHaveLength(2);
    expect(config!.getSamples('getAll', [])).toEqual([{ id: 'v2' }]);
  });

  it('isEmptyArray returns true for [] and false for non-empty arrays and non-arrays', () => {
    expect(isEmptyArray([])).toBe(true);
    expect(isEmptyArray([1])).toBe(false);
    expect(isEmptyArray(null)).toBe(false);
    expect(isEmptyArray(undefined)).toBe(false);
    expect(isEmptyArray({})).toBe(false);
  });

  it('isEmptyOrNull returns true for null, undefined, and []', () => {
    expect(isEmptyOrNull(null)).toBe(true);
    expect(isEmptyOrNull(undefined)).toBe(true);
    expect(isEmptyOrNull([])).toBe(true);
    expect(isEmptyOrNull([1])).toBe(false);
    expect(isEmptyOrNull({})).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Built-in domain registrations (loaded at import time in sandboxDataset.ts)
// ─────────────────────────────────────────────────────────────────────────────

describe('built-in domain registrations', () => {
  const builtInDomains = [
    'echo',
    'echoes',
    'lessons',
    'resources',
    'classroomNotes',
    'lessonMaterials',
    'teacherInsights',
    'studentObservations',
    'community',
  ];

  for (const domain of builtInDomains) {
    it(`"${domain}" domain is registered`, () => {
      expect(getSandboxDomainConfig(domain)).toBeDefined();
    });
  }

  it('community.getPosts ghost method returns mock posts array', () => {
    const config = getSandboxDomainConfig('community')!;
    const samples = config.getSamples('getPosts', []);
    expect(Array.isArray(samples)).toBe(true);
    expect((samples as any[]).length).toBeGreaterThan(0);
  });

  it('community.getGroups ghost method returns mock groups array', () => {
    const config = getSandboxDomainConfig('community')!;
    const samples = config.getSamples('getGroups', []);
    expect(Array.isArray(samples)).toBe(true);
    expect((samples as any[]).length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Self-registered domain: classrooms
// ─────────────────────────────────────────────────────────────────────────────

describe('classrooms self-registered sandbox domain', () => {
  // classrooms.ts registers at module load time — importing it is enough
  it('classrooms domain is registered after importing classrooms.ts', async () => {
    await import('@repo/core/api/classrooms');
    const config = getSandboxDomainConfig('classrooms');
    expect(config).toBeDefined();
    expect(config!.ghostMethods).toContain('getByTeacher');
    expect(config!.ghostMethods).toContain('getByStudent');
    expect(config!.ghostMethods).toContain('getBySchool');
    expect(config!.ghostMethods).toContain('getTeacherStats');
  });

  it('isEmpty returns true for empty classrooms array', async () => {
    await import('@repo/core/api/classrooms');
    const config = getSandboxDomainConfig('classrooms')!;
    expect(config.isEmpty('getByTeacher', [])).toBe(true);
    expect(config.isEmpty('getByTeacher', [{ id: 'real-c1' }])).toBe(false);
  });

  it('isEmpty detects zero-stat teacher stats object', async () => {
    await import('@repo/core/api/classrooms');
    const config = getSandboxDomainConfig('classrooms')!;
    expect(config.isEmpty('getTeacherStats', { active_classes: 0 })).toBe(true);
    expect(config.isEmpty('getTeacherStats', { active_classes: 3 })).toBe(false);
  });

  it('getSamples returns MOCK_CLASSROOMS for getByTeacher', async () => {
    await import('@repo/core/api/classrooms');
    const config = getSandboxDomainConfig('classrooms')!;
    const samples = config.getSamples('getByTeacher', ['teacher-uuid']);
    expect(Array.isArray(samples)).toBe(true);
    expect((samples as any[]).length).toBeGreaterThan(0);
  });

  it('getSamples returns teacher stats with is_sample flag for getTeacherStats', async () => {
    await import('@repo/core/api/classrooms');
    const config = getSandboxDomainConfig('classrooms')!;
    const stats = config.getSamples('getTeacherStats', ['teacher-uuid']) as any;
    expect(stats.is_sample).toBe(true);
    expect(typeof stats.active_classes).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Self-registered domain: school
// ─────────────────────────────────────────────────────────────────────────────

describe('school self-registered sandbox domain', () => {
  // school.ts pulls in educational manager which touches Supabase auth on init.
  // Import once in beforeAll with an extended timeout to avoid per-test hangs.
  beforeAll(async () => {
    await import('@repo/core/api/school');
  }, 15_000);

  it('school domain is registered after importing school.ts', () => {
    const config = getSandboxDomainConfig('school');
    expect(config).toBeDefined();
    expect(config!.ghostMethods).toContain('getSchool');
    expect(config!.ghostMethods).toContain('getSchoolStats');
  });

  it('isEmpty detects missing school (no id)', () => {
    const config = getSandboxDomainConfig('school')!;
    expect(config.isEmpty('getSchool', null)).toBe(true);
    expect(config.isEmpty('getSchool', {})).toBe(true);
    expect(config.isEmpty('getSchool', { id: 'real-school' })).toBe(false);
  });

  it('isEmpty detects all-zero school stats', () => {
    const config = getSandboxDomainConfig('school')!;
    expect(
      config.isEmpty('getSchoolStats', { total_students: 0, total_teachers: 0, total_classrooms: 0 }),
    ).toBe(true);
    expect(
      config.isEmpty('getSchoolStats', { total_students: 450, total_teachers: 28, total_classrooms: 12 }),
    ).toBe(false);
  });

  it('getSamples returns mock school with is_sample for getSchool', () => {
    const config = getSandboxDomainConfig('school')!;
    const school = config.getSamples('getSchool', []) as any;
    expect(school.is_sample).toBe(true);
    expect(typeof school.id).toBe('string');
  });

  it('getSamples returns school stats with is_sample for getSchoolStats', () => {
    const config = getSandboxDomainConfig('school')!;
    const stats = config.getSamples('getSchoolStats', []) as any;
    expect(stats.is_sample).toBe(true);
    expect(typeof stats.total_students).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Self-registered domain: assignments
// ─────────────────────────────────────────────────────────────────────────────

describe('assignments self-registered sandbox domain', () => {
  it('assignments domain is registered after importing assignments.ts', async () => {
    await import('@repo/core/api/assignments');
    const config = getSandboxDomainConfig('assignments');
    expect(config).toBeDefined();
    expect(config!.ghostMethods).toContain('getAll');
    expect(config!.ghostMethods).toContain('getUpcomingForStudent');
    expect(config!.ghostMethods).toContain('getRecentGradesOverviewForStudent');
    expect(config!.ghostMethods).toContain('getSubmissionHistoryForStudent');
  });

  it('isEmpty returns true for empty assignments array', async () => {
    await import('@repo/core/api/assignments');
    const config = getSandboxDomainConfig('assignments')!;
    expect(config.isEmpty('getAll', [])).toBe(true);
    expect(config.isEmpty('getAll', [{ id: 'real-a1' }])).toBe(false);
  });

  it('getSamples returns MOCK_STUDENT_GRADES for getRecentGradesOverviewForStudent', async () => {
    await import('@repo/core/api/assignments');
    const config = getSandboxDomainConfig('assignments')!;
    const grades = config.getSamples('getRecentGradesOverviewForStudent', ['student-id']) as any[];
    expect(Array.isArray(grades)).toBe(true);
    expect(grades.length).toBeGreaterThan(0);
    expect(grades[0].is_sample).toBe(true);
  });

  it('getSamples returns MOCK_STUDENT_SUBMISSIONS for getSubmissionHistoryForStudent', async () => {
    await import('@repo/core/api/assignments');
    const config = getSandboxDomainConfig('assignments')!;
    const submissions = config.getSamples('getSubmissionHistoryForStudent', ['student-id']) as any[];
    expect(Array.isArray(submissions)).toBe(true);
    expect(submissions.length).toBeGreaterThan(0);
    expect(submissions[0]).toHaveProperty('assignment_id');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Built-in domain: library
// ─────────────────────────────────────────────────────────────────────────────

describe('library sandbox domain', () => {
  it('library domain is registered', () => {
    const config = getSandboxDomainConfig('library');
    expect(config).toBeDefined();
    expect(config!.ghostMethods).toContain('getResources');
    expect(config!.ghostMethods).toContain('getMapTopology');
  });

  it('isEmpty detects empty topology nodes', () => {
    const config = getSandboxDomainConfig('library')!;
    expect(config.isEmpty('getMapTopology', null)).toBe(true);
    expect(config.isEmpty('getMapTopology', { nodes: [] })).toBe(true);
    expect(config.isEmpty('getMapTopology', { nodes: [{ id: 'n1' }] })).toBe(false);
  });

  it('getSamples returns MOCK_KNOWLEDGE_TOPOLOGY for getMapTopology', () => {
    const config = getSandboxDomainConfig('library')!;
    const topology = config.getSamples('getMapTopology', []) as any;
    expect(topology).toHaveProperty('nodes');
    expect(Array.isArray(topology.nodes)).toBe(true);
    expect(topology.nodes.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Built-in domain: attendance
// ─────────────────────────────────────────────────────────────────────────────

describe('attendance sandbox domain', () => {
  it('attendance domain is registered', () => {
    const config = getSandboxDomainConfig('attendance');
    expect(config).toBeDefined();
    expect(config!.ghostMethods).toContain('getClassroomAttendanceSnapshot');
    expect(config!.ghostMethods).toContain('getSchoolAttendancePulse');
  });

  it('isEmpty detects empty snapshot records', () => {
    const config = getSandboxDomainConfig('attendance')!;
    expect(config.isEmpty('getClassroomAttendanceSnapshot', null)).toBe(true);
    expect(config.isEmpty('getClassroomAttendanceSnapshot', { records: [] })).toBe(true);
    expect(config.isEmpty('getClassroomAttendanceSnapshot', { records: [{ student_id: 's1' }] })).toBe(false);
  });

  it('getSamples returns attendance snapshot for sample-c1', () => {
    const config = getSandboxDomainConfig('attendance')!;
    const snapshot = config.getSamples('getClassroomAttendanceSnapshot', ['sample-c1']) as any;
    expect(snapshot).toHaveProperty('records');
    expect(Array.isArray(snapshot.records)).toBe(true);
    expect(snapshot.records.length).toBeGreaterThan(0);
  });

  it('getSamples returns student pulse for getSchoolAttendancePulse', () => {
    const config = getSandboxDomainConfig('attendance')!;
    const pulse = config.getSamples('getSchoolAttendancePulse', ['school-1']) as any;
    expect(pulse).toHaveProperty('todayRate');
    expect(typeof pulse.todayRate).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SandboxBridge — graduation and replay
// ─────────────────────────────────────────────────────────────────────────────

describe('SandboxBridge', () => {
  it('isReplayableAction recognises whitelisted actions only', () => {
    expect(isReplayableAction('classrooms.create')).toBe(true);
    expect(isReplayableAction('school.create')).toBe(true);
    expect(isReplayableAction('school.update')).toBe(true);
    expect(isReplayableAction('assignments.create')).toBe(true);
    expect(isReplayableAction('profile.update')).toBe(true);

    expect(isReplayableAction('dangerous.nukeDatabase')).toBe(false);
    expect(isReplayableAction('random.action')).toBe(false);
  });

  it('getPendingReplaySummary partitions replayable vs unsupported actions', () => {
    useExperienceState.setState({
      demoLogs: [
        { module: 'classrooms', method: 'create', payload: { name: 'New 10A' }, timestamp: 1 },
        { module: 'school', method: 'update', payload: { id: 's1', name: 'Updated' }, timestamp: 2 },
        { module: 'analytics', method: 'trackClick', payload: { button: 'cta' }, timestamp: 3 },
      ],
    });

    const summary = getPendingReplaySummary();
    expect(summary.total).toBe(3);
    expect(summary.replayable).toBe(2);
    expect(summary.unsupported).toBe(1);
    expect(summary.replayableActions).toEqual(['classrooms.create', 'school.update']);
  });

  it('replayDemoLogs returns early if demoLogs is empty', async () => {
    useExperienceState.setState({ demoLogs: [] });
    const report = await replayDemoLogs();
    expect(report).toEqual({ total: 0, replayed: 0, skipped: 0, failed: [] });
  });

  it('replayDemoLogs executes custom dispatchers with payloads and sets bridging mode lifecycle', async () => {
    const dispatched: any[] = [];
    let wasBridgingDuringExecution = false;

    useExperienceState.setState({
      demoLogs: [
        { module: 'classrooms', method: 'create', payload: { name: 'Grade 9C' }, timestamp: 1 },
        { module: 'assignments', method: 'create', payload: { title: 'Lab 1' }, timestamp: 2 },
        { module: 'unsupported', method: 'doSomething', payload: {}, timestamp: 3 },
      ],
    });

    const report = await replayDemoLogs({
      customDispatchers: {
        'classrooms.create': async (payload) => {
          wasBridgingDuringExecution = useExperienceState.getState().isBridging;
          dispatched.push({ action: 'classrooms.create', payload });
        },
        'assignments.create': async (payload) => {
          dispatched.push({ action: 'assignments.create', payload });
        },
      },
      clearOnComplete: true,
    });

    expect(wasBridgingDuringExecution).toBe(true);
    expect(useExperienceState.getState().isBridging).toBe(false);
    expect(report.total).toBe(3);
    expect(report.replayed).toBe(2);
    expect(report.skipped).toBe(1);
    expect(report.failed.length).toBe(0);
    expect(dispatched).toEqual([
      { action: 'classrooms.create', payload: { name: 'Grade 9C' } },
      { action: 'assignments.create', payload: { title: 'Lab 1' } },
    ]);

    // When all supported succeed, demoLogs are cleared
    expect(useExperienceState.getState().demoLogs).toEqual([]);
  });

  it('replayDemoLogs isolates errors and preserves demoLogs if any replay fails', async () => {
    useExperienceState.setState({
      demoLogs: [
        { module: 'classrooms', method: 'create', payload: { name: 'Fail Class' }, timestamp: 1 },
        { module: 'school', method: 'update', payload: { id: 's1' }, timestamp: 2 },
      ],
    });

    const report = await replayDemoLogs({
      customDispatchers: {
        'classrooms.create': async () => {
          throw new Error('Database constraint violation');
        },
        'school.update': async () => 'ok',
      },
      clearOnComplete: true,
    });

    expect(report.replayed).toBe(1);
    expect(report.failed.length).toBe(1);
    expect(report.failed[0].error).toBe('Database constraint violation');
    expect(report.failed[0].intent.module).toBe('classrooms');

    // Because there was a failure, logs are preserved for retry / inspection
    expect(useExperienceState.getState().demoLogs.length).toBe(2);
    // Bridging is cleanly reset even after errors
    expect(useExperienceState.getState().isBridging).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// api Proxy Alignment & oRPC Domain Routing
// ─────────────────────────────────────────────────────────────────────────────

describe('api Proxy Alignment & oRPC Domain Routing', () => {
  it('resolves classrooms via domainApiMap without throwing [NUCLEAR-HARD-CUT]', () => {
    expect(api.classrooms).toBeDefined();
    expect(typeof api.classrooms.getByTeacher).toBe('function');
  }, 15000);

  it('resolves school and assignments via domainApiMap', () => {
    expect(api.school).toBeDefined();
    expect(typeof api.school.getSchool).toBe('function');
    expect(api.assignments).toBeDefined();
    expect(typeof api.assignments.getAll).toBe('function');
  });

  it('throws [NUCLEAR-HARD-CUT] for unknown or deleted legacy properties', () => {
    expect(() => api.totallyObsoleteRestEndpoint).toThrow('[NUCLEAR-HARD-CUT]');
  });

  it('routes api.classrooms.getByTeacher through resonant proxy in demo mode', async () => {
    setMode({ isDemoMode: true });

    const classrooms = await api.classrooms.getByTeacher('teacher-xyz');
    expect(Array.isArray(classrooms)).toBe(true);
    expect(classrooms.length).toBeGreaterThan(0);
    expect(classrooms[0]).toHaveProperty('is_sample', true);
  });
});

