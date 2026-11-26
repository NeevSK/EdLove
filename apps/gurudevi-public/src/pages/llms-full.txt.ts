import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@repo/core/site';
import type { APIRoute } from 'astro';
import { journalEntries } from '../content/journal';

/** Every public essay in one plain-text file, for agents that read a site in a single request. */
export const GET: APIRoute = () => {
  const essays = journalEntries.map((entry) => {
    const sections = entry.sections.map((section) =>
      [
        section.heading ? `### ${section.heading}` : '',
        ...section.paragraphs,
        ...(section.bullets ?? []).map((bullet) => `- ${bullet}`),
      ]
        .filter(Boolean)
        .join('\n\n'),
    );
    return [
      `## ${entry.title}`,
      `> ${entry.subtitle}`,
      `Author: ${entry.author} · Published: ${entry.publishDate} · License: ${entry.license}`,
      `Source: ${absoluteUrl(`/journal/${entry.slug}`)}`,
      ...sections,
    ].join('\n\n');
  });
  const body = `# ${SITE_NAME} - Complete Knowledge & Architectural Corpus\n\n> ${SITE_DESCRIPTION}\n\n${essays.join('\n\n---\n\n')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
