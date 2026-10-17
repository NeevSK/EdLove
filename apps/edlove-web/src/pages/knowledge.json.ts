// eslint-disable-next-line import-x/no-unresolved -- Astro-specific module
import { getCollection } from 'astro:content';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';

function collectionPath(collection: string, id: string) {
  const cleanId = normalizeId(id);

  switch (collection) {
    case 'cosmos':
      return `/cosmos/${cleanId}`;
    case 'library':
      return '/library';
    case 'resources':
      return cleanId === 'global-gallery' ? '/resources/gallery' : '/resources';
    case 'community':
      return '/community';
    case 'gurudevi':
      return '/gurudevi';
    case 'sri-lanka':
      return '/sri-lanka';
    default:
      return '/';
  }
}

function normalizeId(id: string) {
  return id.replace(/\.(md|mdx)$/i, '');
}

export async function GET() {
  const collectionNames = [
    'cosmos',
    'library',
    'resources',
    'community',
    'gurudevi',
    'sri-lanka',
  ] as const;

  const entries = (
    await Promise.all(
      collectionNames.map(async (collection) => {
        const items = await getCollection(
          collection,
          ({ data }: { data: { draft?: boolean } }) => !data.draft,
        );
        return items.map((entry: any) => {
          const cleanId = normalizeId(entry.id);
          const pathname = collectionPath(collection, cleanId);

          return {
            id: `${collection}:${cleanId}`,
            collection,
            slug: cleanId,
            title: entry.data.title,
            subtitle: entry.data.subtitle,
            category: 'category' in entry.data ? entry.data.category : null,
            tags: 'tags' in entry.data ? entry.data.tags : [],
            url: absoluteUrl(pathname),
          };
        });
      }),
    )
  ).flat();

  const body = {
    site: {
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    generatedAt: new Date().toISOString(),
    entries,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
