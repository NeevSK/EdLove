import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { AccountSchema, FinancialTransactionSchema } from '../logic/schemas/accounting.schema';
import {
  InvoiceSchema,
  PaymentIntentSchema,
  ReceiptSchema,
} from '../logic/schemas/payments.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

/**
 * ERP Contract
 * Orchestrates Financial (Accounting) and Transactional (Payments) domains.
 * Philosophy: Sovereign Accountability & Transparent Exchange.
 */
export const erpContract = c.router({
  // Accounting (Ledger)
  getAccounts: {
    method: 'GET',
    path: '/erp/accounts',
    responses: {
      200: z.array(AccountSchema),
    },
    metadata: POAMetadataSchema.parse({
      policy: {
        action: 'read',
        subject: 'Accounting',
      },
    }),
  },
  getTransactions: {
    method: 'GET',
    path: '/erp/transactions',
    query: z.object({
      accountId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    responses: {
      200: z.array(FinancialTransactionSchema),
    },
    metadata: POAMetadataSchema.parse({
      policy: {
        action: 'read',
        subject: 'Accounting',
      },
    }),
  },
  recordTransaction: {
    method: 'POST',
    path: '/erp/transactions',
    body: FinancialTransactionSchema.omit({ id: true }),
    responses: {
      201: FinancialTransactionSchema,
    },
    metadata: POAMetadataSchema.parse({
      policy: {
        action: 'create',
        subject: 'Accounting',
      },
    }),
  },

  // Payments
  createPaymentIntent: {
    method: 'POST',
    path: '/erp/payments/intent',
    body: z.object({
      amount: z.number(),
      currency: z.string(),
      provider: z.string(),
      metadata: z.record(z.string(), z.any()).optional(),
    }),
    responses: {
      201: PaymentIntentSchema,
    },
    metadata: POAMetadataSchema.parse({
      policy: {
        action: 'create',
        subject: 'Payments',
      },
    }),
  },
  getInvoices: {
    method: 'GET',
    path: '/erp/invoices',
    query: z.object({
      customerId: z.string().optional(),
      status: z.string().optional(),
    }),
    responses: {
      200: z.array(InvoiceSchema),
    },
    metadata: POAMetadataSchema.parse({
      policy: {
        action: 'read',
        subject: 'Payments',
      },
    }),
  },
  getReceipt: {
    method: 'GET',
    path: '/erp/receipts/:id',
    responses: {
      200: ReceiptSchema,
    },
    metadata: POAMetadataSchema.parse({
      policy: {
        action: 'read',
        subject: 'Payments',
      },
    }),
  },
});
