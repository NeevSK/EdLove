import {
  type DeskRoll,
  deskCounts,
  nextLessonOf,
  type TeacherDesk,
} from '@repo/classroom/deskPort';
import { Divider, Row, Stack, Text } from '@repo/ui/components/native';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { PieceFrame } from './PieceFrame';

export interface PieceContext {
  t: TFunction;
  /** The person's language, for dates. */
  locale: string;
  /** Opens a piece's own screen when it has one. */
  open?: (pieceId: string) => void;
  /** Whether a piece has a screen to open yet. */
  canOpen: (pieceId: string) => boolean;
}

const MAX_ROWS = 3;

export function dueText(iso: string | null, locale: string, now = Date.now()): string | null {
  if (!iso) return null;
  const days = Math.round((new Date(iso).getTime() - now) / 86_400_000);
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day');
}

function rollLine(r: DeskRoll, t: TFunction): string {
  if (!r.taken) return t('work.roll.notTaken', 'Not taken yet');
  const parts = [t('work.roll.present', '{{n}} present', { n: r.present })];
  if (r.late) parts.push(t('work.roll.late', '{{n}} late', { n: r.late }));
  if (r.absent) parts.push(t('work.roll.absent', '{{n}} absent', { n: r.absent }));
  if (r.excused) parts.push(t('work.roll.excused', '{{n}} excused', { n: r.excused }));
  return parts.join(', ');
}

function rows<T>(items: readonly T[], draw: (item: T) => ReactNode, key: (item: T) => string) {
  return (
    <View>
      {items.slice(0, MAX_ROWS).map((it, i) => (
        <View key={key(it)}>
          {i > 0 ? <Divider /> : null}
          {draw(it)}
        </View>
      ))}
    </View>
  );
}

/**
 * Draws one piece of a teacher's work room from the desk. Each piece says the
 * one thing it is for at a glance, and opens its own screen once that exists.
 * Unknown ids return null so the floor can fall back to a plain card.
 */
export function teacherPiece(
  id: string,
  label: string,
  desk: TeacherDesk,
  ctx: PieceContext,
): ReactNode {
  const { t, locale } = ctx;
  const onOpen = ctx.canOpen(id) ? () => ctx.open?.(id) : undefined;
  const counts = deskCounts(desk);

  switch (id) {
    case 'attendance': {
      const left = counts.rollsToTake;
      return (
        <PieceFrame
          title={label}
          badge={
            left > 0
              ? { label: t('work.roll.toTake', '{{n}} to take', { n: left }), attention: true }
              : undefined
          }
          summary={
            desk.roll.length === 0
              ? t('work.roll.none', 'No classes yet')
              : left === 0
                ? t('work.roll.allTaken', "Every class's roll is taken")
                : undefined
          }
          onOpen={onOpen}
        >
          {rows(
            [...desk.roll].sort((a, b) => Number(a.taken) - Number(b.taken)),
            (r) => (
              <Row label={r.className} detail={rollLine(r, t)} signal={!r.taken} />
            ),
            (r) => r.classId,
          )}
        </PieceFrame>
      );
    }
    case 'marking': {
      const n = counts.waitingToMark;
      return (
        <PieceFrame
          title={label}
          badge={
            n > 0
              ? { label: t('work.marking.waiting', '{{n}} waiting', { n }), attention: true }
              : undefined
          }
          summary={n === 0 ? t('work.marking.none', 'Nothing waiting to be marked') : undefined}
          onOpen={onOpen}
        >
          {n > 0
            ? rows(
                desk.marking,
                (m) => (
                  <Row
                    label={m.title}
                    detail={m.className}
                    note={t('work.marking.handedIn', '{{n}} handed in', { n: m.waiting })}
                  />
                ),
                (m) => m.assignmentId,
              )
            : null}
        </PieceFrame>
      );
    }
    case 'next-lesson': {
      const next = nextLessonOf(desk);
      return (
        <PieceFrame
          title={label}
          summary={next ? next.className : t('work.lesson.none', 'No lessons planned yet')}
          onOpen={onOpen}
        >
          {next ? <Text kind="title">{next.title}</Text> : null}
        </PieceFrame>
      );
    }
    case 'classes':
      return (
        <PieceFrame
          title={label}
          summary={t('work.classes.count', '{{n}} classes', { n: desk.classes.length })}
          onOpen={onOpen}
        >
          {rows(
            desk.classes,
            (c) => (
              <Row
                label={c.name}
                detail={c.subject}
                note={t('work.classes.students', '{{n}} students', { n: c.students })}
              />
            ),
            (c) => c.id,
          )}
        </PieceFrame>
      );
    case 'lessons':
      return (
        <PieceFrame
          title={label}
          summary={t('work.lessons.count', '{{n}} lessons', { n: desk.lessons.length })}
          onOpen={onOpen}
        >
          {rows(
            desk.lessons,
            (l) => (
              <Row label={l.title} detail={l.className} />
            ),
            (l) => l.id,
          )}
        </PieceFrame>
      );
    case 'assignments': {
      const soon = [...desk.assignments].sort((a, b) =>
        (a.dueAt ?? '~').localeCompare(b.dueAt ?? '~'),
      );
      return (
        <PieceFrame
          title={label}
          summary={soon.length === 0 ? t('work.assignments.none', 'No assignments set') : undefined}
          onOpen={onOpen}
        >
          {rows(
            soon,
            (a) => (
              <Row
                label={a.title}
                detail={a.className}
                note={
                  dueText(a.dueAt, locale)
                    ? t('work.due', 'Due {{when}}', { when: dueText(a.dueAt, locale) })
                    : undefined
                }
              />
            ),
            (a) => a.id,
          )}
        </PieceFrame>
      );
    }
    case 'notes': {
      const notes = [...desk.notes].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at),
      );
      return (
        <PieceFrame
          title={label}
          summary={notes.length === 0 ? t('work.notes.none', 'No notes yet') : undefined}
          onOpen={onOpen}
        >
          {rows(
            notes,
            (n) => (
              <Stack gap="inside">
                <Text kind="body" numberOfLines={2}>
                  {n.text}
                </Text>
                <Text kind="caption" tone="soft">
                  {n.className}
                </Text>
              </Stack>
            ),
            (n) => n.id,
          )}
        </PieceFrame>
      );
    }
    case 'messages': {
      const unread = counts.unread;
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
            [...desk.conversations].sort((a, b) => b.unread - a.unread || b.at.localeCompare(a.at)),
            (c) => (
              <Row label={c.name} detail={c.last} signal={c.unread > 0} />
            ),
            (c) => c.id,
          )}
        </PieceFrame>
      );
    }
    case 'announcements': {
      const notices = [...desk.notices].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at),
      );
      return (
        <PieceFrame
          title={label}
          summary={notices.length === 0 ? t('work.notices.none', 'No announcements') : undefined}
          onOpen={onOpen}
        >
          {rows(
            notices,
            (n) => (
              <Stack gap="inside">
                <Text kind="body" numberOfLines={3}>
                  {n.text}
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
    }
    case 'timetable':
      return (
        <PieceFrame
          title={label}
          summary={t(
            'work.timetable.none',
            "No timetable yet. It appears here once your school's is set.",
          )}
          onOpen={onOpen}
        />
      );
    case 'events':
      return (
        <PieceFrame
          title={label}
          summary={
            desk.events ? undefined : t('work.events.none', 'School programmes, trips and meals')
          }
          onOpen={onOpen}
        />
      );
    case 'question-bank':
      return (
        <PieceFrame
          title={label}
          summary={t('work.questions.none', 'Your saved questions will gather here')}
          onOpen={onOpen}
        />
      );
    default:
      return null;
  }
}
