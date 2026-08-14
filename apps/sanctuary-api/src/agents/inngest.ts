import { Inngest } from 'inngest';

/** The only Inngest client used by first-party durable work. */
export const sanctuaryInngest = new Inngest({
  id: 'gurudevi-sanctuary-api',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
