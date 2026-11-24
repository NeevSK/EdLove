'use client';

import type { H5pContract } from '../../../theme/contracts';
import { useMediaAdapters } from './adapters';

export type H5pViewProps = H5pContract & { className?: string };

/**
 * An interactive H5P activity rendered by the app-chosen host adapter. With
 * none registered, renders a quiet placeholder noting the pack URL.
 */
export function H5pView({ className, ...props }: H5pViewProps) {
  const { h5p: Adapter } = useMediaAdapters();
  if (!Adapter) {
    return (
      <div
        className={['gd-h5p-fallback', className].filter(Boolean).join(' ')}
        role="region"
        aria-label={props.title ?? 'Interactive H5P activity'}
      >
        <p className="gd-prose-p">
          Interactive H5P package: <code>{props.packageUrl}</code>
        </p>
      </div>
    );
  }
  return (
    <div className={['gd-h5p', className].filter(Boolean).join(' ')}>
      <Adapter {...props} />
    </div>
  );
}
