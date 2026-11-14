import type { IconContract } from '../../../theme/contracts';
import { iconSize } from '../../../tokens/sizes';

export type IconProps = IconContract;

/** An icon in a text tone. Hidden from screen readers unless it has a label. */
export function Icon({ icon: Glyph, size = 'md', tone = 'ink', label }: IconProps) {
  return (
    <span
      className="gd-icon"
      data-tone={tone}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Glyph size={iconSize[size]} color="currentColor" aria-hidden />
    </span>
  );
}
