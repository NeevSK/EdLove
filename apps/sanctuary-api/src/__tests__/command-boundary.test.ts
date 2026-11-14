import { describe, expect, it, vi } from 'vitest';
import { readServerConfig } from '../config';
import { createPlatform } from '../platform';

describe('assembled command authority admission', () => {
  it('rejects both authority modes before storage instead of normalizing ambiguity away', async () => {
    const platform = createPlatform(
      readServerConfig({
        API_AUTHENTICATION: 'required',
        DATABASE_URL: 'postgresql://localhost/unused',
        AUTH_ISSUER: 'https://identity.example',
        AUTH_JWKS_URL: 'https://identity.example/jwks',
        AUTH_AUDIENCE: 'test',
      }),
    );
    if (!platform) throw new Error('Expected authenticated platform');
    const execute = vi
      .spyOn(platform.operations, 'execute')
      .mockRejectedValue(new Error('storage reached'));
    const command = {
      scope: {
        identity: {
          accountId: '01234567-89ab-8101-8000-010203040506',
          subject: 'subject',
          sessionId: 'session',
          expiresAt: 0,
        },
        bondId: 'bond',
        entityId: 'school',
        entityType: 'SCHOOL' as const,
        capacity: 'teacher',
        citizenship: 'FIRST_CLASS' as const,
      },
      capability: 'Learning::submit',
      domainCapability: {
        name: 'Learning::submit' as const,
        resourceType: 'Assignment',
        resolveResource: async () => ({ id: 'record', attributes: {} }),
      },
      key: '123e4567-e89b-4123-8123-426614174002',
      payload: null,
      deriveScope: () => 'school',
      signal: new AbortController().signal,
      mutate: async () => null,
    };
    // JavaScript adapters can violate the compile-time union at runtime.
    Object.defineProperty(command, 'policy', {
      value: {
        action: 'create',
        resourceType: 'Assignment',
        resolveResource: async () => null,
      },
    });
    try {
      await expect(platform.executeAccountCommand(command)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      expect(execute).not.toHaveBeenCalled();
    } finally {
      execute.mockRestore();
      await platform.close();
    }
  });
});
