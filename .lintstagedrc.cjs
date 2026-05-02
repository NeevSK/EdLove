module.exports = {
	"*.{js,ts,tsx,json}": (files) => [
		"biome check --write --no-errors-on-unmatched",
		`powershell -ExecutionPolicy Bypass -File scripts/surgical-check.ps1 "${files.join(" ")}"`,
	],
};
