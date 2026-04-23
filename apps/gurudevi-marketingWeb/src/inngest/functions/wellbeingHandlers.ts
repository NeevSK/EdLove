import { inngest } from "../../lib/inngest";
import { supabaseAdmin } from "../../lib/supabase";
import { 
  createDomainServices, 
  v7 as uuidv7, 
  generateIdempotencyKey 
} from "@repo/core";

/**
 * Handle Wellbeing Mood Logged Event
 * 
 * Example of 'God Mode' Durable Execution:
 * - Uses Service Role (supabaseAdmin)
 * - Injects 'God Mode' client into pure Core services
 * - Performs manual audit logging within step.run
 */
export const wellbeingMoodLogged = (inngest as any).createFunction(
  { id: "wellbeing-mood-logged-handler", name: "Process Student Mood Log" },
  { event: "wellbeing/mood-logged" },
  async ({ event, step }: { event: any; step: any }) => {
    const { studentId, moodScore, schoolId } = event.data;

    // 1. Initialize 'God Mode' services (Imperative Shell)
    const services = createDomainServices(supabaseAdmin);

    // 2. Deterministic Idempotency Key
    // We use SHA-256 digest of the intent to ensure background consistency
    const idempotencyKey = await step.run("generate-key", () => 
      generateIdempotencyKey(
        "wellbeing", 
        "MOOD_LOG_PROCESS", 
        { studentId, moodScore }, 
        studentId
      )
    );

    // 3. Systemic Reaction: Logic evaluation happens in the Pure Core
    const needsIntervention = moodScore <= 2;

    if (needsIntervention) {
      await step.run("create-intervention-task", async () => {
         // This is a placeholder for a real systemic action
         // e.g., services.wellbeing.createInterventionTask(...)
         console.log(`[ALERT] Student ${studentId} mood is ${moodScore}. Triggering intervention.`);
      });

      // 4. Manual Audit Trail (Durable & Traceable)
      await step.run("log-audit-trail", async () => {
        const auditId = uuidv7();
        const { error } = await supabaseAdmin
          .from('audit_logs')
          .insert({
            id: auditId,
            action: 'wellbeing_intervention_triggered',
            entity_id: studentId,
            entity_type: 'student',
            school_id: schoolId,
            metadata: { 
              moodScore,
              trigger: 'inngest_background_worker'
            },
            idempotency_key: `${idempotencyKey}:audit`
          });

        if (error) throw error;
      });
    }

    return { 
      processed: true, 
      intervention: needsIntervention 
    };
  }
);
