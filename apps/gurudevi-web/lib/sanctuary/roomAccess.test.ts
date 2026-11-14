import { roomFeatures } from '@repo/core/logic/floor';
import { evaluateFeatureFor } from '@repo/core/logic/permissions/personAccess';
import { roomPresentationOf } from '@repo/core/logic/registry/featureRequirement';
import type { AuthorizedEntryResult } from '@repo/core/web-authorized-entry';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { presentationShows } from '../../app/(sanctuary)/workspace/workspaceFeatures';
import { APP_CATALOG } from '../appCatalog';
import { resolveRoomPresentation, webPersonAccess } from './roomAccess';

const signature = vi.hoisted(() => ({ trust: false }));
vi.mock('@repo/core/logic/permissions/signature', async (original) => {
  const real = await original<typeof import('@repo/core/logic/permissions/signature')>();
  return {
    verifySnapshotSignature: async (
      snapshot: Parameters<typeof real.verifySnapshotSignature>[0],
    ) => (signature.trust ? true : real.verifySnapshotSignature(snapshot)),
  };
});

const accountId = '01234567-89ab-8101-8000-010203040506';
const bondId = '00000000-0000-4000-8000-000000000011';

const teacher: Extract<AuthorizedEntryResult, { kind: 'ready' }> = {
  kind: 'ready',
  accountId,
  authSubjectId: '00000000-0000-4000-8000-000000000001',
  displayName: 'Asha',
  activeCapacity: 'teacher',
  primaryCapacity: 'teacher',
  primaryScopeRole: 'teacher',
  activeScope: {
    bondId,
    entityId: 'school-1',
    entityType: 'SCHOOL',
    roles: ['teacher'],
    citizenship: 'FIRST_CLASS',
  },
};

function decide(permissions: Record<string, Record<string, boolean>> | null) {
  const person = webPersonAccess(teacher, permissions);
  return roomPresentationOf(
    roomFeatures(APP_CATALOG, 'workspace', 'teacher', 'web'),
    (action, subject, requirement) => evaluateFeatureFor(person, action, subject, requirement),
    true,
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  signature.trust = false;
});

describe('SanctuaryFeature on the web', () => {
  it('opens what the signed snapshot allows and hides what it denies', () => {
    const modes = decide({ Attendance: { read: true }, Timetable: { read: false } });
    expect(modes.attendance).toBe('available');
    expect(presentationShows(modes, 'attendance')).toBe(true);
    const denied = roomFeatures(APP_CATALOG, 'workspace', 'teacher', 'web').filter(
      (entry) => entry.capabilityRequirement.subject === 'Timetable',
    );
    for (const entry of denied) {
      expect(modes[entry.id]).toBe('hidden');
      expect(presentationShows(modes, entry.id)).toBe(false);
    }
  });

  it('without a snapshot, protected features wait instead of opening or vanishing', () => {
    const modes = decide(null);
    expect(modes.attendance).toBe('loading');
    expect(presentationShows(modes, 'attendance')).toBe(true);
  });

  it('a feature outside this person’s room takes no place; no decisions lists everything', () => {
    expect(presentationShows({}, 'attendance')).toBe(false);
    expect(presentationShows(undefined, 'attendance')).toBe(true);
  });

  it('a snapshot whose signature does not check counts as no snapshot', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test');
    vi.stubEnv(
      'NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY',
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    );
    const supabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { access_token: 'token', user: { id: teacher.authSubjectId } } },
          error: null,
        }),
      },
    };
    const forged = {
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      userId: accountId,
      activeBondId: bondId,
      activeEntityId: 'school-1',
      activeEntityType: 'SCHOOL',
      schoolId: 'school-1',
      policyVersion: 'v1',
      permissions: { Attendance: { read: true } },
      temporalHints: {},
      signature: 'ed25519:AAAA',
    };
    const fetcher = vi.fn(
      async () =>
        new Response(JSON.stringify({ json: forged }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );
    const modes = await resolveRoomPresentation(
      supabase as never,
      teacher,
      'workspace',
      fetcher as unknown as typeof fetch,
    );
    expect(fetcher).toHaveBeenCalled();
    expect(modes.attendance).toBe('loading');

    // The same snapshot, once its signature checks, opens Attendance: only the signature failed.
    signature.trust = true;
    const trusted = await resolveRoomPresentation(
      supabase as never,
      teacher,
      'workspace',
      fetcher as unknown as typeof fetch,
    );
    expect(trusted.attendance).toBe('available');
  });
});
