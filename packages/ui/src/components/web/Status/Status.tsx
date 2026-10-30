import { type CSSProperties, useState } from 'react';
import type { AvatarContract, BadgeContract, ProgressContract } from '../../../theme/contracts';
import { cx } from '../cx';
import { initialsOf } from '../../shared/initials';

export interface ProgressProps extends ProgressContract {
  className?: string;
}

/** How far something has got, in the world's lamp on its sunken track. */
export function Progress({ value, label, className }: ProgressProps) {
  const known = value !== undefined;
  const now = known ? Math.round(Math.min(1, Math.max(0, value)) * 100) : undefined;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={known ? 0 : undefined}
      aria-valuemax={known ? 100 : undefined}
      aria-valuenow={now}
      aria-busy={known ? undefined : true}
      className={cx('gd-progress', className)}
      data-indeterminate={known ? undefined : ''}
      style={{ '--gd-progress': `${now ?? 0}%` } as CSSProperties}
    >
      <span className="gd-progress-fill" />
    </div>
  );
}

export interface BadgeProps extends BadgeContract {
  className?: string;
}

/** A short status or count ("New", "3"). Not interactive. */
export function Badge({ label, tone = 'neutral', className }: BadgeProps) {
  return (
    <span className={cx('gd-badge', className)} data-tone={tone}>
      {label}
    </span>
  );
}

const AVATAR = { sm: 28, md: 40, lg: 64 } as const;

export interface AvatarProps extends AvatarContract {
  className?: string;
}

/** A person: their photo, or their initials on the world's paper with its ornament ring. */
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const d = AVATAR[size];
  return (
    <span
      role="img"
      aria-label={name}
      className={cx('gd-avatar', className)}
      style={{ width: d, height: d, fontSize: Math.round(d * 0.38) }}
    >
      {src && !failed ? (
        <img src={src} alt="" width={d} height={d} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}

/** A quiet line between groups, in the world's hairline. */
export function Divider({ className }: { className?: string }) {
  return <hr className={cx('gd-divider', className)} />;
}
