import { type ComponentType, createContext, type ReactNode, useContext, useMemo } from 'react';
import type {
  DocumentAdapterProps,
  DocumentKind,
  NativeMarkdownAdapterProps,
} from '../../../theme/contracts';
import { EnrichedMarkdownAdapter } from './EnrichedMarkdownAdapter';

/**
 * The renderers this app has chosen for media and documents (the adapters
 * behind the kit's ports). A screen never imports a renderer; it renders
 * `Markdown` or `DocumentView` and the nearest `MediaAdapters` decides.
 */
export interface MediaAdapterSet {
  markdown?: ComponentType<NativeMarkdownAdapterProps>;
  documents?: Partial<Record<DocumentKind, ComponentType<DocumentAdapterProps>>>;
}

/** Installed with the kit: enriched-markdown draws Markdown. Documents have no default. */
const DEFAULTS: MediaAdapterSet = { markdown: EnrichedMarkdownAdapter };

const MediaAdaptersContext = createContext<MediaAdapterSet>(DEFAULTS);

export function useMediaAdapters(): MediaAdapterSet {
  return useContext(MediaAdaptersContext);
}

/** Plug in renderers for a part of the app; anything not named is inherited. */
export function MediaAdapters({
  adapters,
  children,
}: {
  adapters: MediaAdapterSet;
  children: ReactNode;
}) {
  const parent = useMediaAdapters();
  const value = useMemo(
    () => ({
      markdown: adapters.markdown ?? parent.markdown,
      documents: { ...parent.documents, ...adapters.documents },
    }),
    [adapters, parent],
  );
  return <MediaAdaptersContext value={value}>{children}</MediaAdaptersContext>;
}
