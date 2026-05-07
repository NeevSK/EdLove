import {
	createDomainServices,
	sendSchoolAttendanceRecorded,
	syncMutationQueuedEvent,
	v7 as uuidv7,
} from "@repo/core/logic";
import { inngest } from "../../lib/inngest";
import { supabaseAdmin } from "../../lib/supabase";
import { insertWorkerAuditLog } from "../lib/workerObservability";

type AttendanceMutationPayload = {
	classroomId: string;
	studentId: string;
	status: string;
	date: string;
};
function asAttendancePayload(payload: unknown): AttendanceMutationPayload {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Attendance mutation payload must be an object.");
	}
	const record = payload as Record<string, unknown>;
	if (
		typeof record["classroomId"] !== "string" ||
		typeof record["studentId"] !== "string" ||
		typeof record["status"] !== "string" ||
		typeof record["date"] !== "string"
	) {
		throw new Error(
			"Attendance mutation payload requires string classroomId, studentId, status, and date fields.",
		);
	}
	return {
		classroomId: record["classroomId"],
		studentId: record["studentId"],
		status: record["status"],
		date: record["date"],
	};
}
function asInsertablePayload(
	payload: unknown,
): Record<string, unknown> | Array<Record<string, unknown>> {
	if (Array.isArray(payload)) {
		return payload as Array<Record<string, unknown>>;
	}
	if (payload && typeof payload === "object") {
		return payload as Record<string, unknown>;
	}
	throw new Error("Remote mutation payload must be an object or object array.");
}
async function executeRemoteMutation(
	action: string,
	payload: unknown,
	metadata?: {
		correlationId?: string;
		causationId?: string;
		tenantId?: string;
	},
) {
	switch (action) {
		case "saveJournalEntry": {
			const { error } = await supabaseAdmin
				.from("journal_entries")
				.insert(asInsertablePayload(payload));
			if (error) throw error;
			return { action, executed: true, target: "journal_entries" };
		}
		case "saveDecision": {
			const { error } = await supabaseAdmin
				.from("decision_journals")
				.insert(asInsertablePayload(payload));
			if (error) throw error;
			return { action, executed: true, target: "decision_journals" };
		}
		case "updateAttendance": {
			const { classroomId, studentId, status, date } =
				asAttendancePayload(payload);
			const domainServices = createDomainServices(supabaseAdmin);
			const record = await domainServices.educational.attendance.record(
				classroomId,
				studentId,
				status,
				date,
			);
			await sendSchoolAttendanceRecorded(inngest, {
				...record,
				correlationId: metadata?.correlationId,
				causationId: metadata?.causationId,
				tenantId: metadata?.tenantId,
			});
			return {
				action,
				executed: true,
				target: "attendance",
				recordId: record.id,
			};
		}
		default:
			throw new Error(`Unsupported remote mutation action: ${action}`);
	}
}
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
export const syncMutationQueued = inngest.createFunction(
	{
		id: "sync-mutation-queued",
		name: "Sync Queued Mutation",
		triggers: [syncMutationQueuedEvent],
	},
	async ({ event, step }) => {
		const {
			mutationId,
			action,
			idempotencyKey,
			payload,
			tenantId,
			correlationId,
			causationId,
		} = event.data;
		// 1. Execute selected mutation types inside durable steps.
		const result = await step.run("execute-mutation", async () => {
			return executeRemoteMutation(action, payload, {
				correlationId,
				causationId: causationId ?? mutationId,
				tenantId,
			});
		});
		// 2. Manual Audit Trail with event-level idempotency.
		await step.run("log-mutation-audit", async () => {
			await insertWorkerAuditLog({
				supabase: supabaseAdmin,
				id: uuidv7(),
				action: `sync_complete:${action}`,
				entityId: mutationId,
				entityType: "mutation_record",
				schoolId: tenantId,
				idempotencyKey: idempotencyKey ?? `mutation-sync:${mutationId}`,
				correlationId,
				causationId: causationId ?? mutationId,
				metadata: {
					action,
					payload,
					result,
					trigger: "inngest_mutation_sync",
				},
			});
		});
		return {
			mutationId,
			status: "synced",
			result,
		};
	},
);
