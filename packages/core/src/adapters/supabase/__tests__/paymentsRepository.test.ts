import { describe, expect, it } from 'vitest';
import { createSupabasePaymentsRepository } from '../paymentsRepository';

function queryBuilder(data: unknown, error: unknown = null) {
  const q: any = {
    select: () => q,
    eq: () => q,
    update: () => q,
    maybeSingle: () => Promise.resolve({ data, error }),
    then: (resolve: (value: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve(resolve({ data, error })),
  };
  return q;
}

describe('PaymentsRepository (G1 Adapter Boundary)', () => {
  it('reads transaction by id from payments schema', async () => {
    let schemaTarget = '';
    let tableTarget = '';

    const supabase = {
      schema(schema: string) {
        schemaTarget = schema;
        return {
          from(table: string) {
            tableTarget = table;
            return queryBuilder({
              id: 'txn-1',
              amount: 5000,
              provider: 'stripe',
              status: 'pending',
            });
          },
        };
      },
    };

    const repo = createSupabasePaymentsRepository(supabase as never);
    const txn = await repo.getTransactionById('txn-1');

    expect(schemaTarget).toBe('payments');
    expect(tableTarget).toBe('transactions');
    expect(txn).toEqual({
      id: 'txn-1',
      amount: 5000,
      provider: 'stripe',
      status: 'pending',
    });
  });

  it('finalizes payment transaction with ledger reference', async () => {
    let updatedPayload: any = null;

    const supabase = {
      schema(schema: string) {
        return {
          from() {
            return {
              update(payload: any) {
                updatedPayload = payload;
                return {
                  eq() {
                    return Promise.resolve({ error: null });
                  },
                };
              },
            };
          },
        };
      },
    };

    const repo = createSupabasePaymentsRepository(supabase as never);
    await repo.finalizeTransaction('txn-1', 'ledger-99');

    expect(updatedPayload).toEqual({
      status: 'succeeded',
      ledger_transaction_id: 'ledger-99',
    });
  });
});
