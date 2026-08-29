import { ORPCError } from '@orpc/server';
import { erpContract } from '@repo/core/api/erp.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(erpContract).$context<ORPCContext>();
const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value ?? ''));

const mapAccount = (row: any) => ({
  id: String(row.id),
  name: String(row.name),
  code: String(row.code),
  type: String(row.type),
  parent_id: row.parent_id ?? null,
  balance: Number(row.balance ?? 0),
  metadata: row.metadata ?? null,
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

const mapEntry = (row: any) => ({
  id: String(row.id),
  transaction_id: String(row.transaction_id),
  account_id: String(row.account_id),
  amount: Number(row.amount),
  side: row.side,
  description: row.description ?? null,
  created_at: iso(row.created_at),
});

const mapTransaction = (row: any) => ({
  id: String(row.id),
  date: iso(row.date),
  description: String(row.description),
  reference_no: row.reference_no ?? null,
  metadata: row.metadata ?? null,
  created_at: iso(row.created_at),
  entries: Array.isArray(row.entries) ? row.entries.map(mapEntry) : [],
});

const mapPaymentIntent = (row: any) => ({
  id: String(row.id),
  amount: Number(row.amount),
  currency: String(row.currency),
  status: String(row.status),
  provider: String(row.provider),
  client_secret: row.client_secret ?? null,
  metadata: row.metadata ?? null,
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

const mapInvoice = (row: any) => ({
  id: String(row.id),
  customer_id: String(row.customer_id),
  amount: Number(row.amount),
  currency: String(row.currency),
  status: String(row.status),
  due_date: iso(row.due_date),
  items: row.items ?? [],
  metadata: row.metadata ?? null,
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

const mapReceipt = (row: any) => ({
  id: String(row.id),
  invoice_id: row.invoice_id ?? null,
  amount: Number(row.amount),
  currency: String(row.currency),
  paid_at: iso(row.paid_at),
  payment_method: String(row.payment_method),
  receipt_url: row.receipt_url ?? null,
  created_at: iso(row.created_at),
});

export const erpRouter = impl.router({
  getAccounts: impl.getAccounts.use(doubleGateMiddleware).handler(async ({ context }) => {
    assertDatabase(context);
    const rows = await context.db.account.findMany({ orderBy: { code: 'asc' } });
    return rows.map(mapAccount);
  }),

  getTransactions: impl.getTransactions
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const rows = await context.db.financialTransaction.findMany({
        where: {
          ...(input.accountId ? { entries: { some: { account_id: input.accountId } } } : {}),
          ...(input.startDate || input.endDate
            ? {
                date: {
                  ...(input.startDate ? { gte: new Date(input.startDate) } : {}),
                  ...(input.endDate ? { lte: new Date(input.endDate) } : {}),
                },
              }
            : {}),
        },
        include: { entries: true },
        orderBy: { date: 'desc' },
      });
      return rows.map(mapTransaction);
    }),

  recordTransaction: impl.recordTransaction
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const debitTotal = input.entries
        .filter((entry) => entry.side === 'debit')
        .reduce((sum, entry) => sum + entry.amount, 0);
      const creditTotal = input.entries
        .filter((entry) => entry.side === 'credit')
        .reduce((sum, entry) => sum + entry.amount, 0);
      if (Math.abs(debitTotal - creditTotal) > 0.000001)
        throw new ORPCError('BAD_REQUEST', {
          message: 'Financial transactions must have balanced debit and credit totals.',
        });

      const row = await context.db.$transaction(async (tx: any) => {
        const transaction = await tx.financialTransaction.create({
          data: {
            date: input.date ? new Date(input.date) : new Date(),
            description: input.description,
            reference_no: input.referenceNo ?? null,
            metadata: input.metadata ?? null,
          },
        });
        await tx.ledgerEntry.createMany({
          data: input.entries.map((entry) => ({
            transaction_id: transaction.id,
            account_id: entry.accountId,
            amount: entry.amount,
            side: entry.side,
            description: entry.description ?? null,
          })),
        });
        return tx.financialTransaction.findUnique({
          where: { id: transaction.id },
          include: { entries: true },
        });
      });
      return mapTransaction(row);
    }),

  createPaymentIntent: impl.createPaymentIntent
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const metadata = {
        ...(input.metadata ?? {}),
        owner_id: context.user.id,
        ...(input.idempotencyKey
          ? { idempotency_key: `${context.user.id}:${input.provider}:${input.idempotencyKey}` }
          : {}),
        provider_integration: 'database_intent_only',
      };
      const existing = input.idempotencyKey
        ? await context.db.paymentIntent.findFirst({
            where: { metadata: { path: ['idempotency_key'], equals: input.idempotencyKey } } as any,
          })
        : null;
      if (existing) return mapPaymentIntent(existing);
      let row;
      try {
        row = await context.db.paymentIntent.create({
          data: {
            amount: input.amount,
            currency: input.currency.toUpperCase(),
            provider: input.provider,
            status: 'pending',
            metadata,
          },
        });
      } catch (error) {
        if (!input.idempotencyKey) throw error;
        const replay = await context.db.paymentIntent.findFirst({
          where: {
            metadata: { path: ['idempotency_key'], equals: metadata.idempotency_key },
          } as any,
        });
        if (replay) return mapPaymentIntent(replay);
        throw SovereignError.conflict('PAYMENT_INTENT_IDEMPOTENCY_CONFLICT');
      }
      return mapPaymentIntent(row);
    }),

  getInvoices: impl.getInvoices.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const rows = await context.db.invoice.findMany({
      where: {
        ...(input.customerId ? { customer_id: input.customerId } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
      orderBy: { created_at: 'desc' },
    });
    return rows.map(mapInvoice);
  }),

  getReceipt: impl.getReceipt.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const row = await context.db.receipt.findUnique({ where: { id: input.id } });
    if (!row) throw SovereignError.notFound('Receipt');
    return mapReceipt(row);
  }),
});
