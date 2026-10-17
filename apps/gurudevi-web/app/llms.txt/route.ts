import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../seo';

export const dynamic = 'force-static';

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Gurudevi supports the relationships that make education possible. It is designed for teachers, students, school leaders, families, and communities, with teachers as the first-class design beneficiary.

## Product model
- Self: wellbeing, reflection, energy, and identity.
- Workspace: classroom, school, and learning-studio practices.
- Library: shared knowledge, resources, and learning materials.
- Community: relationships, collaboration, support, and collective practice.
- Profile: roles, identity, boundaries, permissions, and context.

## Canonical resources
- Home: ${SITE_URL}/
- About: ${absoluteUrl('/about')}
- FAQ: ${absoluteUrl('/faq')}
- Journal: ${absoluteUrl('/journal')}
- Privacy: ${absoluteUrl('/privacy')}
- Terms: ${absoluteUrl('/terms')}
- Account deletion: ${absoluteUrl('/delete-account')}

## Machine-readable resources
- Sitemap: ${absoluteUrl('/sitemap.xml')}
- Knowledge index: ${absoluteUrl('/knowledge.json')}
- Journal RSS: ${absoluteUrl('/journal/feed.xml')}

## Editorial policy
Gurudevi is a human-centered, privacy-conscious education ecology. Public journal material is available for search and reference; this site does not grant permission for behavioral profiling or surveillance.
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
