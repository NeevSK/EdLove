import type { DSDivision, GNDivision } from "@intuitui-labs/lk-edu-geo";
import * as LKEduGeo from "@intuitui-labs/lk-edu-geo";

export interface AdminUnit {
	id: string;
	en: string;
	si: string;
	ta: string;
}

/**
 * Universal Drilling Utility using @repo/lk-edu-geo.
 *
 * BREAKING CYCLES: This now uses the centralized data engine exclusively.
 */
export const Drilldown = {
	getProvinces: () =>
		LKEduGeo.getProvinces().map((p) => ({
			id: p.mnemonic, // Standardize on mnemonic IDs for platform consistency
			en: p.name,
			si: p.name_si || "",
			ta: p.name_ta || "",
		})),

	getDistricts: (provinceId: string) => {
		// Determine if input is mnemonic or official ID
		const isMnemonic = !provinceId.startsWith("P_");
		const pId = isMnemonic
			? Object.entries({
					P_1: "WP",
					P_2: "CP",
					P_3: "SP",
					P_4: "NP",
					P_5: "EP",
					P_6: "NW",
					P_7: "NC",
					P_8: "UP",
					P_9: "SG",
				}).find(([_, v]) => v === provinceId)?.[0] || provinceId
			: provinceId;

		return LKEduGeo.getDistrictsByProvince(pId).map((d) => ({
			id: LKEduGeo.getMnemonicForDistrict(d.id),
			en: d.name,
			si: d.name_si || "",
			ta: d.name_ta || "",
		}));
	},

	/**
	 * Retrieves cities for a given district.
	 */
	getCities: async (districtId: string) => {
		// Handle mnemonic to official ID conversion for lk-edu-geo lookup
		const dId =
			districtId.length === 2
				? Object.entries({
						D_11: "CO",
						D_12: "GA",
						D_13: "KL",
						D_21: "KY",
						D_22: "MT",
						D_23: "NE",
						D_31: "KU",
						D_32: "PU",
						D_41: "JA",
						D_42: "KI",
						D_43: "MN",
						D_44: "VA",
						D_45: "MU",
						D_51: "AN",
						D_52: "PO",
						D_61: "BD",
						D_62: "MO",
						D_71: "RG",
						D_72: "KE",
						D_81: "GL",
						D_82: "MA",
						D_83: "HA",
						D_53: "BT",
						D_54: "AM",
						D_55: "TR",
					}).find(([_, v]) => v === districtId)?.[0] || districtId
				: districtId;

		return LKEduGeo.getPostalUnitsByDistrict(dId).map((p) => ({
			id: p.id,
			en: p.city || "",
			si: "",
			ta: "",
		}));
	},

	/**
	 * Synchronous stubs for UI-layer drilling.
	 */
	getDSDivisions: (districtId: string): DSDivision[] => {
		const dId =
			districtId.length === 2
				? Object.entries({
						D_11: "CO",
						D_12: "GA",
						D_13: "KL",
						D_21: "KY",
						D_22: "MT",
						D_23: "NE",
						D_31: "KU",
						D_32: "PU",
						D_41: "JA",
						D_42: "KI",
						D_43: "MN",
						D_44: "VA",
						D_45: "MU",
						D_51: "AN",
						D_52: "PO",
						D_61: "BD",
						D_62: "MO",
						D_71: "RG",
						D_72: "KE",
						D_81: "GL",
						D_82: "MA",
						D_83: "HA",
						D_53: "BT",
						D_54: "AM",
						D_55: "TR",
					}).find(([_, v]) => v === districtId)?.[0] || districtId
				: districtId;
		return LKEduGeo.getDSDivisionsByDistrict(dId);
	},
	getGNDivisions: (dsDivisionId: string): GNDivision[] => {
		return LKEduGeo.getGNDivisionsByDSDivision(dsDivisionId);
	},
};
