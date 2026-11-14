import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getClaims: vi.fn(),
  listFactors: vi.fn(),
  level: vi.fn(),
  verify: vi.fn(),
  reauthenticate: vi.fn(),
}));
vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      getSession: mocks.getSession,
      getClaims: mocks.getClaims,
      reauthenticate: mocks.reauthenticate,
      mfa: {
        listFactors: mocks.listFactors,
        getAuthenticatorAssuranceLevel: mocks.level,
        challengeAndVerify: mocks.verify,
      },
    },
  }),
}));

import {
  changeSecurityPassword,
  loadSecuritySnapshot,
  requestSecurityPasswordCode,
  resolveSecurityOwner,
  unlinkSecurityCredential,
  verifySecurityTotp,
} from './securityClient';

const owner = {
  accountId: '123e4567-e89b-8101-8100-426614174000',
  authSubjectId: 'f0570000-0000-4000-8000-000000000001',
};
const identityId = 'f0570000-0000-4000-8000-000000000002';
const factorId = 'f0570000-0000-4000-8000-000000000003';
const session = {
  access_token: 'synthetic-token',
  user: { id: owner.authSubjectId, is_anonymous: false },
};
const inventory = {
  accountId: owner.accountId,
  anonymous: false,
  provider: 'supabase',
  identities: [{ id: identityId, provider: 'google' }],
};
const receipt = {
  accountId: owner.accountId,
  operationId: 'f0570000-0000-4000-8000-000000000004',
  receiptId: 'f0570000-0000-4000-8000-000000000005',
  identityId,
  provider: 'google',
  status: 'confirmed',
  user: { id: owner.authSubjectId },
};
const load = () => loadSecuritySnapshot(owner, new AbortController().signal);
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
  vi.stubGlobal('fetch', vi.fn());
  mocks.getSession.mockResolvedValue({ data: { session }, error: null });
  mocks.getClaims.mockResolvedValue({
    data: { claims: { sub: owner.authSubjectId, canonical_account_id: owner.accountId } },
    error: null,
  });
  mocks.listFactors.mockResolvedValue({
    data: {
      totp: [
        { id: factorId, friendly_name: 'My authenticator', private_field: 'private-factor-data' },
      ],
    },
    error: null,
  });
  mocks.level.mockResolvedValue({ data: { currentLevel: 'aal2' }, error: null });
  mocks.verify.mockResolvedValue({ error: null });
  mocks.reauthenticate.mockResolvedValue({ error: null });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('G1 browser security HTTP/auth boundaries', () => {
  it('resolves an account owner only from verified canonical claims', async () => {
    await expect(resolveSecurityOwner()).resolves.toEqual(owner);
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: owner.authSubjectId, canonical_account_id: identityId } },
      error: null,
    });
    await expect(resolveSecurityOwner()).rejects.toThrow('could not be verified');
  });
  it('requests confirmation explicitly without sending a password mutation', async () => {
    await requestSecurityPasswordCode(owner);
    expect(mocks.reauthenticate).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('keeps confirmation delivery errors private', async () => {
    mocks.reauthenticate.mockResolvedValue({ error: { message: 'private-delivery-secret' } });
    await expect(requestSecurityPasswordCode(owner)).rejects.toThrow(
      'Could not request a confirmation code. Try again.',
    );
  });
  it('changes a password only through the strict Sanctuary command and matching receipt', async () => {
    const passwordReceipt = {
      accountId: owner.accountId,
      operationId: receipt.operationId,
      receiptId: receipt.receiptId,
      status: 'confirmed',
      user: receipt.user,
    };
    vi.mocked(fetch).mockResolvedValue(Response.json(passwordReceipt));
    await expect(
      changeSecurityPassword(owner, 'synthetic-new', {
        currentPassword: 'synthetic-old',
        nonce: '123456',
      }),
    ).resolves.toEqual(passwordReceipt);
    expect(fetch).toHaveBeenCalledWith(
      'https://sanctuary.example/api/auth/credentials/password',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store',
        redirect: 'error',
        body: JSON.stringify({
          password: 'synthetic-new',
          currentPassword: 'synthetic-old',
          nonce: '123456',
        }),
      }),
    );
  });
  it.each([
    'RECENT_MFA_REQUIRED',
    'PASSWORD_REAUTHENTICATION_REQUIRED',
    'PASSWORD_REAUTHENTICATION_INVALID',
    'PASSWORD_UNCHANGED',
    'PASSWORD_TOO_WEAK',
    'unknown_secret',
  ])('denies password correction %s without exposing upstream text or retrying', async (error) => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ error }, { status: 400 }));
    await expect(changeSecurityPassword(owner, 'synthetic-new')).rejects.not.toThrow(
      'unknown_secret',
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('rejects a password receipt for another subject', async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({
        accountId: owner.accountId,
        operationId: receipt.operationId,
        receiptId: receipt.receiptId,
        status: 'confirmed',
        user: { id: identityId },
      }),
    );
    await expect(changeSecurityPassword(owner, 'synthetic-new')).rejects.toThrow(
      'receipt ownership',
    );
  });
  it('reads a strict account inventory with bounded no-store transport and minimal factors', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json(inventory));
    const snapshot = await load();
    expect(snapshot).toEqual({
      ...inventory,
      factors: [{ id: factorId, friendly_name: 'My authenticator' }],
      assurance: 'aal2',
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://sanctuary.example/api/auth/credentials',
      expect.objectContaining({
        cache: 'no-store',
        redirect: 'error',
        signal: expect.any(AbortSignal),
        headers: { Authorization: 'Bearer synthetic-token' },
      }),
    );
    expect(JSON.stringify(snapshot)).not.toMatch(/private-factor-data|synthetic-token/);
  });
  it('rejects a foreign canonical claim before contacting Sanctuary', async () => {
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: owner.authSubjectId, canonical_account_id: 'other-account' } },
      error: null,
    });
    await expect(load()).rejects.toThrow('identity changed');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects a receipt-shaped inventory for a different account', async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ ...inventory, accountId: '123e4567-e89b-8101-8100-426614174001' }),
    );
    await expect(load()).rejects.toThrow('another account');
  });
  it('rejects inventory arriving after the SDK subject changed', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json(inventory));
    mocks.getSession
      .mockResolvedValueOnce({ data: { session }, error: null })
      .mockResolvedValueOnce({
        data: { session: { ...session, user: { ...session.user, id: 'different-subject' } } },
        error: null,
      });
    await expect(load()).rejects.toThrow('session changed');
  });
  it('does not interpret unavailable factors as a trusted environment', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json(inventory));
    mocks.listFactors.mockResolvedValue({
      data: null,
      error: { message: 'private-provider-error' },
    });
    await expect(load()).rejects.toThrow('Authenticator details are unavailable');
  });
  it('does not run cancelled inventory reads', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(loadSecuritySnapshot(owner, controller.signal)).rejects.toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('discards an inventory read cancelled while its transport is pending', async () => {
    let finish!: (value: Response) => void;
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    );
    const controller = new AbortController();
    const pending = loadSecuritySnapshot(owner, controller.signal);
    const rejected = expect(pending).rejects.toBeDefined();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    controller.abort();
    finish(Response.json(inventory));
    await rejected;
  });
  it('verifies TOTP without changing or unlinking credentials', async () => {
    await verifySecurityTotp(owner, factorId, '123456');
    expect(mocks.verify).toHaveBeenCalledWith({ factorId, code: '123456' });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('keeps provider verification errors private', async () => {
    mocks.verify.mockResolvedValue({ error: { message: 'private-provider-secret' } });
    await expect(verifySecurityTotp(owner, factorId, '123456')).rejects.toThrow(
      'Authenticator verification failed. Check the code and try again.',
    );
  });
  it('accepts only a matching server unlink receipt and sends no account selector', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json(receipt));
    await expect(unlinkSecurityCredential(owner, identityId)).resolves.toEqual(receipt);
    expect(fetch).toHaveBeenCalledWith(
      'https://sanctuary.example/api/auth/credentials/identities/unlink',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ identityId }),
        cache: 'no-store',
        redirect: 'error',
      }),
    );
  });
  it.each([
    { ...receipt, accountId: '123e4567-e89b-8101-8100-426614174001' },
    { ...receipt, identityId: factorId },
    { ...receipt, user: { id: factorId } },
  ])('rejects an unrelated unlink confirmation: %j', async (result) => {
    vi.mocked(fetch).mockResolvedValue(Response.json(result));
    await expect(unlinkSecurityCredential(owner, identityId)).rejects.toThrow('receipt ownership');
  });
  it('preserves recovery denial without retrying or exposing arbitrary upstream details', async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ error: 'RECOVERY_CREDENTIAL_REQUIRED' }, { status: 409 }),
    );
    await expect(unlinkSecurityCredential(owner, identityId)).rejects.toThrow(
      'Keep a confirmed email',
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('fails when services are insecurely configured before dispatch', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://insecure.example');
    await expect(unlinkSecurityCredential(owner, identityId)).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});
