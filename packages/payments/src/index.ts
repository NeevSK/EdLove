import { PayHereProvider } from "./plugins/payhere";
import { StripeProvider } from "./plugins/stripe";
import { payments } from "./registry";

export * from "./registry";
export * from "./service";
export * from "./types";

// Auto-register default providers
payments.register(new PayHereProvider());
payments.register(new StripeProvider());
