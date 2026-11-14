import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';

export function GET() {
  const body = `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

The EdLove Foundation is the apex educational transformation ecosystem connecting philosophy, 200 global innovations, pedagogical canon, and empirical field research.

## Core Epistemic Commons
- [Vision & Philosophy](${SITE_URL}/vision): Educational philosophy, non-extractive technology, and the Convivial Limit.
- [200 Educational Innovations](${SITE_URL}/innovations): Curated global directory of 200 transformative learning practices.
- [Cosmos Paradigms](${SITE_URL}/cosmos): Six holistic educational paradigms spanning self, ecological, and societal learning.
- [Pedagogical Canon](${SITE_URL}/library): Foundational texts, teaching methods, and open educational resources.
- [Ceylon Research Atlas](${SITE_URL}/sri-lanka): Empirical field research, school mapping, and district-level educational indicators.
- [Gurudevi Sanctuary](${SITE_URL}/gurudevi): The relational education support system and teacher sanctuary in Sri Lanka.

## Canonical Resources
- [Home](${SITE_URL}/): Foundation portal and epistemic overview.
- [Journal](${SITE_URL}/journal): Essays and pedagogical field notes.
- [Community](${SITE_URL}/community): Educator circles and civic partnerships.
- [Resources](${SITE_URL}/resources): Tools, guides, and curriculum toolkits.

## Complete Context & LLM Ingestion
- [Full Context Corpus](${SITE_URL}/llms-full.txt): Complete aggregated markdown text of all public essays, research summaries, and paradigm definitions for single-request LLM ingestion.

## Machine-Readable Endpoints
- [XML Sitemap Index](${SITE_URL}/sitemap-index.xml): Master XML sitemap index.
- [Knowledge Index](${SITE_URL}/knowledge.json): Structured JSON catalog of public knowledge nodes.
- [Journal RSS Feed](${SITE_URL}/journal/feed.xml): RSS 2.0 syndication feed.

## Ethical AI & Citation Policy
Public educational knowledge on edlove.org is licensed for open academic reference and search engine citation (search=yes, ai-input=yes). Mass scraping for uncredited model training without attribution is not granted (ai-train=no).
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
