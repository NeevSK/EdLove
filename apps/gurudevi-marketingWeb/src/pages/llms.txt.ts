import { SITE_DESCRIPTION, SITE_URL } from "../lib/site";

export function GET() {
	const body = `# Gurudevi

> ${SITE_DESCRIPTION}

## Canonical Site
- ${SITE_URL}/
- Web Platform: https://platform.gurudevi.edlove.org

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
- Agentic Context: See window.GURUDEVI_CONTEXT in HTML

## Notes
- This site serves as the human-facing entry point and agentic orientation layer for the Gurudevi Education Ecology.
- Mobile applications are currently in development (coming soon).
- The web platform is the primary interface for active educational support.
- All web applications under edlove.org share a root-domain security and context boundary.
`;

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
