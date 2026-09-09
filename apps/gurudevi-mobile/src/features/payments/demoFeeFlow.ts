import { Ledger } from '@repo/accounting';
import { payments } from '@repo/payments';

export async function demoFeeFlow(amount: number, currency: string = 'USD') {
  const provider = payments.getCheapestProvider(amount) || payments.getAllProviders()[0];
  if (!provider) {
    throw new Error('No payment provider available');
  }
  const intent = await provider.initializePayment(amount, currency, { demo: true });
  return intent;
}

export async function recordFeeTransaction(userId: string, amount: number) {
  await Ledger.recordTransaction(
    {
      type: 'fee_collection',
      userId,
      amount,
      currency: 'USD',
      description: 'Demo fee collection',
    } as any,
    [
      { accountId: 'revenue:fees', amount, side: 'credit' },
      { accountId: `user:${userId}:wallet`, amount, side: 'debit' },
    ],
  );
}
