import {
  type ComponentType,
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import type {
  AudioAdapterProps,
  CapturePorts,
  DocumentAdapterProps,
  DocumentKind,
  NativeMarkdownAdapterProps,
  RichTextAdapterProps,
  VideoAdapterProps,
} from '../../../theme/contracts';
import { EnrichedMarkdownAdapter } from './EnrichedMarkdownAdapter';
import { EnrichedRichTextAdapter } from './EnrichedRichTextAdapter';
import { ExpoVideoAdapter } from './ExpoVideoAdapter';

/**
 * The renderers and capture tools this app has chosen (the adapters behind
 * the kit's ports). A screen never imports a renderer or picker; it renders
 * `Markdown`, `Media`, `FileField`... and the adapters decide how.
 */
export interface MediaAdapterSet {
  markdown?: ComponentType<NativeMarkdownAdapterProps>;
  richText?: ComponentType<RichTextAdapterProps>;
  documents?: Partial<Record<DocumentKind, ComponentType<DocumentAdapterProps>>>;
  audio?: ComponentType<AudioAdapterProps>;
  video?: ComponentType<VideoAdapterProps>;
  capture?: CapturePorts;
}

/**
 * Installed with the kit: Software Mansion's enriched-markdown reads and edits
 * Markdown, expo-video plays video. Audio, pickers and the recorder come from
 * the app (`registerMediaAdapters`), which owns those native modules.
 */
const DEFAULTS: MediaAdapterSet = {
  markdown: EnrichedMarkdownAdapter,
  richText: EnrichedRichTextAdapter,
  video: ExpoVideoAdapter,
};

function merge(base: MediaAdapterSet, over: MediaAdapterSet): MediaAdapterSet {
  return {
    markdown: over.markdown ?? base.markdown,
    richText: over.richText ?? base.richText,
    audio: over.audio ?? base.audio,
    video: over.video ?? base.video,
    documents: { ...base.documents, ...over.documents },
    capture: { ...base.capture, ...over.capture },
  };
}

let registered: MediaAdapterSet = DEFAULTS;
const listeners = new Set<() => void>();

/**
 * Called once at app start with the app's adapters (no wrapper in the tree).
 * Later calls add to what is registered.
 */
export function registerMediaAdapters(adapters: MediaAdapterSet): void {
  registered = merge(registered, adapters);
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const LocalAdapters = createContext<MediaAdapterSet | null>(null);

export function useMediaAdapters(): MediaAdapterSet {
  const app = useSyncExternalStore(subscribe, () => registered, () => registered);
  const local = useContext(LocalAdapters);
  return useMemo(() => (local ? merge(app, local) : app), [app, local]);
}

/** Override adapters for one part of the app (a preview, a test); the rest is inherited. */
export function MediaAdapters({ adapters, children }: { adapters: MediaAdapterSet; children: ReactNode }) {
  const parent = useContext(LocalAdapters);
  const value = useMemo(() => (parent ? merge(parent, adapters) : adapters), [adapters, parent]);
  return <LocalAdapters value={value}>{children}</LocalAdapters>;
}
