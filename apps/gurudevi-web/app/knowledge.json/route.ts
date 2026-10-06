import { authors, journalEntries } from '../(marketing)/(editorial)/content';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../seo';

export const dynamic = 'force-static';

export function GET() {
  const entries = [
    { id: 'home', title: 'Home', category: 'page', url: absoluteUrl('/') },
    { id: 'home-si', title: 'ගුරුදේවි | සමෝධානික අධ්‍යාපනයේ සුරක්ෂිත කෙම්බිම', category: 'page', language: 'si', url: absoluteUrl('/si') },
    { id: 'home-ta', title: 'குருதேவி | கல்வியின் உயிரோட்டமான அமைதிச் சோலை', category: 'page', language: 'ta', url: absoluteUrl('/ta') },
    { id: 'about', title: 'About the Ecology', category: 'page', url: absoluteUrl('/about') },
    { id: 'faq', title: 'FAQ', category: 'page', url: absoluteUrl('/faq') },
    { id: 'thuthimal', title: 'Thuthimal', category: 'page', url: absoluteUrl('/thuthimal') },
    { id: 'journal', title: 'Gurudevi Journal', category: 'collection', url: absoluteUrl('/journal') },
    ...authors.map((author) => ({ id: `author-${author.id}`, title: author.displayName, category: 'author', url: absoluteUrl(`/authors/${author.id}`), description: author.biography })),
    ...journalEntries.map((entry) => ({ id: `journal-${entry.slug}`, title: entry.title, category: 'journal', url: absoluteUrl(`/journal/${entry.slug}`), description: entry.subtitle, author: entry.author, published: entry.publishDate, topics: entry.topics })),
  ];

  return Response.json({ site: { name: SITE_NAME, url: SITE_URL, description: SITE_DESCRIPTION }, entries });
}
