import { payments } from './registry';
import { PayHereProvider } from './plugins/payhere';
import { StripeProvider } from './plugins/stripe';

export * from './types';
export * from './registry';
export * from './service';

// Auto-register default providers
payments.register(new PayHereProvider());
payments.register(new StripeProvider());
