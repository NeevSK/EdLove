import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('student echo API', () => {
  it('rejects malformed echo creation before database access', async () => {
    await expect(
      createTestORPCClient().echoes.sendEcho({
        classroomId: 'bad-id',
        content: 'I need help',
        isAnonymous: true,
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects malformed echo response identifiers at the transport boundary', async () => {
    await expect(
      createTestORPCClient().echoes.respondToEcho({
        echoId: 'bad-id',
        response: 'Thank you for sharing',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
