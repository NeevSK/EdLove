import { z } from 'zod';

export const PaymentStatusSchema = z.enum([
  'pending',
  'processing',
  'succeeded',
  'failed',
  'refunded',
]);

export const PaymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: PaymentStatusSchema,
  provider: z.string(),
  clientSecret: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['draft', 'open', 'paid', 'uncollectible', 'void']),
  dueDate: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
      quantity: z.number(),
    }),
  ),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const ReceiptSchema = z.object({
  id: z.string(),
  invoiceId: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  paidAt: z.string(),
  paymentMethod: z.string(),
  receiptUrl: z.string().optional(),
});
