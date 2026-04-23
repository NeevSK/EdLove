import { serve } from "inngest/astro";
import { inngest } from "../../lib/inngest";
import { wellbeingMoodLogged } from "../../inngest/functions/wellbeingHandlers";
import { syncMutationQueued } from "../../inngest/functions/mutationHandlers";

export const prerender = false;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    wellbeingMoodLogged,
    syncMutationQueued,
  ],
});
