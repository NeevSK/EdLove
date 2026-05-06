import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

/**
 * PaymentIntentSchema - Orchestrating a future transfer of value.
 * Derived from ZenStack PaymentIntent model.
 */
export const PaymentIntentSchema = makeModelSchema('PaymentIntent');

/**
 * InvoiceSchema - A formal request for settlement.
 * Derived from ZenStack Invoice model.
 */
export const InvoiceSchema = makeModelSchema('Invoice');

/**
 * ReceiptSchema - Proof of successful value exchange.
 * Derived from ZenStack Receipt model.
 */
export const ReceiptSchema = makeModelSchema('Receipt');

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type Receipt = z.infer<typeof ReceiptSchema>;
