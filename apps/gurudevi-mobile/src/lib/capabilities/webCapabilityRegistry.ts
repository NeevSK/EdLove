export type WebCapabilityStatus = 'supported' | 'adapter' | 'unavailable';

export type GatewayWebCapabilityId =
  | 'svg-rendering'
  | 'session-persistence'
  | 'telemetry'
  | 'browser-auth'
  | 'native-payment-sheet';

export interface WebCapability {
  id: GatewayWebCapabilityId;
  ownerRoute: string;
  status: WebCapabilityStatus;
  reason: string;
  action: string;
  failureMessage: string;
}

/**
 * Browser behavior that public and gateway-adjacent routes may rely on today.
 *
 * This is deliberately limited to capabilities with a known owner. Adding a
 * Metro alias does not make a feature available: its route must be added here
 * with an honest outcome and a regression test before it can be presented as
 * working on the web.
 */
export const gatewayWebCapabilities = [
  {
    id: 'svg-rendering',
    ownerRoute: '/welcome',
    status: 'adapter',
    reason: 'The current Metro SVG adapter renders the gateway icon subset as browser SVG.',
    action: 'Render the compatible SVG subset through the owned web adapter.',
    failureMessage: 'This illustration is not available in this browser.',
  },
  {
    id: 'session-persistence',
    ownerRoute: '/auth',
    status: 'adapter',
    reason: 'Supabase session state uses AsyncStorage on web, never SecureStore or MMKV.',
    action: 'Persist the scoped session through AsyncStorage.',
    failureMessage:
      'Your browser could not save this session. Please allow site storage and try again.',
  },
  {
    id: 'telemetry',
    ownerRoute: '/welcome',
    status: 'adapter',
    reason:
      'Browser analytics is consent-gated and initialized through the web telemetry adapters.',
    action: 'Initialize telemetry only after explicit analytics consent.',
    failureMessage: 'Optional analytics is unavailable; essential app functions continue normally.',
  },
  {
    id: 'browser-auth',
    ownerRoute: '/auth',
    status: 'supported',
    reason:
      'Email and anonymous entry use the Supabase browser client and AsyncStorage-backed session adapter.',
    action: 'Use the route-local authentication flow and surface returned errors.',
    failureMessage: 'We could not complete sign-in. Check your connection and try again.',
  },
  {
    id: 'native-payment-sheet',
    ownerRoute: '/workspace/demo-fee',
    status: 'unavailable',
    reason:
      'The native Stripe PaymentSheet Metro shim is a compatibility stub, not a browser checkout.',
    action:
      'Do not invoke the native payment sheet; provide a browser checkout adapter before enabling payments.',
    failureMessage:
      'Payments are not available in the browser yet. Please continue in the mobile app.',
  },
] as const satisfies readonly WebCapability[];

export function getGatewayWebCapability(id: GatewayWebCapabilityId): WebCapability {
  const capability = gatewayWebCapabilities.find((entry) => entry.id === id);
  if (!capability) {
    throw new Error(`Unknown gateway web capability: ${id}`);
  }

  return capability;
}
