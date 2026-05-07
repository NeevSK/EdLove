import { SITE_DESCRIPTION, SITE_URL } from "../lib/site";

export function GET() {
	const body = `# NeevSK

> ${SITE_DESCRIPTION}

## Canonical Site
- ${SITE_URL}/

## Priority Sections
- Home: ${SITE_URL}/
- Archive: ${SITE_URL}/archive
- Projects: ${SITE_URL}/projects
- Hall of Flame: ${SITE_URL}/hall-of-flame
- Journey: ${SITE_URL}/journey
- Contact: ${SITE_URL}/contact

## Machine-Readable Endpoints
- Sitemap: ${SITE_URL}/sitemap-index.xml
- Knowledge Index: ${SITE_URL}/knowledge.json

## Notes
- This file is an optional AI-orientation layer, not the canonical source of truth.
- Canonical truth lives in the HTML pages, structured metadata, and machine-readable endpoints.
`;

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
