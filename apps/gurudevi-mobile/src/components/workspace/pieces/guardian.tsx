import type { GuardianDesk } from '@repo/classroom/deskPort';
import { Row, Stack, Text } from '@repo/ui/components/native';
import type { ReactNode } from 'react';
import { type PieceContext, percent, rows } from './common';
import { PieceFrame } from './PieceFrame';

/** Draws one piece of a guardian's family room. Unknown ids return null. */
export function guardianPiece(
  id: string,
  label: string,
  desk: GuardianDesk,
  ctx: PieceContext,
): ReactNode {
  const { t, locale } = ctx;
  const onOpen = ctx.canOpen(id) ? () => ctx.open?.(id) : undefined;
  const statusWord = (s: 'present' | 'late' | 'excused') =>
    ({
      present: t('work.arrival.present', 'Arrived'),
      late: t('work.arrival.late', 'Late'),
      excused: t('work.arrival.excused', 'Excused'),
    })[s];

  switch (id) {
    case 'child-day': {
      const child = desk.children[0];
      const today = desk.arrivals[0];
      return (
        <PieceFrame
          title={label}
          summary={
            child
              ? today
                ? t('work.childDay.arrived', '{{name}}: {{status}} at {{time}}', {
                    name: child.name,
                    status: statusWord(today.status),
                    time: today.time,
                  })
                : t('work.childDay.noArrival', '{{name}}: no arrival recorded yet', {
                    name: child.name,
                  })
              : t('work.children.none', 'No children linked yet')
          }
          onOpen={onOpen}
        >
          {child ? (
            <Text kind="caption" tone="soft">
              {child.grade}
            </Text>
          ) : null}
        </PieceFrame>
      );
    }
    case 'absences': {
      const missed = desk.arrivals.filter((a) => a.status !== 'present');
      return (
        <PieceFrame
          title={label}
          badge={missed.length > 0 ? { label: String(missed.length), attention: true } : undefined}
          summary={
            missed.length === 0
              ? t('work.absences.none', 'No absences or late arrivals lately')
              : undefined
          }
          onOpen={onOpen}
        >
          {rows(
            missed,
            (a) => (
              <Row label={statusWord(a.status)} detail={`${a.date} ${a.time}`} />
            ),
            (a) => a.id,
          )}
        </PieceFrame>
      );
    }
    case 'fees':
      return (
        <PieceFrame
          title={label}
          summary={t('work.fees.none', 'Fee notices from the school will show here')}
          onOpen={onOpen}
        />
      );
    case 'children':
      return (
        <PieceFrame title={label} onOpen={onOpen}>
          {rows(
            desk.children,
            (c) => (
              <Row
                label={c.name}
                detail={c.grade}
                note={t('work.children.attendance', '{{rate}} attendance', {
                  rate: percent(c.attendance, locale),
                })}
              />
            ),
            (c) => c.id,
          )}
        </PieceFrame>
      );
    case 'progress':
      return (
        <PieceFrame
          title={label}
          summary={t('work.progress.summary', 'Teachers, attendance and notes for each child')}
          onOpen={onOpen}
        >
          {rows(
            desk.children,
            (c) => (
              <Row
                label={c.name}
                detail={t('work.progress.teacher', 'Class teacher: {{name}}', { name: c.teacher })}
              />
            ),
            (c) => c.id,
          )}
        </PieceFrame>
      );
    case 'messages': {
      const unread = desk.conversations.reduce((n, c) => n + c.unread, 0);
      return (
        <PieceFrame
          title={label}
          badge={
            unread > 0
              ? { label: t('work.messages.unread', '{{n}} unread', { n: unread }), attention: true }
              : undefined
          }
          summary={
            desk.conversations.length === 0
              ? t('work.messages.none', 'No conversations yet')
              : undefined
          }
          onOpen={onOpen}
        >
          {rows(
            desk.conversations,
            (c) => (
              <Row label={c.name} detail={c.last} signal={c.unread > 0} />
            ),
            (c) => c.id,
          )}
        </PieceFrame>
      );
    }
    case 'school-feed':
      return (
        <PieceFrame
          title={label}
          summary={desk.notes.length === 0 ? t('work.notices.none', 'No announcements') : undefined}
          onOpen={onOpen}
        >
          {rows(
            desk.notes,
            (n) => (
              <Stack gap="inside">
                <Text kind="body" numberOfLines={2}>
                  {n.title}
                </Text>
                <Text kind="caption" tone="soft">
                  {n.author}
                </Text>
              </Stack>
            ),
            (n) => n.id,
          )}
        </PieceFrame>
      );
    case 'events':
      return (
        <PieceFrame
          title={label}
          summary={t('work.events.none', 'School programmes, trips and meals')}
          onOpen={onOpen}
        />
      );
    default:
      return null;
  }
}
