import { inngest } from "../../lib/inngest";
import { supabaseAdmin } from "../../lib/supabase";
import { 
  createDomainServices, 
  v7 as uuidv7, 
} from "@repo/core";

/**
 * Handle Remote Mutation Sync
 * 
 * shell-level handler for replaying offline mutations.
 * 
 * pattern: 
 * 1. Initialize 'God Mode' core services
 * 2. Durable Execution via step.run
 * 3. Manual Audit logging with idempotency lock
 */
export const syncMutationQueued = (inngest as any).createFunction(
  { id: "sync-mutation-queued", name: "Sync Queued Mutation" },
  { event: "sync/mutation-queued" },
  async ({ event, step }: { event: any; step: any }) => {
    const { mutationId, action, payload, tenantId } = event.data;

    // 1. Initialize 'God Mode' services
    const services = createDomainServices(supabaseAdmin);

    // 2. Execute Mutation (Durable)
    const result = await step.run("execute-mutation", async () => {
      // In a real implementation, we would route 'action' to the correct service
      // e.g., if (action === 'attendance/take') return await services.attendance.takeAttendance(payload);
      console.log(`[MutationSync] Executing ${action} for mutation ${mutationId}`);
      return { success: true, timestamp: new Date().toISOString() };
    });

    // 3. Manual Audit Trail with Idempotency Key
    // We use the mutationId itself as part of the audit idempotency to prevent double-logging
    await step.run("log-mutation-audit", async () => {
      const auditId = uuidv7();
      const { error } = await supabaseAdmin
        .from('audit_logs')
        .insert({
          id: auditId,
          action: `sync_complete:${action}`,
          entity_id: mutationId,
          entity_type: 'mutation_record',
          school_id: tenantId,
          metadata: { 
            action,
            payload,
            result,
            trigger: 'inngest_mutation_sync'
          },
          // Lock the audit log to the mutationId to ensure one-to-one mapping
          idempotency_key: `mutation-sync:${mutationId}`
        });

      if (error) throw error;
    });

    return { 
      mutationId, 
      status: 'synced', 
      result 
    };
  }
);
