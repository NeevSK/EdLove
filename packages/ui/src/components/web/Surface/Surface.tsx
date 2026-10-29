import type { HTMLAttributes, Ref } from 'react';
import type { SurfaceContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface SurfaceProps extends SurfaceContract, HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function Surface({ tone = 'raised', className, ref, ...rest }: SurfaceProps) {
  return <div ref={ref} {...rest} className={cx('gd-surface', className)} data-tone={tone} />;
}
