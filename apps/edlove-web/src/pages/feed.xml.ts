import { getCollection } from 'astro:content';
import { SITE_URL } from '../lib/site';

type FeedEntry = {
  id: string;
  data: {
    draft: boolean;
    publishDate?: Date;
    category: string;
    title: string;
    subtitle: string;
  };
};

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      })[character] ?? character,
  );
}

export async function GET() {
  const entries = (await getCollection('library', ({ data }) => !data.draft)) as FeedEntry[];
  const items = entries
    .filter(
      (entry) =>
        entry.data.publishDate ||
        ['article', 'research', 'essay', 'field-note'].includes(entry.data.category),
    )
    .sort(
      (a: FeedEntry, b: FeedEntry) =>
        (b.data.publishDate?.valueOf() ?? 0) - (a.data.publishDate?.valueOf() ?? 0),
    )
    .map((entry: FeedEntry) => {
      const url = `${SITE_URL}/library/${entry.id}`;
      return `<item><title>${escapeXml(entry.data.title)}</title><description>${escapeXml(entry.data.subtitle)}</description><link>${url}</link><guid>${url}</guid>${entry.data.publishDate ? `<pubDate>${entry.data.publishDate.toUTCString()}</pubDate>` : ''}</item>`;
    })
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>EdLove Library</title><description>Research, essays, and frameworks for education as an act of love.</description><link>${SITE_URL}/library</link>${items}</channel></rss>`,
    {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    },
  );
}
