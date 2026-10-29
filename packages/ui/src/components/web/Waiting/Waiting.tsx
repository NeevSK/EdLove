import type { CSSProperties } from 'react';
import type { LoadingContract, SkeletonContract } from '../../../theme/contracts';
import { radiusCss } from '../../../theme/css';
import { cx } from '../cx';
import { Text } from '../Text/Text';
import { WaitingSign } from '../WaitingSign/WaitingSign';

const SIGN_SIZE = { sm: 28, md: 44, lg: 64 } as const;

export interface WorldLoadingProps extends LoadingContract {
  className?: string;
  style?: CSSProperties;
}

/** Waiting, in the world's own sign, with the words people need. */
export function WorldLoading({
  label,
  size = 'md',
  quiet,
  fullscreen,
  className,
  style,
}: WorldLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cx('gd-loading', className)}
      data-fullscreen={fullscreen || undefined}
      style={style}
    >
      <WaitingSign size={SIGN_SIZE[size]} />
      <Text kind="caption" tone="soft" align="center" className={quiet ? 'gd-sr' : undefined}>
        {label}
      </Text>
    </div>
  );
}

export interface WorldSkeletonProps extends SkeletonContract {
  width?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * A placeholder in the world's sunken colour and inset corners. It shimmers
 * with the world's lamp at the world's breathing pace; `still` and reduced
 * motion hold it still.
 */
export function WorldSkeleton({
  width = '100%',
  height,
  radius,
  still = false,
  className,
  style,
}: WorldSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cx('gd-skeleton', className)}
      data-still={still || undefined}
      style={{
        width,
        height,
        ...(radius === undefined ? null : { borderRadius: radiusCss(radius) }),
        ...style,
      }}
    />
  );
}
