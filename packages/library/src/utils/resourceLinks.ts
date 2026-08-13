import type { LibraryResource } from '@repo/library/types';

import { GURUDEVI_APP } from '@repo/ui/utils';

const LIBRARY_SHARE_BASE_URL = `${GURUDEVI_APP}/p/library/resource`;

/**
 * Query payload shared by every Library resource-opening surface.
 *
 * Keep the legacy keys (`title`, `url`, `creator`, and `format`) intact: the
 * viewer routes still accept them for deep links shared by older app builds.
 */
export interface LibraryResourceOpenParams extends Record<string, string> {
  resourceId: string;
  title: string;
  url: string;
  creator: string;
  format: string;
}

export function buildLibraryResourceOpenParams(
  resource: Pick<LibraryResource, 'id' | 'title' | 'url' | 'creator_name' | 'format'>,
): LibraryResourceOpenParams {
  return {
    resourceId: resource.id,
    title: resource.title,
    url: resource.url ?? '',
    creator: resource.creator_name ?? '',
    format: resource.format ?? '',
  };
}

export interface ResourceCompanionLink {
  id: string;
  label: string;
  description: string;
  url: string;
  kind: 'primary' | 'wikipedia' | 'trailer' | 'search' | 'official';
}

function isWikipediaUrl(url?: string): boolean {
  return typeof url === 'string' && /wikipedia\.org/i.test(url);
}

function isYouTubeUrl(url?: string): boolean {
  return typeof url === 'string' && /(youtube\.com|youtu\.be)/i.test(url);
}

function sanitizeTitle(title: string): string {
  return title
    .replace(/[-–—]\s*(official\s*)?trailer/gi, '')
    .replace(/\((official\s*)?trailer\)/gi, '')
    .replace(/\((film|movie)\)/gi, '')
    .trim();
}

function dedupeLinks(links: ResourceCompanionLink[]): ResourceCompanionLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (!link.url || seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

export function buildLibraryResourceShareUrl(resourceId: string): string {
  return `${LIBRARY_SHARE_BASE_URL}/${encodeURIComponent(resourceId)}`;
}

export function buildResourceCompanionLinks(resource: LibraryResource): ResourceCompanionLink[] {
  const queryBase = sanitizeTitle(resource.title || '');
  const primaryQuery = [queryBase, resource.subjects?.[0], resource.topics?.[0]]
    .filter(Boolean)
    .join(' ');
  const trailerQuery = `${queryBase || resource.title} official trailer`;

  const links: ResourceCompanionLink[] = [];

  if (resource.url) {
    links.push({
      id: 'primary-source',
      label: isWikipediaUrl(resource.url)
        ? 'Wikipedia entry'
        : isYouTubeUrl(resource.url)
          ? 'YouTube source'
          : 'Original source',
      description: 'Open the main source linked to this resource.',
      url: resource.url,
      kind: 'primary',
    });
  }

  if (!isWikipediaUrl(resource.url) && queryBase) {
    links.push({
      id: 'wikipedia',
      label: 'Wikipedia context',
      description: 'Ground the topic with a quick encyclopedic overview.',
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(queryBase)}`,
      kind: 'wikipedia',
    });
  }

  if (
    !isYouTubeUrl(resource.url) &&
    (resource.type === 'movie_trailer' || resource.type === 'video' || queryBase.length > 0)
  ) {
    links.push({
      id: 'trailer-or-video',
      label: resource.type === 'movie_trailer' ? 'Trailer search' : 'Video search',
      description: 'Look for related trailers, lectures, or visual explainers on YouTube.',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        resource.type === 'movie_trailer' ? trailerQuery : primaryQuery || resource.title,
      )}`,
      kind: 'trailer',
    });
  }

  if (primaryQuery) {
    links.push({
      id: 'web-search',
      label: 'Broader web search',
      description: 'Find official sites, reviews, or broader context outside the app.',
      url: `https://duckduckgo.com/?q=${encodeURIComponent(primaryQuery)}`,
      kind: 'search',
    });
  }

  return dedupeLinks(links);
}
