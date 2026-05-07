import { v7 as uuidv7, wellbeingMoodLoggedEvent } from "@repo/core/logic";
import { generateIdempotencyKey } from "@repo/core/sync";
import { inngest } from "../../lib/inngest";
import { supabaseAdmin } from "../../lib/supabase";
import {
	insertWorkerAuditLog,
	trackWorkerAnalytics,
} from "../lib/workerObservability";
/**
 * Handle Wellbeing Mood Logged Event
 *
 * Example of 'God Mode' Durable Execution:
 * - Uses Service Role (supabaseAdmin)
 * - Injects 'God Mode' client into pure Core services
 * - Performs manual audit logging within step.run
 */
export const wellbeingMoodLogged = inngest.createFunction(
	{
		id: "wellbeing-mood-logged-handler",
		name: "Process Student Mood Log",
		triggers: [wellbeingMoodLoggedEvent],
	},
	async ({ event, step }) => {
		const { studentId, moodScore, schoolId, correlationId, causationId } =
			event.data;
		// 2. Deterministic Idempotency Key
		// We use SHA-256 digest of the intent to ensure background consistency
		const idempotencyKey = await step.run("generate-key", () =>
			generateIdempotencyKey(
				"wellbeing",
				"MOOD_LOG_PROCESS",
				{ studentId, moodScore },
				studentId,
			),
		);
		// 3. Systemic Reaction: Logic evaluation happens in the Pure Core
		const needsIntervention = moodScore <= 2;
		if (needsIntervention) {
			await step.run("create-intervention-task", async () => {
				// This is a placeholder for a real systemic action
				// e.g., services.wellbeing.createInterventionTask(...)
				console.log(
					`[ALERT] Student ${studentId} mood is ${moodScore}. Triggering intervention.`,
				);
			});
			// 4. Manual Audit Trail (Durable & Traceable)
			await step.run("log-audit-trail", async () => {
				await insertWorkerAuditLog({
					supabase: supabaseAdmin,
					id: uuidv7(),
					action: "wellbeing_intervention_triggered",
					entityId: studentId,
					entityType: "student",
					schoolId,
					idempotencyKey: `${idempotencyKey}:audit`,
					correlationId,
					causationId: causationId ?? studentId,
					metadata: {
						moodScore,
						trigger: "inngest_background_worker",
					},
				});
			});
		}
		// 5. Unified Analytics (God Mode Visibility)
		await step.run("track-posthog-event", async () => {
			await trackWorkerAnalytics({
				eventName: "wellbeing_mood_processed",
				distinctId: studentId,
				correlationId,
				causationId: causationId ?? studentId,
				properties: {
					student_id: studentId,
					mood_score: moodScore,
					intervention_needed: needsIntervention,
					school_id: schoolId,
					worker: "inngest-wellbeing-handler",
				},
			});
		});
		return {
			processed: true,
			intervention: needsIntervention,
			correlationId,
		};
	},
);
