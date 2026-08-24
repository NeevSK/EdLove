import { Inngest } from 'inngest';

export const sanctuaryInngest = new Inngest({
  id: 'gurudevi-sanctuary-api',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
