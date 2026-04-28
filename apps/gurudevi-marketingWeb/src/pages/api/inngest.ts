import { serve } from 'inngest/astro';
import { syncMutationQueued } from '../../inngest/functions/mutationHandlers';
import { wellbeingMoodLogged } from '../../inngest/functions/wellbeingHandlers';
import { inngest } from '../../lib/inngest';

export const prerender = false;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [wellbeingMoodLogged, syncMutationQueued],
});
