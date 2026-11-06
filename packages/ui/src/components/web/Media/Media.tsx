'use client';

import { type CSSProperties, type ReactNode, useState } from 'react';
import type { MediaContract } from '../../../theme/contracts';
import { fileKindOf, safeFileUrl } from '../../shared/files';
import { MEDIA_ENGLISH } from '../../shared/media';
import { FileCard } from './FileCard';

export type MediaProps = MediaContract & { className?: string };

/**
 * An image, video or voice clip with the browser's own players (keyboard,
 * captions, speed and picture-in-picture for free). Video never autoplays;
 * images speak their `alt`; anything unplayable or unsafe becomes a file card.
 */
export function Media({
  file,
  alt,
  decorative = false,
  caption,
  aspect,
  captions,
  poster,
  transcript,
  labels,
  className,
}: MediaProps) {
  const l = { ...MEDIA_ENGLISH, ...labels };
  const [failed, setFailed] = useState(false);
  const kind = fileKindOf(file);
  const src = safeFileUrl(file.uri);
  const posterSrc = poster ? safeFileUrl(poster) : null;
  const trackSrc = captions ? safeFileUrl(captions.uri) : null;
  const style = aspect ? ({ aspectRatio: String(aspect) } as CSSProperties) : undefined;
  const name = alt ?? caption ?? file.name;

  let body: ReactNode;
  if (failed || !src) {
    body = (
      <>
        <p role="alert" className="gd-media-note">
          {l.unavailable}
        </p>
        <FileCard file={file} />
      </>
    );
  } else if (kind === 'image') {
    body = (
      <img
        className="gd-media-frame"
        style={style}
        src={src}
        alt={decorative ? '' : name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  } else if (kind === 'video') {
    body = (
      <video
        className="gd-media-frame"
        style={style}
        src={src}
        poster={posterSrc ?? undefined}
        controls
        preload="metadata"
        playsInline
        aria-label={name}
        onError={() => setFailed(true)}
      >
        {captions && trackSrc ? (
          <track
            kind="captions"
            src={trackSrc}
            srcLang={captions.language}
            label={captions.label}
            default
          />
        ) : null}
      </video>
    );
  } else if (kind === 'audio') {
    body = (
      <audio
        className="gd-media-audio"
        src={src}
        controls
        preload="metadata"
        aria-label={name}
        onError={() => setFailed(true)}
      />
    );
  } else {
    body = <FileCard file={file} />;
  }

  return (
    <figure className={['gd-media', className].filter(Boolean).join(' ')} data-kind={kind}>
      {body}
      {caption ? <figcaption className="gd-media-caption">{caption}</figcaption> : null}
      {transcript && kind !== 'image' ? (
        <details className="gd-media-transcript">
          <summary>{l.transcript}</summary>
          <p>{transcript}</p>
        </details>
      ) : null}
    </figure>
  );
}
