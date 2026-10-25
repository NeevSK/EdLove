import './setup';
import { createZenStackDb } from '@repo/database/client';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getMockLastExecuteRawArgs,
  getMockLastQueryRawArgs,
  setMockDailyContentRows,
  setMockRawQueryRowsQueue,
} from './setup';

describe('raw database boundary fixture ports', () => {
  beforeEach(() => {
    setMockDailyContentRows([]);
    setMockRawQueryRowsQueue([]);
  });

  it('consumes empty and populated FIFO results before the retained fallback', async () => {
    const db = createZenStackDb({ id: '123e4567-e89b-8101-8000-426614174000' });
    setMockDailyContentRows([{ id: 'fallback' }]);
    setMockRawQueryRowsQueue([[], [{ id: 'queued' }]]);
    await expect(db.$queryRaw`SELECT 1`).resolves.toEqual([]);
    await expect(db.$queryRaw`SELECT 2`).resolves.toEqual([{ id: 'queued' }]);
    await expect(db.$queryRaw`SELECT 3`).resolves.toEqual([{ id: 'fallback' }]);
  });

  it('captures parameterized read and write arguments independently and resets them', async () => {
    const db = createZenStackDb({ id: '123e4567-e89b-8101-8000-426614174000' });
    await db.$queryRaw`SELECT id FROM records WHERE owner = ${'owner-id'}`;
    const query = getMockLastQueryRawArgs();
    await expect(db.$executeRaw`UPDATE records SET active = ${false}`).resolves.toBe(1);
    expect(query).toEqual([expect.any(Array), 'owner-id']);
    expect(getMockLastQueryRawArgs()).toBe(query);
    expect(getMockLastExecuteRawArgs()).toEqual([expect.any(Array), false]);
    setMockRawQueryRowsQueue([]);
    expect(getMockLastQueryRawArgs()).toBeNull();
    expect(getMockLastExecuteRawArgs()).toBeNull();
  });

  it('keeps transaction callback reads on the queue without letting writes consume it', async () => {
    const db = createZenStackDb({ id: '123e4567-e89b-8101-8000-426614174000' });
    setMockRawQueryRowsQueue([[{ id: 'transaction-fixture' }]]);
    const result = await db.$transaction(async (tx) => {
      await tx.$executeRaw`UPDATE records SET active = ${true}`;
      return tx.$queryRaw`SELECT id FROM records`;
    });
    expect(result).toEqual([{ id: 'transaction-fixture' }]);
    expect(getMockLastExecuteRawArgs()).toEqual([expect.any(Array), true]);
  });
});
