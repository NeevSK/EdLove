import type { AuthorityTier } from "@repo/core/types";
import type { UserProfile } from "../types";

export interface ProfileFieldConfig {
	key: keyof UserProfile;
	weight: number; // Relative  hook normalises to 100% automatically
	label: string; // Used in "Add your {label} to complete" nudge
	onlyForRoles?: AuthorityTier[];
}

export interface ProfileSectionConfig {
	id: string;
	label: string;
	countInCompletion: boolean; // Set false to exclude entire section from score
	roles: AuthorityTier[] | "all";
	fields: ProfileFieldConfig[];
}

export const PROFILE_SECTIONS: ProfileSectionConfig[] = [
	{
		id: "identity",
		label: "Identity & Contact",
		countInCompletion: true,
		roles: "all",
		fields: [
			{ key: "full_name", weight: 2, label: "full name" },
			{ key: "avatar_url", weight: 2, label: "profile photo" },
			{ key: "phone", weight: 1, label: "phone number" },
			// Student-only
			{
				key: "index_number",
				weight: 2,
				label: "index number",
				onlyForRoles: ["student"],
			},
			// Staff-only (all non-student registered roles)
			{
				key: "nic_number",
				weight: 2,
				label: "NIC number",
				onlyForRoles: [
					"teacher",
					"principal",
					"grade_head",
					"section_head",
					"founder",
					"admin",
					"developer",
				] as AuthorityTier[],
			},
		],
	},
	{
		id: "bio",
		label: "Your Story",
		countInCompletion: true,
		roles: "all",
		fields: [{ key: "bio", weight: 2, label: "bio" }],
	},
	{
		id: "professional",
		label: "Professional Branding",
		countInCompletion: true,
		roles: [
			"teacher",
			"principal",
			"grade_head",
			"section_head",
		] as AuthorityTier[],
		fields: [
			{ key: "experience_years", weight: 1, label: "years of experience" },
			{ key: "subjects_taught", weight: 2, label: "subjects taught" },
			{ key: "qualifications", weight: 2, label: "qualifications" },
		],
	},
];
