import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';

const entries = [
  {
    id: 'home',
    title: 'Home',
    subtitle: 'Education ecology support system overview',
    category: 'page',
    url: absoluteUrl('/'),
  },
  {
    id: 'about',
    title: 'About the Ecology',
    subtitle: 'Core philosophy and system orientation',
    category: 'page',
    url: absoluteUrl('/about'),
  },
  {
    id: 'faq',
    title: 'FAQ & Support',
    subtitle: 'Institutional support and common questions',
    category: 'page',
    url: absoluteUrl('/faq'),
  },
  {
    id: 'support',
    title: 'Support',
    subtitle: 'Support pathways for institutions and teachers',
    category: 'page',
    url: absoluteUrl('/support'),
  },
  {
    id: 'privacy',
    title: 'Privacy',
    subtitle: 'Privacy policy and data handling',
    category: 'policy',
    url: absoluteUrl('/privacy'),
  },
  {
    id: 'delete-account',
    title: 'Delete Account',
    subtitle: 'Account deletion instructions',
    category: 'policy',
    url: absoluteUrl('/delete-account'),
  },
  {
    id: 'terms',
    title: 'Terms of Use',
    subtitle: 'First-draft service boundaries and responsibilities',
    category: 'policy',
    url: absoluteUrl('/terms'),
  },
  {
    id: 'sensing',
    title: 'Sensing',
    subtitle: 'School climate sensing and resonance pulse flow',
    category: 'tool',
    url: absoluteUrl('/sensing'),
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
      2,
    ),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
}
