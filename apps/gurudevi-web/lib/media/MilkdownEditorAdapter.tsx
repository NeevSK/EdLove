'use client';

import type { RichTextAdapterProps } from '@repo/ui/theme';
import { useEffect, useRef } from 'react';

/**
 * Markdown-first WYSIWYG editor powered by `@milkdown/kit`.
 */
export function MilkdownEditorAdapter({
  value,
  onChange,
  editable = true,
  accessibilityLabel,
}: RichTextAdapterProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let destroyed = false;
    let destroyEditor: (() => Promise<void>) | undefined;

    (async () => {
      const container = hostRef.current;
      if (!container) return;

      const { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } = await import(
        '@milkdown/kit/core'
      );
      const { commonmark } = await import('@milkdown/kit/preset/commonmark');
      const { gfm } = await import('@milkdown/kit/preset/gfm');
      const { listener, listenerCtx } = await import('@milkdown/kit/plugin/listener');

      if (destroyed) return;

      const editor = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, container);
          ctx.set(defaultValueCtx, value);
          ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            editable: () => editable,
            attributes: {
              'aria-label': accessibilityLabel ?? 'Rich text editor',
              class: 'gd-milkdown-prose',
            },
          }));
          ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
            if (markdown !== prevMarkdown) {
              onChangeRef.current(markdown);
            }
          });
        })
        .use(commonmark)
        .use(gfm)
        .use(listener)
        .create();

      if (destroyed) {
        await editor.destroy();
        return;
      }
      destroyEditor = async () => {
        await editor.destroy();
      };
    })();

    return () => {
      destroyed = true;
      void destroyEditor?.();
    };
  }, [editable, accessibilityLabel]);

  return (
    <div
      ref={hostRef}
      style={{
        minHeight: '180px',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid rgba(104, 94, 85, 0.25)',
        background: 'var(--color-paper, #ffffff)',
      }}
    />
  );
}
