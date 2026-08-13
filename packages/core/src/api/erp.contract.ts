import { z } from 'zod';
import { AccountSchema, FinancialTransactionSchema } from '@repo/core/logic/schemas/accounting.schema';
import {
  InvoiceSchema,
  PaymentIntentSchema,
  ReceiptSchema,
} from '@repo/core/logic/schemas/payments.schema';
import type { SovereignContract } from '@repo/core/api/contracts';

const erpAuthority = (action: 'create' | 'read' | 'update' | 'delete', subject: string) =>
  ({ policy: { action, subject } }) as const;

export const erpContract = {
  // Accounting (Ledger)
  getAccounts: {
    method: 'get',
    path: '/erp/accounts',
    responses: {
      200: {
        schema: z.array(AccountSchema),
        description: 'Get accounts list',
      },
    },
    metadata: erpAuthority('read', 'Accounting'),
  },
  getTransactions: {
    method: 'get',
    path: '/erp/transactions',
    request: {
      query: z.object({
        accountId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(FinancialTransactionSchema),
        description: 'Get financial transactions list',
      },
    },
    metadata: erpAuthority('read', 'Accounting'),
  },
  recordTransaction: {
    method: 'post',
    path: '/erp/transactions',
    request: {
      body: FinancialTransactionSchema.omit({ id: true }),
    },
    responses: {
      201: {
        schema: FinancialTransactionSchema,
        description: 'Record transaction successfully',
      },
    },
    metadata: erpAuthority('create', 'Accounting'),
  },

  // Payments
  createPaymentIntent: {
    method: 'post',
    path: '/erp/payments/intent',
    request: {
      body: z.object({
        amount: z.number(),
        currency: z.string(),
        provider: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    },
    responses: {
      201: {
        schema: PaymentIntentSchema,
        description: 'Payment intent created successfully',
      },
    },
    metadata: erpAuthority('create', 'Payments'),
  },
  getInvoices: {
    method: 'get',
    path: '/erp/invoices',
    request: {
      query: z.object({
        customerId: z.string().optional(),
        status: z.string().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(InvoiceSchema),
        description: 'Get invoices list',
      },
    },
    metadata: erpAuthority('read', 'Payments'),
  },
  getReceipt: {
    method: 'get',
    path: '/erp/receipts/:id',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        schema: ReceiptSchema,
        description: 'Retrieve receipt details',
      },
    },
    metadata: erpAuthority('read', 'Payments'),
  },
} as const satisfies SovereignContract;
