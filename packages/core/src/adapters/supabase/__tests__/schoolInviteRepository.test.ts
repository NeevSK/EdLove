import { describe, expect, it, vi } from 'vitest';
import {
  claimAndSelectSchoolInvite,
  createSupabaseSchoolInviteRepository,
} from '../schoolInviteRepository';

describe('createSupabaseSchoolInviteRepository', () => {
  it('uses the atomic server claim and returns only its validated authority result', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        success: true,
        bond_id: 'bond-royal-teacher',
        school_id: 'school-royal',
        capacity: 'teacher',
        already_claimed: false,
      },
      error: null,
    });
    const repo = createSupabaseSchoolInviteRepository({ rpc } as any);

    await expect(repo.verifyAndRedeemInviteCode(' royal2026 ', 'user-teacher-1')).resolves.toEqual({
      bondId: 'bond-royal-teacher',
      schoolId: 'school-royal',
      capacity: 'teacher',
      alreadyClaimed: false,
    });
    expect(rpc).toHaveBeenCalledWith('claim_invite_code', {
      p_invite_code: 'ROYAL2026',
      p_user_id: 'user-teacher-1',
    });
  });

  it('does not treat a failed or malformed claim as a usable authority result', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: { success: false, message: 'Invite exhausted' }, error: null })
      .mockResolvedValueOnce({
        data: { success: true, bond_id: 'bond-1', school_id: 'school-1', capacity: 'unknown' },
        error: null,
      });
    const repo = createSupabaseSchoolInviteRepository({ rpc } as any);

    await expect(repo.verifyAndRedeemInviteCode('EXHAUSTED', 'user-1')).rejects.toThrow(
      'Invite exhausted',
    );
    await expect(repo.verifyAndRedeemInviteCode('MALFORMED', 'user-1')).rejects.toThrow(
      'invalid authority result',
    );
  });

  it('selects and refreshes only after the atomic claim, and keeps retry safe after selection failure', async () => {
    const repository = {
      verifyAndRedeemInviteCode: vi
        .fn()
        .mockResolvedValue({ bondId: 'bond-1', schoolId: 'school-1', capacity: 'teacher' }),
    };
    const identity = { switchPerspective: vi.fn().mockRejectedValueOnce(new Error('offline')) };
    const refreshIdentity = vi.fn().mockResolvedValue(undefined);

    await expect(
      claimAndSelectSchoolInvite({
        repository,
        identity,
        refreshIdentity,
        code: 'SCHOOL',
        userId: 'user-1',
      }),
    ).rejects.toThrow('offline');
    expect(refreshIdentity).not.toHaveBeenCalled();

    identity.switchPerspective.mockResolvedValueOnce(undefined);
    await expect(
      claimAndSelectSchoolInvite({
        repository,
        identity,
        refreshIdentity,
        code: 'SCHOOL',
        userId: 'user-1',
      }),
    ).resolves.toMatchObject({ bondId: 'bond-1' });
    expect(identity.switchPerspective).toHaveBeenLastCalledWith('school-1', 'teacher');
    expect(refreshIdentity).toHaveBeenCalledTimes(1);
  });
});
