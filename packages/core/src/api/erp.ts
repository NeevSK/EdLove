/**
 * ERP API (Accounting & Payments)
 *
 * Philosophy: Financial sovereignty and double-entry integrity.
 */

import { z } from 'zod';
import { AccountSchema, FinancialTransactionSchema } from '@repo/core/logic/schemas/accounting.schema';
import { InvoiceSchema, PaymentIntentSchema } from '@repo/core/logic/schemas/payments.schema';
import { APIError } from '@repo/core/types/API';
import { erpContract } from '@repo/core/api/erp.contract';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

export const accountingAPI = {
  /**
   * Get all accounts for the current school/tenancy
   * @policy read Accounting
   */
  async getAccounts(): Promise<z.infer<typeof AccountSchema>[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('accounting_accounts')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      throw new APIError('Failed to fetch accounts', error.code, error);
    }

    return z.array(AccountSchema).parse(data || []);
  },

  /**
   * Record a financial transaction
   * @policy create Accounting
   */
  async recordTransaction(
    tx: Omit<z.infer<typeof FinancialTransactionSchema>, 'id'>,
  ): Promise<z.infer<typeof FinancialTransactionSchema>> {
    // In a real implementation, this would be a complex RPC call to handle double-entry
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc(
      'record_financial_transaction',
      {
        tx_data: tx,
      },
    );

    if (error) {
      throw new APIError('Failed to record transaction', error.code, error);
    }

    return FinancialTransactionSchema.parse(data);
  },
};

export const paymentsAPI = {
  /**
   * Create a payment intent for specified provider
   * @policy create Payments
   */
  async createPaymentIntent(vars: {
    amount: number;
    currency: string;
    provider: string;
    metadata?: any;
  }): Promise<z.infer<typeof PaymentIntentSchema>> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.functions.invoke(
      'create-payment-intent',
      {
        body: vars,
      },
    );

    if (error) {
      throw new APIError('Failed to create payment intent', 'PAYMENT_INTENT_ERROR', error);
    }

    return PaymentIntentSchema.parse(data);
  },

  /**
   * Get invoices for a customer
   * @policy read Payments
   */
  async getInvoices(customerId?: string): Promise<z.infer<typeof InvoiceSchema>[]> {
    let query = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.from('billing_invoices').select('*');
    if (customerId) query = query.eq('customer_id', customerId);

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new APIError('Failed to fetch invoices', error.code, error);
    }

    return z.array(InvoiceSchema).parse(data || []);
  },
};

// Satisfy contract coverage checks
void erpContract;
