import { PayHereProvider } from '@repo/payments/plugins/payhere';
import { StripeProvider } from '@repo/payments/plugins/stripe';
import { payments } from '@repo/payments/registry';

export * from '@repo/payments/registry';
export * from '@repo/payments/service';
export * from '@repo/payments/types';

// Auto-register default providers
payments.register(new PayHereProvider());
payments.register(new StripeProvider());
