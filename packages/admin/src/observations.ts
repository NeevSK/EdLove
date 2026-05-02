import { api } from "@repo/core/api";

export interface PrincipalObservation {
	id: string;
	school_id: string;
	principal_id: string;
	type: string;
	content: string;
	created_at: string;
}

export const observationsAPI = {
	async listRecent(
		principalId: string,
		limit = 5,
	): Promise<PrincipalObservation[]> {
		return api.principalWorkspace.listRecentObservations(
			principalId,
			limit,
		) as Promise<PrincipalObservation[]>;
	},

	async listByDate(
		principalId: string,
		viewDate: string,
		limit = 10,
	): Promise<PrincipalObservation[]> {
		return api.principalWorkspace.listObservationsByDate(
			principalId,
			viewDate,
			limit,
		) as Promise<PrincipalObservation[]>;
	},

	async create(input: {
		schoolId: string;
		principalId: string;
		type: string;
		content: string;
	}): Promise<PrincipalObservation> {
		return api.principalWorkspace.createObservation(
			input,
		) as Promise<PrincipalObservation>;
	},

	async recordFollowUp(input: {
		schoolId: string;
		principalId: string;
		observationId: string;
		content: string;
		status?: "noted" | "escalated" | "resolved";
		occurredAt?: string;
	}) {
		return api.principalWorkspace.recordObservationFollowUp({
			...input,
			status: input.status ?? "noted",
		});
	},
};
