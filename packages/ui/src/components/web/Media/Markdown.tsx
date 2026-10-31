import type { MarkdownContract } from '../../../theme/contracts';
import { useMediaAdapters } from './adapters';

export type MarkdownProps = MarkdownContract & { className?: string };

/**
 * Markdown set in the world's prose. The nearest `MediaAdapters` draws it;
 * with none, its paragraphs show as plain text (never as HTML), so nothing is
 * lost and nothing unsafe runs.
 */
export function Markdown({ source, tone = 'ground', onLinkPress, className }: MarkdownProps) {
  const { markdown: Adapter } = useMediaAdapters();
  return (
    <div className={['gd-prose', className].filter(Boolean).join(' ')} data-tone={tone}>
      {Adapter ? (
        <Adapter source={source} onLinkPress={onLinkPress} />
      ) : (
        source
          .split(/\n{2,}/)
          .filter((p) => p.trim() !== '')
          .map((p, i) => (
            <p key={i} className="gd-prose-p">
              {p}
            </p>
          ))
      )}
    </div>
  );
}
