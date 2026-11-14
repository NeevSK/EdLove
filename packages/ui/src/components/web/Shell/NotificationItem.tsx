import type { NotificationItemContract } from '../../../theme/contracts';
import { iconSize } from '../../../tokens/sizes';
import { NOTIFICATION_ENGLISH } from '../../shared/notifications';

export type NotificationItemProps = NotificationItemContract;

/**
 * One notification, in rows that sit in a day's `Group`. Unread ones carry
 * the world's lit mark and say "Unread" first; mark-as-read is a quiet button.
 */
export function NotificationItem({
  title,
  body,
  time,
  unread,
  icon: Glyph,
  tone = 'plain',
  onPress,
  onMarkRead,
  labels,
}: NotificationItemProps) {
  const l = { ...NOTIFICATION_ENGLISH, ...labels };
  const words = (
    <>
      <span className="gd-notification-mark" aria-hidden />
      {Glyph ? (
        <span className="gd-notification-icon" aria-hidden>
          <Glyph size={iconSize.md} color="currentColor" aria-hidden />
        </span>
      ) : null}
      <span className="gd-notification-words">
        {unread ? <span className="gd-visually-hidden">{l.unread}: </span> : null}
        <span className="gd-notification-title">{title}</span>
        {body ? <span className="gd-notification-body">{body}</span> : null}
      </span>
      <time className="gd-notification-time">{time}</time>
    </>
  );
  return (
    <div className="gd-notification" data-unread={unread ? '' : undefined} data-tone={tone}>
      {onPress ? (
        <button type="button" className="gd-notification-main" onClick={onPress}>
          {words}
        </button>
      ) : (
        <div className="gd-notification-main">{words}</div>
      )}
      {unread && onMarkRead ? (
        <button type="button" className="gd-notification-read" onClick={onMarkRead}>
          {l.markRead}
        </button>
      ) : null}
    </div>
  );
}
