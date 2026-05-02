import type { FormConfig } from "@repo/core/types";

export interface ClimateSensingData {
	// Section: Material
	power_reliability: string;
	water_access: string;
	lab_status: string;

	// Section: Connectivity
	signal_strength: number;
	wifi_reach: number;

	// Section: Human Harmony
	staff_synergy: number;
	principal_alignment: number;
	harmony_vibe: string;

	// Section: Logistics
	commute_friction: number;
	resource_density: number;

	// Section: Context
	shift_reason: string;
}

export const createClimateSensingSchema = (
	onSubmit: (values: ClimateSensingData) => void,
): FormConfig<Record<string, any>> => ({
	fields: {
		material_header: {
			type: "heading",
			label: "🏗️ Material Reality",
		},
		power_reliability: {
			label: "Power Reliability",
			type: "select",
			options: [
				{ label: "Stable & Reliable", value: "stable" },
				{ label: "Frequent Outages", value: "unstable" },
				{ label: "No Connection", value: "none" },
			],
			required: true,
		},
		water_access: {
			label: "Water Accessibility",
			type: "select",
			options: [
				{ label: "Continuous Tap Water", value: "full" },
				{ label: "Periodic Tanker/Well", value: "periodic" },
				{ label: "Critical Shortage", value: "critical" },
			],
			required: true,
		},
		lab_status: {
			label: "Computer Lab Equipment",
			type: "select",
			options: [
				{ label: "Fully Equipped & Working", value: "ideal" },
				{ label: "Legacy/Broken Hardware", value: "minimal" },
				{ label: "No Lab Available", value: "none" },
			],
			required: true,
		},
		divider_1: { type: "divider" }, // Force type match if literal
		connectivity_header: {
			type: "heading",
			label: "📶 Digital Connectivity",
		},
		signal_strength: {
			label: "Cellular Signal Strength (4G/5G)",
			type: "slider",
			min: 1,
			max: 5,
			defaultValue: 3,
		},
		wifi_reach: {
			label: "WiFi Coverage Area",
			type: "slider",
			min: 1,
			max: 5,
			defaultValue: 2,
		},
		divider_2: { type: "divider" },
		human_header: {
			type: "heading",
			label: "🤝 Human Harmony",
		},
		staff_synergy: {
			label: "Atmospheric Vibe (How is the staff cohesion?)",
			type: "likert",
			scaleType: "emoji",
			defaultValue: 3,
		},
		principal_alignment: {
			label: "Principal & Staff Alignment",
			type: "likert",
			scaleType: "numeric",
			defaultValue: 3,
		},
		harmony_vibe: {
			label: "Qualitative Resonance (Any specific stories?)",
			type: "textarea",
			placeholder: "Share the soul of the school environment...",
		},
		logistics_header: {
			type: "heading",
			label: "🚚 Logistics & Resources",
		},
		commute_friction: {
			label: "Commute Friction (How easy is it to reach school?)",
			type: "slider",
			min: 1,
			max: 5,
			defaultValue: 2,
		},
		resource_density: {
			label: "Resource Density (Availability of materials)",
			type: "slider",
			min: 1,
			max: 5,
			defaultValue: 3,
		},
		divider_3: { type: "divider" },
		context_header: {
			type: "heading",
			label: "⌛ Change Context",
		},
		shift_reason: {
			label: "Why has the climate changed recently?",
			type: "select",
			options: [
				{ label: "Leadership Continuity", value: "stable" },
				{ label: "New Principal/Headmaster", value: "leadership_change" },
				{ label: "Infrastructure Upgrade", value: "infra_boost" },
				{ label: "Resource Depletion", value: "loss" },
				{ label: "External Community Context", value: "external" },
			],
		},
	},
	onSubmit: (values) => onSubmit(values as ClimateSensingData),
});
