import { Inngest } from "inngest";
import { type PlatformEvents } from "@repo/core";

/**
 * Gurudevi Inngest Client
 * 
 * shell-level initialization of the Inngest bus.
 * Pulls event definitions directly from @repo/core to ensure
 * consistency across mobile and web shells.
 */
export const inngest = new Inngest({ 
  id: "Gurudevi-OS",
  // Modernized for v4: Pure typing approach
  schemas: {} as PlatformEvents,
});

export default inngest;
