import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockDailyContentRows, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: daily content via native oRPC', () => {
  const headers = { Authorization: 'Bearer 123e4567-e89b-8101-8000-426614174000' };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-daily',
      user_id: '123e4567-e89b-8101-8000-426614174000',
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockDailyContentRows([
      {
        id: 'daily-1',
        type: 'motivation',
        content: 'Keep going.',
        author: 'Sanctuary',
        date: '2026-07-30',
        active: true,
        created_at: '2026-07-30T00:00:00.000Z',
      },
    ]);
  });

  it('validates and returns the typed today DTO through the real app fetch path', async () => {
    const body = await createTestORPCClient(headers).dailyContent.getToday();

    expect(body.motivation).toMatchObject({ id: 'daily-1', content: 'Keep going.' });
    expect(body.didYouKnow).toBeNull();
  });

  it('uses typed date input and returns a list DTO', async () => {
    const body = await createTestORPCClient(headers).dailyContent.getForDate({
      params: { date: '2026-07-30' },
    });

    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ type: 'motivation', active: true });
  });

  it('uses typed recent path input and rejects flattened input', async () => {
    const client = createTestORPCClient(headers).dailyContent;

    await expect(client.getRecent({ params: { days: 7 } })).resolves.toHaveLength(1);
    await expect((client.getRecent as any)({ days: 7 })).rejects.toBeTruthy();
  });
});
