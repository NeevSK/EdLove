import type { DocumentAdapterProps } from '../../../theme/contracts';
import { safeFileUrl } from '../../shared/files';
import { FileCard } from './FileCard';

/**
 * Default PDF adapter on the web: the browser's own viewer (page, zoom,
 * search, print). Browsers do not report a failed frame load, so the file is
 * always offered as a download beside it.
 */
export function BrowserPdfAdapter({ file }: DocumentAdapterProps) {
  const src = safeFileUrl(file.uri);
  // An address that is not safe to frame is never framed or linked: just the file, named.
  if (!src) return <FileCard file={file} />;
  return (
    <div className="gd-document-pdf">
      <iframe
        className="gd-document-frame"
        src={src}
        title={file.name}
        sandbox="allow-scripts allow-same-origin allow-downloads"
      />
      <FileCard file={file} href={src} />
    </div>
  );
}
