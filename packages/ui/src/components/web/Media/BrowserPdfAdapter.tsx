import type { DocumentAdapterProps } from '../../../theme/contracts';
import { FileCard } from './FileCard';

/**
 * Default PDF adapter on the web: the browser's own viewer (page, zoom,
 * search, print). Browsers do not report a failed frame load, so the file is
 * always offered as a download beside it.
 */
export function BrowserPdfAdapter({ file }: DocumentAdapterProps) {
  return (
    <div className="gd-document-pdf">
      <iframe className="gd-document-frame" src={file.uri} title={file.name} />
      <FileCard file={file} href={file.uri} />
    </div>
  );
}
