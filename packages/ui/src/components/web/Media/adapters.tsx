import { type ComponentType, createContext, type ReactNode, useContext, useMemo } from 'react';
import type {
  DocumentAdapterProps,
  DocumentKind,
  MarkdownAdapterProps,
} from '../../../theme/contracts';
import { BrowserPdfAdapter } from './BrowserPdfAdapter';

/**
 * The renderers this app has chosen for media and documents (the adapters
 * behind the kit's ports). A screen renders `Markdown` or `DocumentView`; the
 * nearest `MediaAdapters` decides how.
 */
export interface MediaAdapterSet {
  markdown?: ComponentType<MarkdownAdapterProps>;
  documents?: Partial<Record<DocumentKind, ComponentType<DocumentAdapterProps>>>;
}

/** Built in: the browser's own PDF viewer. Markdown waits for the app's choice. */
const DEFAULTS: MediaAdapterSet = { documents: { pdf: BrowserPdfAdapter } };

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
