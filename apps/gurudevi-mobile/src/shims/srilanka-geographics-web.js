/**
 * Shim for @nishansanjuka/srilanka_geographics for Web
 *
 * This package is designed for Node.js and uses fs/path, which crashes in browsers.
 * For the web, we fallback to our own @repo/lk-edu-geo package where possible,
 * or return empty datasets to prevent runtime ReferenceErrors.
 */

// Since this is a shim, we return matching API that doesn't crash.
export const GetCities = (_districtName) => {
	// In browser, this returns an empty list unless we map it to lk-edu-geo
	console.warn(
		"[Shim] @nishansanjuka/srilanka_geographics.GetCities is not supported on web. Use @repo/lk-edu-geo instead.",
	);
	return [];
};

export const GetAllProvinces = () => {
	// Return empty or common list
	return [];
};

export const GetProvinces = () => {
	return [];
};

export default {
	GetCities,
	GetAllProvinces,
	GetProvinces,
};
