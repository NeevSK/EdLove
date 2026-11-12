import type { StudentDesk } from '@repo/classroom/deskPort';
import { Progress, Row, Stack, Text } from '@repo/ui/components/native';
import type { ReactNode } from 'react';
import { dueText, type PieceContext, rows } from './common';
import { PieceFrame } from './PieceFrame';

/** Draws one piece of a student's work room. Unknown ids return null. */
export function studentPiece(
  id: string,
  label: string,
  desk: StudentDesk,
  ctx: PieceContext,
): ReactNode {
  const { t, locale } = ctx;
  const onOpen = ctx.canOpen(id) ? () => ctx.open?.(id) : undefined;
  switch (id) {
    case 'homework': {
      const n = desk.homework.length;
      return (
        <PieceFrame
          title={label}
          badge={
            n > 0
              ? { label: t('work.homework.count', '{{n}} to do', { n }), attention: true }
              : undefined
          }
          summary={n === 0 ? t('work.homework.none', 'Nothing due. Well done.') : undefined}
          onOpen={onOpen}
        >
          {rows(
            desk.homework,
            (a) => {
              const when = dueText(a.dueAt, locale);
              return (
                <Row
                  label={a.title}
                  detail={a.className}
                  note={when ? t('work.due', 'Due {{when}}', { when }) : undefined}
                />
              );
            },
            (a) => a.id,
          )}
        </PieceFrame>
      );
    }
    case 'next-class': {
      const next = desk.lessons[0];
      return (
        <PieceFrame
          title={label}
          summary={next ? next.className : t('work.nextClass.none', 'No classes today')}
          onOpen={onOpen}
        >
          {next ? <Text kind="title">{next.title}</Text> : null}
        </PieceFrame>
      );
    }
    case 'subjects':
      return (
        <PieceFrame
          title={label}
          summary={t('work.subjects.count', '{{n}} subjects', { n: desk.classes.length })}
          onOpen={onOpen}
        >
          {rows(
            desk.classes,
            (c) => (
              <Row label={c.subject || c.name} detail={c.name} />
            ),
            (c) => c.id,
          )}
        </PieceFrame>
      );
    case 'library':
      return (
        <PieceFrame
          title={label}
          summary={t('work.library.count', '{{n}} things on the shelf', { n: desk.shelfCount })}
          onOpen={onOpen}
        />
      );
    case 'quizzes':
      return (
        <PieceFrame
          title={label}
          summary={t('work.quizzes.none', 'Quizzes from your teachers will appear here')}
          onOpen={onOpen}
        />
      );
    case 'flashcards':
      return (
        <PieceFrame
          title={label}
          summary={
            desk.goals.length > 0
              ? t('work.goals.count', '{{n}} study goals', { n: desk.goals.length })
              : t('work.flashcards.none', 'Make cards from any lesson to practise')
          }
          onOpen={onOpen}
        >
          {rows(
            desk.goals,
            (g) => (
              <Stack gap="inside">
                <Text kind="body" numberOfLines={2}>
                  {g.text}
                </Text>
                <Progress value={g.progress} label={g.text} />
              </Stack>
            ),
            (g) => g.id,
          )}
        </PieceFrame>
      );
    case 'results':
      return (
        <PieceFrame
          title={label}
          summary={desk.grades.length === 0 ? t('work.results.none', 'No marks yet') : undefined}
          onOpen={onOpen}
        >
          {rows(
            [...desk.grades].sort((a, b) => b.at.localeCompare(a.at)),
            (g) => (
              <Row label={g.title} detail={g.className} note={String(g.score)} />
            ),
            (g) => g.id,
          )}
        </PieceFrame>
      );
    case 'exams':
      return (
        <PieceFrame
          title={label}
          summary={t(
            'work.exams.none',
            'No exams set yet. Dates appear here when your school sets them.',
          )}
          onOpen={onOpen}
        />
      );
    default:
      return null;
  }
}
