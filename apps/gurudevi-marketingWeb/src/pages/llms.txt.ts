import { SITE_DESCRIPTION, SITE_URL, WEB_LINKS } from '../lib/site';

export function GET() {
  const body = `# Gurudevi

> Gurudevi is a sanctuary and education ecology support system for Sri Lanka: a connected environment for teachers, students, principals, administrators, schools, and communities. Teachers remain the first-class design beneficiary, while the system is intentionally polycentric and holonic rather than a top-down monitoring dashboard.

${SITE_DESCRIPTION}

## Product Model
- Self: wellbeing, reflection, energy, and identity.
- Workspace: teacher Classroom workspace, principal/administrator School workspace, and student Learning Studio.
- Library: shared knowledge, resources, and learning materials.
- Community: relationships, collaboration, support, and collective practice.
- Profile: roles, identity, boundaries, permissions, and context switching.

Gurudevi is not only an LMS or teacher dashboard. It supports the relationships that make education possible, with practical value explained before philosophical terms such as “teaning.”

## Canonical Site
- ${SITE_URL}/
- Web Platform: ${WEB_LINKS.app}

## Priority Sections
- Home: ${SITE_URL}/
- About: ${SITE_URL}/about
- FAQ: ${SITE_URL}/faq
- Support: ${SITE_URL}/support
- Privacy: ${SITE_URL}/privacy
- Terms: ${SITE_URL}/terms
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
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
