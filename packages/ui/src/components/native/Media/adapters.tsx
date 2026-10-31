import { type ComponentType, createContext, type ReactNode, useContext, useMemo } from 'react';
import type {
  DocumentAdapterProps,
  DocumentKind,
  NativeMarkdownAdapterProps,
  RichTextAdapterProps,
} from '../../../theme/contracts';
import { EnrichedMarkdownAdapter } from './EnrichedMarkdownAdapter';
import { EnrichedRichTextAdapter } from './EnrichedRichTextAdapter';

/**
 * The renderers this app has chosen for media and documents (the adapters
 * behind the kit's ports). A screen never imports a renderer; it renders
 * `Markdown` or `DocumentView` and the nearest `MediaAdapters` decides.
 */
export interface MediaAdapterSet {
  markdown?: ComponentType<NativeMarkdownAdapterProps>;
  richText?: ComponentType<RichTextAdapterProps>;
  documents?: Partial<Record<DocumentKind, ComponentType<DocumentAdapterProps>>>;
}

/** Installed with the kit: Software Mansion's enriched-markdown reads and edits Markdown. Documents have no default. */
const DEFAULTS: MediaAdapterSet = {
  markdown: EnrichedMarkdownAdapter,
  richText: EnrichedRichTextAdapter,
};

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
      richText: adapters.richText ?? parent.richText,
      documents: { ...parent.documents, ...adapters.documents },
    }),
    [adapters, parent],
  );
  return <MediaAdaptersContext value={value}>{children}</MediaAdaptersContext>;
}
