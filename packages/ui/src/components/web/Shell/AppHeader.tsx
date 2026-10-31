import { useEffect, useId, useRef } from 'react';
import type { AppHeaderContract, HeaderAction, KitIconProps } from '../../../theme/contracts';
import { cx } from '../cx';
import { IconButton } from '../IconButton/IconButton';
import { Avatar } from '../Status/Status';

function Chevron({ size = 22 }: KitIconProps) {
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1 }}>
      ‹
    </span>
  );
}
function Lines({ size = 22 }: KitIconProps) {
  return (
    <span aria-hidden style={{ fontSize: size * 0.9, lineHeight: 1 }}>
      ≡
    </span>
  );
}

export interface AppHeaderProps extends AppHeaderContract {
  icons?: { back?: HeaderAction['icon']; menu?: HeaderAction['icon'] };
  /** Heading level of the title (the page's own heading is usually 1). */
  level?: 1 | 2;
  className?: string;
}

function Action({ action }: { action: HeaderAction }) {
  const name =
    action.badge !== undefined && action.badgeLabel
      ? `${action.label}, ${action.badgeLabel}`
      : action.label;
  return (
    <span className="gd-app-header-action" data-expanded={action.expanded ? '' : undefined}>
      <IconButton
        icon={action.icon}
        label={name}
        onClick={action.onPress}
        aria-expanded={action.expanded}
      />
      {action.badge === 'dot' ? (
        <span className="gd-app-header-dot" data-tone={action.badgeTone ?? 'lamp'} aria-hidden />
      ) : action.badge !== undefined && action.badge > 0 ? (
        <span className="gd-app-header-count" data-tone={action.badgeTone ?? 'lamp'} aria-hidden>
          {action.badge > 9 ? '9+' : action.badge}
        </span>
      ) : null}
    </span>
  );
}

/**
 * The header every page shares, in the app's usual places: leading control and
 * identity on the left, actions on the right, search opening underneath. It
 * lifts with a hairline and shadow when content scrolls under it.
 */
export function AppHeader({
  title,
  eyebrow,
  leading,
  avatar,
  perspective,
  actions = [],
  trailing,
  status,
  search,
  raised = false,
  ruled = false,
  compact = false,
  icons,
  level = 1,
  className,
}: AppHeaderProps) {
  const searchId = useId();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (search?.open) input.current?.focus();
  }, [search?.open]);
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <header
      className={cx('gd-app-header', className)}
      data-raised={raised ? '' : undefined}
      data-ruled={ruled ? '' : undefined}
      data-compact={compact ? '' : undefined}
    >
      <div className="gd-app-header-row">
        {leading ? (
          <IconButton
            icon={leading.kind === 'back' ? (icons?.back ?? Chevron) : (icons?.menu ?? Lines)}
            label={leading.label}
            onClick={leading.onPress}
          />
        ) : null}
        {avatar ? (
          <button
            type="button"
            className="gd-app-header-avatar"
            aria-label={avatar.label}
            onClick={avatar.onPress}
          >
            <Avatar name={avatar.name} src={avatar.src} size="sm" />
          </button>
        ) : null}
        <div className="gd-app-header-identity">
          {status ? (
            <p className="gd-app-header-status" data-tone={status.tone} aria-live="polite">
              {status.label}
            </p>
          ) : eyebrow && !compact ? (
            <p className="gd-app-header-eyebrow">{eyebrow}</p>
          ) : null}
          {perspective ? <Heading className="gd-visually-hidden">{title}</Heading> : null}
          {perspective ? (
            <button
              type="button"
              className="gd-chip gd-app-header-perspective"
              data-state="rest"
              aria-label={perspective.label}
              aria-description={perspective.switchLabel}
              disabled={!perspective.onPress}
              onClick={perspective.onPress}
            >
              <span>{perspective.label}</span>
              {perspective.onPress ? <span aria-hidden>▾</span> : null}
            </button>
          ) : (
            <Heading className="gd-app-header-title">{title}</Heading>
          )}
        </div>
        {actions.length > 0 || trailing ? (
          <div className="gd-app-header-actions">
            {actions.map((a) => (
              <Action key={a.key} action={a} />
            ))}
            {trailing}
          </div>
        ) : null}
      </div>
      {search?.open ? (
        <div className="gd-app-header-search">
          <label htmlFor={searchId} className="gd-visually-hidden">
            {search.label}
          </label>
          <input
            ref={input}
            id={searchId}
            type="search"
            className="gd-field-input"
            value={search.value}
            placeholder={search.placeholder}
            onChange={(e) => search.onChange(e.target.value)}
          />
        </div>
      ) : null}
    </header>
  );
}
