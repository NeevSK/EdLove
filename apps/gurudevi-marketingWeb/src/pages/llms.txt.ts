import { SITE_DESCRIPTION, SITE_URL } from "../lib/site";

export function GET() {
	const body = `# Gurudevi

> ${SITE_DESCRIPTION}

## Canonical Site
- ${SITE_URL}/

## Priority Sections
- Home: ${SITE_URL}/
- About: ${SITE_URL}/about
- FAQ: ${SITE_URL}/faq
- Support: ${SITE_URL}/support
- Privacy: ${SITE_URL}/privacy
- Delete Account: ${SITE_URL}/delete-account
- Sensing: ${SITE_URL}/sensing

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
