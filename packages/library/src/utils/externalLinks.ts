import type { ExternalLinkOpenOptions } from '@repo/ui/utils';
import type { LibraryResource } from '@repo/library/types';

export function buildLibraryExternalLinkOptions(
  resource: LibraryResource,
  sourceLabel = 'Library',
): ExternalLinkOpenOptions {
  const trustLevel =
    resource.link_status === 'broken'
      ? 'broken'
      : resource.verified || resource.link_status === 'working'
        ? 'verified'
        : 'external';

  const sourceBadge =
    resource.link_status === 'broken'
      ? 'Broken or unverified link'
      : resource.verified
        ? 'Verified source'
        : 'External source';

  return {
    title: resource.title,
    sourceLabel,
    sourceBadge,
    trustLevel,
  };
}
