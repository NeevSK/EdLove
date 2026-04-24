import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '../lib/site';

const entries = [
  {
    id: 'home',
    title: 'Home',
    subtitle: 'Systems Intelligence Studio',
    category: 'page',
    url: absoluteUrl('/'),
  },
  {
    id: 'about',
    title: 'About',
    subtitle: 'Studio orientation and philosophy',
    category: 'page',
    url: absoluteUrl('/about'),
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Selected systems and innovation work',
    category: 'page',
    url: absoluteUrl('/projects'),
  },
  {
    id: 'studio',
    title: 'Studio',
    subtitle: 'Operating model and studio context',
    category: 'page',
    url: absoluteUrl('/studio'),
  },
];

export function GET() {
  return new Response(
    JSON.stringify(
      {
        site: {
          name: SITE_NAME,
          url: SITE_URL,
          description: SITE_DESCRIPTION,
        },
        generatedAt: new Date().toISOString(),
        entries,
      },
      null,
      2
    ),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
}
