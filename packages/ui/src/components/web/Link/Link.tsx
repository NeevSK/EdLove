import type { AnchorHTMLAttributes, Ref } from 'react';
import type { LinkContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface LinkProps extends LinkContract, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
}

/** Words that go somewhere: the world's deep lamp, underlined, so colour is never the only cue. */
export function Link({ label, className, ref, ...rest }: LinkProps) {
  return (
    <a ref={ref} {...rest} className={cx('gd-link', className)}>
      {label}
    </a>
  );
}
