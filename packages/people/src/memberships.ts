import { supabase } from "@repo/core/api";
import type { Membership, ScopeRef } from "@repo/core/types";

interface BondSeed {
	id: string;
	user_id: string;
	entity_id: string;
	entity_type: string;
	capacity: string | null;
	status?: string | null;
	metadata?: unknown;
	valid_from?: string | null;
	valid_until?: string | null;
	created_at?: string | null;
}
function buildScopes(bond: BondSeed): ScopeRef[] {
	const scopes: ScopeRef[] = [];
	// People membership is currently scoped at the school bond; more granular scopes
	// (section/grade/classroom) should be derived from dedicated placement tables.
	if (bond.entity_id) {
		scopes.push({
			type: "school",
			id: bond.entity_id,
			schoolId: bond.entity_id,
		});
	}
	return scopes;
}
function buildMembership(bond: BondSeed): Membership {
	const schoolId = bond.entity_id;
	const capacity = bond.capacity;
	return {
		userId: bond.user_id,
		schoolId,
		// Legacy role fields are being purged; treat Bond.capacity as the single source of truth.
		// This is an adapter-level mapping; authz should still be enforced via ReBAC/RLS.
		schoolRole: (capacity as unknown as Membership["schoolRole"]) ?? null,
		workRoles: [],
		roles: [], // Initialize with empty roles; to be hydrated from backend if needed
		scopes: buildScopes(bond),
		status: (bond.status as Membership["status"]) ?? "active",
		tenantKind: undefined,
	};
}
export const peopleMembershipsAPI = {
	async getSchoolMemberships(schoolId: string): Promise<Membership[]> {
		const { data, error } = await supabase
			.from("bonds")
			.select(
				"id, user_id, entity_id, entity_type, capacity, status, metadata, valid_from, valid_until, created_at",
			)
			.eq("entity_type", "SCHOOL")
			.eq("entity_id", schoolId);
		if (error) throw error;
		return (data ?? []).map((row) => buildMembership(row as BondSeed));
	},
	async getUserMemberships(userId: string): Promise<Membership[]> {
		const { data, error } = await supabase
			.from("bonds")
			.select(
				"id, user_id, entity_id, entity_type, capacity, status, metadata, valid_from, valid_until, created_at",
			)
			.eq("entity_type", "SCHOOL")
			.eq("user_id", userId);
		if (error) throw error;
		return (data ?? []).map((row) => buildMembership(row as BondSeed));
	},
};
