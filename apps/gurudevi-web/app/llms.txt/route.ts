import { journalEntries } from '../(marketing)/(editorial)/content';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../seo';

export const dynamic = 'force-static';

export function GET() {
  const editorialArticles = journalEntries
    .map((entry) => `- [${entry.title}](${absoluteUrl(`/journal/${entry.slug}`)}): ${entry.subtitle}`)
    .join('\n');

  const body = `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

Gurudevi is a contemplative education ecology and support system for Sri Lanka, designed with teachers as the first-class beneficiary. It provides a non-extractive, sovereign technological continuum connecting teachers, students, schools, families, and civic communities.

## Core Architecture
- [Self](${SITE_URL}/about#self): Inner development, wellbeing, reflective fire journals, energy attunement, and personal identity.
- [Workspace](${SITE_URL}/about#workspace): Classroom rhythm, dual-loop attendance telemetry, school presence, and instructional planning.
- [Library](${SITE_URL}/about#library): Open educational resources, local curriculum materials, and shared pedagogy.
- [Community](${SITE_URL}/about#community): Human-scale bonds, peer educator circles, and compassionate school-family networks.
- [Profile](${SITE_URL}/about#profile): Sovereign roles, institutional credentials, boundaries, and privacy permissions.

## Canonical Resources
- [Home](${SITE_URL}/): Foundational overview and the multi-year educational horizon.
- [About the Ecology](${absoluteUrl('/about')}): Deep philosophical and structural foundations of Gurudevi.
- [Journal Index](${absoluteUrl('/journal')}): Essays, research reports, and pedagogical field notes.
- [FAQ](${absoluteUrl('/faq')}): Frequently asked questions on privacy, licensing, and access.
- [Thuthimal (Gratitude)](${absoluteUrl('/thuthimal')}): Expressions of communal gratitude and cultural grounding.
- [Privacy Policy](${absoluteUrl('/privacy')}): Explicit commitments to student/teacher data sovereignty and zero commercial surveillance.
- [Terms of Service](${absoluteUrl('/terms')}): Community agreements and legal framework.

## Public Journal Articles
${editorialArticles}

## Complete Context & LLM Ingestion
- [Full Context Corpus](${absoluteUrl('/llms-full.txt')}): Complete aggregated markdown text of all public essays, curriculum frameworks, and system documentation for single-request LLM ingestion.

## Machine-Readable Endpoints
- [XML Sitemap](${absoluteUrl('/sitemap.xml')}): Complete URL catalog for search crawlers.
- [Knowledge Index](${absoluteUrl('/knowledge.json')}): Structured JSON index of all public articles, pages, and verified authors.
- [Journal RSS Feed](${absoluteUrl('/journal/feed.xml')}): RSS 2.0 syndication feed.

## Ethical Policy & Data Sovereignty
Gurudevi operates under a strict privacy invariant:
1. Public journal material is published under Creative Commons (CC BY-NC 4.0) for educational attribution and discovery.
2. Private sanctuary domains (student reflections, emotional check-ins, classroom attendance, and school marks) are completely segregated and prohibited from AI training harvesting, commercial profiling, or advertising telemetry.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
