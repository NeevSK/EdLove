import './setup';
import { ASSIGNMENT_SUBMISSION_CAPABILITY } from '@repo/core/api/educational.contract';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../core/app';
import { createTestORPCClient } from './orpc-client';
import {
  getMockLastQueryRawArgs,
  setMockActiveBond,
  setMockRawQueryRowsQueue,
  setMockZenStackDbAvailable,
} from './setup';

const accountId = '123e4567-e89b-12d3-a456-426614174000';
const operationId = '123e4567-e89b-12d3-a456-426614174001';
const idempotencyKey = '123e4567-e89b-12d3-a456-426614174002';
const submissionId = '123e4567-e89b-12d3-a456-426614174003';
const headers = { Authorization: `Bearer ${accountId}` };
const query = { capability: ASSIGNMENT_SUBMISSION_CAPABILITY, idempotencyKey };
const row = {
  operation_id: operationId,
  capability: ASSIGNMENT_SUBMISSION_CAPABILITY,
  status: 'committed',
  result: { submissionId, privateField: 'must-not-leak' },
  error_message: 'synthetic-provider-password',
  payload_hash: 'internal-hash',
  created_at: new Date('2026-10-15T00:00:00.000Z'),
  updated_at: new Date('2026-10-15T01:00:00.000Z'),
};

describe('operation receipt recovery (authentication/database substituted)', () => {
  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      user_id: accountId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
    });
    setMockRawQueryRowsQueue([[row]]);
  });

  it('recovers by the caller-known capability/key with a parameterized account predicate', async () => {
    const receipt = await createTestORPCClient(headers).educational.getOperationReceiptByKey({
      query,
    });
    expect(receipt).toEqual({
      operationId,
      capability: query.capability,
      status: 'committed',
      result: { submissionId },
      errorCode: null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    });
    expect(getMockLastQueryRawArgs()).toEqual([
      expect.any(Array),
      accountId,
      query.capability,
      idempotencyKey,
    ]);
    const sqlParts = getMockLastQueryRawArgs()?.[0];
    expect(Array.isArray(sqlParts) ? sqlParts.join('?') : '').toContain(
      'WHERE account_id = ?::uuid',
    );
  });

  it('retains operation-ID lookup with the same account predicate', async () => {
    expect(
      await createTestORPCClient(headers).educational.getOperationReceipt({
        params: { operationId },
      }),
    ).toMatchObject({ operationId, result: { submissionId } });
    expect(getMockLastQueryRawArgs()).toEqual([expect.any(Array), accountId, operationId]);
  });

  it.each(['pending', 'failed', 'conflict'])(
    'does not expose stored results or exception text for %s',
    async (status) => {
      setMockRawQueryRowsQueue([[{ ...row, status }]]);
      const receipt = await createTestORPCClient(headers).educational.getOperationReceiptByKey({
        query,
      });
      expect(receipt.result).toBeNull();
      expect(JSON.stringify(receipt)).not.toContain('synthetic-provider-password');
      expect(JSON.stringify(receipt)).not.toContain('must-not-leak');
      expect(receipt.errorCode).toBe(
        status === 'failed'
          ? 'OPERATION_FAILED'
          : status === 'conflict'
            ? 'OPERATION_CONFLICT'
            : null,
      );
    },
  );

  it('returns not found when the account-scoped query finds no receipt', async () => {
    setMockRawQueryRowsQueue([[]]);
    await expect(
      createTestORPCClient(headers).educational.getOperationReceiptByKey({ query }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejects account selectors and malformed capability/key values at the contract', async () => {
    await expect(
      createTestORPCClient(headers).educational.getOperationReceiptByKey({
        query: { ...query, accountId: 'someone-else' },
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      createTestORPCClient(headers).educational.getOperationReceiptByKey({
        query: { ...query, idempotencyKey: 'bad-key' },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('denies anonymous recovery before reading a receipt', async () => {
    await expect(
      createTestORPCClient().educational.getOperationReceiptByKey({ query }),
    ).rejects.toMatchObject({ status: 403 });
    expect(getMockLastQueryRawArgs()).toBeNull();
  });

  it('supports canonical plain OpenAPI query parameters and the same safe projection', async () => {
    const response = await app.request(
      `/api/openapi/educational/operation-receipts/by-key?capability=${query.capability}&idempotencyKey=${idempotencyKey}`,
      { headers },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ operationId, result: { submissionId } });
  });

  it('fails generically rather than returning malformed committed result data', async () => {
    setMockRawQueryRowsQueue([
      [{ ...row, result: { submissionId: 'synthetic-provider-password' } }],
    ]);
    await expect(
      createTestORPCClient(headers).educational.getOperationReceiptByKey({ query }),
    ).rejects.toMatchObject({ status: 500, message: 'An unexpected platform error occurred.' });
  });
});
