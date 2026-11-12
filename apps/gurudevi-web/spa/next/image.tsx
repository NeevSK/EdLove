import type { ImgHTMLAttributes, Ref } from 'react';

/** `next/image` for the Vite build: a plain image with the same props. Leaves with the last import of it. */
export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  quality?: number;
  placeholder?: string;
  ref?: Ref<HTMLImageElement>;
}

export default function Image({
  src,
  fill,
  priority,
  unoptimized: _u,
  quality: _q,
  placeholder: _p,
  style,
  ...rest
}: ImageProps) {
  return (
    <img
      {...rest}
      src={typeof src === 'string' ? src : src.src}
      loading={priority ? 'eager' : (rest.loading ?? 'lazy')}
      fetchPriority={priority ? 'high' : rest.fetchPriority}
      style={
        fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style } : style
      }
    />
  );
}
