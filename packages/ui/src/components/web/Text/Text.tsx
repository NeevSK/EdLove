import type { HTMLAttributes, Ref } from 'react';
import type { TextContract } from '../../../theme/contracts';
import { cx } from '../cx';

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'label';

export interface TextProps extends TextContract, HTMLAttributes<HTMLElement> {
  /** The element to render. Defaults to `h1` for display, `p` otherwise. */
  as?: TextElement;
  ref?: Ref<HTMLElement>;
}

export function Text({
  kind = 'body',
  tone,
  align,
  as,
  className,
  style,
  ref,
  ...rest
}: TextProps) {
  const Tag = (as ?? (kind === 'display' ? 'h1' : 'p')) as 'p';
  return (
    <Tag
      ref={ref as Ref<HTMLParagraphElement>}
      {...rest}
      className={cx('gd-text', className)}
      data-kind={kind}
      data-tone={tone}
      style={align ? { textAlign: align, ...style } : style}
    />
  );
}
