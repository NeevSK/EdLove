import { journalEntries } from '../../(marketing)/(editorial)/content';
import { absoluteUrl, SITE_URL } from '../../seo';

export const dynamic = 'force-static';

function escapeXml(value: string) {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;' })[character] ??
      character,
  );
}

export function GET() {
  const items = [...journalEntries]
    .sort((left, right) => right.publishDate.localeCompare(left.publishDate))
    .map((entry) => {
      const url = absoluteUrl(`/journal/${entry.slug}`);
      return `<item><title>${escapeXml(entry.title)}</title><description>${escapeXml(entry.subtitle)}</description><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${entry.publishDate}T00:00:00Z`).toUTCString()}</pubDate><dc:creator>${escapeXml(entry.author)}</dc:creator></item>`;
    })
    .join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>Gurudevi Journal</title><description>Stories, practice notes, and reflections from Gurudevi.</description><link>${SITE_URL}/journal</link>${items}</channel></rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
