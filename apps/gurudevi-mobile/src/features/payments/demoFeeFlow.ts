import { payments } from '@repo/payments';

export async function demoFeeFlow(amount: number, currency: string = 'USD') {
  const provider = payments.getCheapestProvider(amount) || payments.getAllProviders()[0];
  if (!provider) {
    throw new Error('No payment provider available');
  }
  const intent = await provider.initializePayment(amount, currency, { demo: true });
  return intent;
}
