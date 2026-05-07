import { SITE_DESCRIPTION, SITE_URL } from "../lib/site";

export function GET() {
	const body = `# Intuitui Labs

> ${SITE_DESCRIPTION}

## Canonical Site
- ${SITE_URL}/

## Priority Sections
- Home: ${SITE_URL}/
- About: ${SITE_URL}/about
- Projects: ${SITE_URL}/projects
- Studio: ${SITE_URL}/studio

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
