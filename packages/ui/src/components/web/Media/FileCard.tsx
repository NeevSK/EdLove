import type { FileCardContract } from '../../../theme/contracts';
import { extensionOf, FILE_CARD_ENGLISH, fileKindOf, formatBytes } from '../../shared/files';
import { Button } from '../Button/Button';
import { Progress } from '../Status/Status';

export { FILE_CARD_ENGLISH };

export type FileCardProps = FileCardContract & {
  /** On the web a file can simply be a link (download or open in a tab). */
  href?: string;
  lang?: string;
};

/**
 * A file as a held thing: its type mark, name and size. A link with `href`, a
 * button with `onOpen`; shows progress, an announced error with retry, and remove.
 */
export function FileCard({
  file,
  onOpen,
  href,
  progress,
  error,
  onRetry,
  onRemove,
  labels,
  lang,
}: FileCardProps) {
  const l = { ...FILE_CARD_ENGLISH, ...labels };
  const kind = fileKindOf(file);
  const mark = (extensionOf(file.name) || l.kinds[kind]).slice(0, 4).toUpperCase();
  const meta = [l.kinds[kind], file.size === undefined ? null : formatBytes(file.size, lang)]
    .filter(Boolean)
    .join(' · ');
  const percent = progress === undefined ? null : Math.round(progress * 100);
  const summary = (
    <>
      <span className="gd-file-mark" aria-hidden>
        {mark}
      </span>
      <span className="gd-file-words">
        <span className="gd-file-name">{file.name}</span>
        <span className="gd-file-meta">{meta}</span>
      </span>
    </>
  );
  return (
    <div className="gd-file" data-kind={kind} data-state={error ? 'error' : undefined}>
      {href ? (
        <a className="gd-file-summary" href={href} download={file.name}>
          {summary}
        </a>
      ) : onOpen ? (
        <button type="button" className="gd-file-summary" onClick={onOpen}>
          {summary}
        </button>
      ) : (
        <div className="gd-file-summary">{summary}</div>
      )}
      {percent !== null && !error ? (
        <Progress value={progress} label={l.progress(percent)} />
      ) : null}
      {error ? (
        <p className="gd-file-error" role="alert">
          {error}
        </p>
      ) : null}
      {(error && onRetry) || onRemove ? (
        <div className="gd-file-actions">
          {error && onRetry ? (
            <Button label={l.retry} variant="secondary" size="sm" onClick={onRetry} />
          ) : null}
          {onRemove ? (
            <Button label={l.remove} variant="quiet" size="sm" onClick={onRemove} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
