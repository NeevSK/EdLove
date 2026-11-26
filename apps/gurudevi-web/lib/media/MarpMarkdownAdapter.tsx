'use client';

import { parseBody } from '@repo/library/content/body';
import { H5pView } from '@repo/ui/components/web';
import type { DocumentAdapterProps, MarkdownAdapterProps } from '@repo/ui/theme';
import { useEffect, useMemo, useState } from 'react';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const proseProcessor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDirective)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

interface H5pEmbedMatch {
  readonly pack: string;
}

function extractH5pEmbeds(source: string): H5pEmbedMatch[] {
  const matches: H5pEmbedMatch[] = [];
  const regex = /^::h5p\{pack=([^\s}]+)\}/gm;
  for (const m of source.matchAll(regex)) {
    const raw = (m[1] ?? '').replace(/^["']|["']$/g, '').trim();
    if (raw) matches.push({ pack: raw });
  }
  return matches;
}

/**
 * Renders Gurudevi Markdown v1:
 * - `kind: slides` / `marp: true` renders via `@marp-team/marp-core`
 * - `kind: page` renders sanitized HTML via `unified`/`remark`/`rehype`
 *   plus inline `<H5pView>` embeds for `::h5p{pack=...}` directives.
 */
export function MarpMarkdownAdapter({ source }: MarkdownAdapterProps) {
  const parsed = useMemo(() => parseBody(source), [source]);
  const isSlides = parsed.frontMatter.kind === 'slides' || parsed.frontMatter.marp === true;
  const h5pEmbeds = useMemo(() => extractH5pEmbeds(source), [source]);

  const [slidesOut, setSlidesOut] = useState<{ html: string; css: string } | null>(null);
  const [proseHtml, setProseHtml] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isSlides) {
        const { Marp } = await import('@marp-team/marp-core');
        const marp = new Marp({ html: false });
        const { html, css } = marp.render(source);
        if (!cancelled) setSlidesOut({ html, css });
      } else {
        const cleaned = source.replace(/^::h5p\{pack=[^\s}]+\}\s*$/gm, '');
        const file = await proseProcessor.process(cleaned);
        if (!cancelled) setProseHtml(String(file));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, isSlides]);

  if (isSlides) {
    return (
      <div className="gd-marp-deck" style={{ width: '100%' }}>
        {slidesOut ? (
          <>
            <style>{slidesOut.css}</style>
            <div dangerouslySetInnerHTML={{ __html: slidesOut.html }} />
          </>
        ) : (
          <p role="status" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            Rendering slides…
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="gd-markdown-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div dangerouslySetInnerHTML={{ __html: proseHtml }} />
      {h5pEmbeds.map((embed) => (
        <H5pView
          key={embed.pack}
          packageUrl={embed.pack.startsWith('/') ? embed.pack : `/h5p-samples/${embed.pack}/`}
          title={`Interactive activity: ${embed.pack}`}
        />
      ))}
    </div>
  );
}

/**
 * DocumentView adapter for `.md` / `.markdown` and Marp slide files fetched by URL.
 */
export function MarkdownFileAdapter({ file, onError }: DocumentAdapterProps) {
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(file.uri);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!cancelled) setSource(text);
      } catch {
        if (!cancelled) onError();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file.uri, onError]);

  if (source === null) {
    return (
      <p role="status" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
        Loading document…
      </p>
    );
  }

  return <MarpMarkdownAdapter source={source} />;
}
