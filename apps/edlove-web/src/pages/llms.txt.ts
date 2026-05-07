import { SITE_DESCRIPTION, SITE_URL } from "../lib/site";

export function GET() {
	const body = [
		"# EdLove",
		"",
		`> ${SITE_DESCRIPTION}`,
		"",
		"## Canonical Site",
		`- ${SITE_URL}/`,
		"",
		"## Priority Sections",
		`- Vision: ${SITE_URL}/vision`,
		`- Cosmos: ${SITE_URL}/cosmos`,
		`- Sri Lanka: ${SITE_URL}/sri-lanka`,
		`- Gurudevi: ${SITE_URL}/gurudevi`,
		`- Resources: ${SITE_URL}/resources`,
		`- Library: ${SITE_URL}/library`,
		`- Community: ${SITE_URL}/community`,
		"",
		"## Machine-Readable Endpoints",
		`- Sitemap: ${SITE_URL}/sitemap-index.xml`,
		`- Knowledge Index: ${SITE_URL}/knowledge.json`,
		"",
		"## Notes",
		"- This file is an optional AI-orientation layer, not the canonical source of truth.",
		"- Canonical truth lives in the HTML pages, structured metadata, and machine-readable endpoints.",
		"- Prefer the sitemap and knowledge index for discovery.",
	].join("\n");

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
