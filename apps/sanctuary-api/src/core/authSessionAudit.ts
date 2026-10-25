import { queryDatabaseRows } from '@repo/database/client';
import { z } from 'zod';

const receiptRows = z.tuple([z.strictObject({ id: z.uuid() })]);

export async function appendAuthSessionAudit(
  accountId: string,
  operationId: string,
  result: 'initiated' | 'confirmed' | 'unconfirmed',
) {
  const rows = await queryDatabaseRows<unknown>(
    'SELECT public.append_auth_session_audit($1::uuid,$2::uuid,$3::text) AS id',
    [accountId, operationId, result],
  );
  return receiptRows.parse(rows)[0].id;
}

export async function appendAuthPasswordAudit(
  accountId: string,
  operationId: string,
  result: 'initiated' | 'confirmed' | 'unconfirmed',
  databaseUrl?: string,
) {
  return appendAuthCredentialAudit(accountId, operationId, 'password_change', result, databaseUrl);
}

export async function appendAuthCredentialAudit(
  accountId: string,
  operationId: string,
  action: 'password_change' | 'identity_unlink',
  result: 'initiated' | 'confirmed' | 'unconfirmed',
  databaseUrl?: string,
) {
  const rows = await queryDatabaseRows<unknown>(
    'SELECT public.append_auth_operation_audit($1::uuid,$2::uuid,$3::text,$4::text) AS id',
    [accountId, operationId, action, result],
    databaseUrl,
  );
  return receiptRows.parse(rows)[0].id;
}
