import { Inngest } from 'inngest';

/**
 * Gurudevi Inngest Client (Marketing Shell)
 *
 * This is the runtime shell for the current Vercel-hosted worker endpoint.
 * Shared event contracts are imported from @repo/core by the functions that
 * run on this client.
 */
export const inngest = new Inngest({
  id: 'gurudevi-marketing-web',
  eventKey: import.meta.env.INNGEST_EVENT_KEY,
});

export default inngest;
