import type { Capacity } from "@repo/core/types";
import type { UserProfile } from "../types";

export interface ProfileFieldConfig {
	key: keyof UserProfile;
	weight: number; // Relative  hook normalises to 100% automatically
	label: string; // Used in "Add your {label} to complete" nudge
	onlyForCapacities?: Capacity[];
}

export interface ProfileSectionConfig {
	id: string;
	label: string;
	countInCompletion: boolean; // Set false to exclude entire section from score
	capacities: Capacity[] | "all";
	fields: ProfileFieldConfig[];
}

export const PROFILE_SECTIONS: ProfileSectionConfig[] = [
	{
		id: "identity",
		label: "Identity & Contact",
		countInCompletion: true,
		capacities: "all",
		fields: [
			{ key: "display_name", weight: 2, label: "display name" },
			{ key: "first_name", weight: 2, label: "first name" },
			{ key: "last_name", weight: 2, label: "last name" },
			{ key: "username", weight: 2, label: "unique handle" },
			{ key: "avatar_url", weight: 2, label: "profile photo" },
			{ key: "phone", weight: 1, label: "phone number" },
			// Student-only
			{
				key: "index_number",
				weight: 2,
				label: "index number",
				onlyForCapacities: ["student"],
			},
			// Staff-only (all non-student registered roles)
			{
				key: "nic_number",
				weight: 2,
				label: "NIC number",
				onlyForCapacities: [
					"teacher",
					"principal",
					"grade_head",
					"section_head",
					"founder",
					"admin",
					"developer",
				] as Capacity[],
			},
		],
	},
	{
		id: "bio",
		label: "Your Story",
		countInCompletion: true,
		capacities: "all",
		fields: [{ key: "bio", weight: 2, label: "bio" }],
	},
	{
		id: "professional",
		label: "Professional Branding",
		countInCompletion: true,
		capacities: [
			"teacher",
			"principal",
			"grade_head",
			"section_head",
		] as Capacity[],
		fields: [
			{ key: "experience_years", weight: 1, label: "years of experience" },
			{ key: "subjects_taught", weight: 2, label: "subjects taught" },
			{ key: "qualifications", weight: 2, label: "qualifications" },
		],
	},
];
