/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'astro:content' {
  export function defineCollection(config: unknown): unknown;
  export function getCollection(
    collection: string,
    filter?: (entry: { id: string; data: Record<string, unknown> }) => boolean,
  ): Promise<Array<{ id: string; data: Record<string, unknown> }>>;
}
