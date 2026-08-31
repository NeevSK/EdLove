import { getCollection } from 'astro:content';
import { SITE_URL } from '../../lib/site';

type JournalFeedEntry = {
  id: string;
  data: { draft: boolean; title: string; subtitle: string; publishDate: Date };
};

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;' })[character] ?? character);
}

export async function GET() {
  const entries = (await getCollection('journal', ({ data }) => !data.draft)) as JournalFeedEntry[];
  const sortedEntries = entries
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
  const items = sortedEntries.map((entry) => {
    const url = `${SITE_URL}/journal/${entry.id}`;
    return `<item><title>${escapeXml(entry.data.title)}</title><description>${escapeXml(entry.data.subtitle)}</description><link>${url}</link><guid>${url}</guid><pubDate>${entry.data.publishDate.toUTCString()}</pubDate></item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>EdLove Journal</title><description>Essays, field notes, and reflections from EdLove.</description><link>${SITE_URL}/journal</link>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
