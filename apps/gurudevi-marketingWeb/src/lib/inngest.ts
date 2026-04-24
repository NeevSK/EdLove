import { Inngest } from "inngest";
import { schemas } from "@repo/core";

/**
 * Gurudevi Inngest Client (Marketing Shell)
 * 
 * 🐚 IMPERATIVE SHELL:
 * This is where the actual Inngest instance lives for the marketing site.
 * It uses the 'Sovereign Brain' (schemas from @repo/core) for type safety.
 */
export const inngest = new Inngest({ 
  id: "gurudevi-marketing-web",
  schemas: schemas,
  // Astro uses import.meta.env
  eventKey: import.meta.env.INNGEST_EVENT_KEY,
});

export default inngest;
