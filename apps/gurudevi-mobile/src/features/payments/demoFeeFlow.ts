import { PayHereProvider, StripeProvider } from '@repo/payments/plugins';
import { payments, type PaymentProvider } from '@repo/payments/registry';
import { ledger, ChequeManager } from '@repo/accounting';

const payments = require('@repo/payments/registry');
const stripeProvider = new (require('@repo/payments/plugins').StripeProvider)();
payments.register(stripeProvider);

export async function demoFeeFlow(amount: number, currency: string = 'USD') {
  const intent = await payments.initializePayment(amount, currency, { demo: true });
  return intent;
}

export async function recordFeeTransaction(userId: string, amount: number) {
  await ledger.recordTransaction({
    type: 'fee_collection',
    userId,
    amount,
    currency: 'USD',
    description: 'Demo fee collection',
  }, [
    { accountId: 'revenue:fees', amount, type: 'credit' },
    { accountId: `user:${userId}:wallet`, amount, type: 'debit' },
  ]);
}