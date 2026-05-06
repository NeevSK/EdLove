/* eslint-disable */
/**
 * Web-specific shim for @intuitui-labs/lk-edu-geo
 *
 * CLOUD-READY: This shim avoids importing the 12.4MB native JSON file to
 * prevent `DataCloneError: out of memory` during web bundling.
 *
 * On web, data should be fetched from the database (cloud) rather than
 * bundled locally. This shim provides the same API shape for compatibility.
 */

import {
	SRI_LANKAN_DISTRICTS,
	SRI_LANKAN_PROVINCES,
} from "@repo/core/constants";

export const getProvinces = () => SRI_LANKAN_PROVINCES;

export const getDistrictsByProvince = (provinceId) =>
	SRI_LANKAN_DISTRICTS.filter((d) => d.provinceId === provinceId);

export const getDSDivisionsByDistrict = (_districtId) => [];
export const getGNDivisionsByDSDivision = (_dsId) => [];
export const getSchools = (_filter) => [];
export const searchPostalTowns = (_query, _options) => [];
export const searchSchools = (_query, _options) => [];
export const searchGNDivisions = (_query, _options) => [];
export const getSchoolContext = (_censusNo) => null;
export const getMetadata = () => ({
	version: "1.0.0-web-shim",
	total_schools: 0,
});

export default {
	getProvinces,
	getDistrictsByProvince,
	getDSDivisionsByDistrict,
	getGNDivisionsByDSDivision,
	getSchools,
	searchPostalTowns,
	searchSchools,
	searchGNDivisions,
	getSchoolContext,
	getMetadata,
};
