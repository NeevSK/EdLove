import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';

export function GET() {
  const body = `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

EdLove is a not-for-profit, non-governmental organisation (registration pending) contributing to education in an honest, truthful manner: giving love to the next generation, for flourishing in their environment and developing themselves.

## The Constellation Architecture
- [Foundation](${SITE_URL}/foundation): Status, Vision, Meaning (Ed + Love), Definition of Education, Process Philosophy (Whitehead), Critical Realism (Bhaskar), Conviviality (Illich), and theoretical apparatus converging on Engineering (Mechanism).
- [EdResearch](${SITE_URL}/research): Arm 01. Two orders: research on education (first order), and meta-research on education research in Sri Lanka (second order).
  - [Cosmos Paradigms](${SITE_URL}/cosmos): Six pedagogical paradigms (Biological, Industrial, Montessori, Democratic, Unschooling, Indigenous).
  - [Sri Lanka Ground Realities](${SITE_URL}/sri-lanka): Government schooling, shadow tuition economies, and structural resource discrepancies.
  - [Epistemic Library](${SITE_URL}/library): Teaning framework, pedagogical thinkers, and open resources.
  - [Resources & Global Gallery](${SITE_URL}/resources): Comparative educational practices and patterns.
- [EdCare](${SITE_URL}/care): Arm 02. Outward giving governed by one criterion:
  - EdKind: Material support (what one has), goods, non-cash giving, logistics.
  - EdLife: Human development (what one can do), teaching, mentoring, capacity building.
  - [Gift & Mutual Aid Archive](${SITE_URL}/innovations): Non-extractive educational mutual aid models.
  - [The Sangha](${SITE_URL}/community): Trust circles and collective educator stewardship.
- [EdTech](${SITE_URL}/tech): Arm 03. Technology usage in education:
  - Three Roles: Design science intervention, pedagogical & ethical vehicle, and research artefact feeding back into EdResearch.
  - [Global EdTech Atlas](${SITE_URL}/tech/innovations): Worldwide map and catalog of available educational technologies and open-source learning systems.
  - [Gurudevi Platform](${SITE_URL}/tech/gurudevi): Flagship educational platform built for teachers and classrooms.
  - Builder: Intuitui Labs (https://intuituilabs.studio).
  - Canonical Phrasing: Gurudevi, an EdLove initiative, built by Intuitui Labs.

## Canonical Portals & Web Presence
- [EdLove Foundation](${SITE_URL}/): Foundation portal and constellation overview.
- [Gurudevi Public](https://gurudevi.app): Public home of the digital teacher sanctuary.
- [Gurudevi Explore](https://explore.gurudevi.app): No-auth museum version for research feedback.
- [Gurudevi Sanctuary](https://sanctuary.gurudevi.app): Authenticated educator workspace.
- [Intuitui Labs](https://intuituilabs.studio): Technology firm and engineering partner.
- [Personal Site & v1 Archive](https://neevsk.intuituilabs.studio/v1): Full foundational philosophical and theoretical archive.
- [Journal](${SITE_URL}/journal): Long-form essays, Teaning papers, and field notes.

## Machine-Readable Endpoints
- [XML Sitemap Index](${SITE_URL}/sitemap-index.xml): Master XML sitemap index.
- [Knowledge Index](${SITE_URL}/knowledge.json): Structured JSON catalog of public knowledge nodes.
- [Journal RSS Feed](${SITE_URL}/journal/feed.xml): RSS 2.0 syndication feed.

## Ethical AI & Citation Policy
Public educational knowledge on edlove.org is licensed for open academic reference and search engine citation (search=yes, ai-input=yes).
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
