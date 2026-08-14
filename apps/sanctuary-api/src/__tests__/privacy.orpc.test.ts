import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('privacy ledger API', () => {
  it('rejects malformed privacy event payloads before database access', async () => {
    await expect(
      createTestORPCClient().privacy.logPrivacyEvent({
        activity_type: '',
        resource_name: 'profile',
        description: 'Viewed profile',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
