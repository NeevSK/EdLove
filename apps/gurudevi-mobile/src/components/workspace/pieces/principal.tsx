import type { PrincipalDesk } from '@repo/classroom/deskPort';
import { Inline, MiniChart, Progress, Row, Stack, Text } from '@repo/ui/components/native';
import type { ReactNode } from 'react';
import { type PieceContext, percent, rows } from './common';
import { PieceFrame } from './PieceFrame';

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <Stack gap="none" accessible accessibilityLabel={`${value} ${label}`}>
      <Text kind="value">{value}</Text>
      <Text kind="caption" tone="soft">
        {label}
      </Text>
    </Stack>
  );
}

/** Draws one piece of a principal's school room. Unknown ids return null. */
export function principalPiece(
  id: string,
  label: string,
  desk: PrincipalDesk,
  ctx: PieceContext,
): ReactNode {
  const { t, locale } = ctx;
  const onOpen = ctx.canOpen(id) ? () => ctx.open?.(id) : undefined;
  const nf = new Intl.NumberFormat(locale);

  switch (id) {
    case 'staff-absence': {
      const away = desk.staff.absent + desk.staff.onLeave;
      return (
        <PieceFrame
          title={label}
          badge={
            away > 0
              ? { label: t('work.staff.away', '{{n}} away', { n: away }), attention: true }
              : undefined
          }
          summary={t('work.staff.summary', '{{present}} of {{total}} staff in today', {
            present: desk.staff.present,
            total: desk.staff.total,
          })}
          onOpen={onOpen}
        >
          <Progress
            value={desk.staff.total ? desk.staff.present / desk.staff.total : 0}
            label={t('work.staff.in', 'Staff in today')}
          />
        </PieceFrame>
      );
    }
    case 'approvals': {
      const n = desk.leaves.length;
      return (
        <PieceFrame
          title={label}
          badge={
            n > 0
              ? { label: t('work.approvals.count', '{{n}} to decide', { n }), attention: true }
              : undefined
          }
          summary={n === 0 ? t('work.approvals.none', 'Nothing waiting for you') : undefined}
          onOpen={onOpen}
        >
          {rows(
            desk.leaves,
            (l) => (
              <Row
                label={l.name}
                detail={t('work.approvals.leave', '{{kind}} leave, {{when}}', {
                  kind: l.kind,
                  when: l.when,
                })}
                note={t('work.approvals.cover', 'Cover: {{name}}', { name: l.cover })}
              />
            ),
            (l) => l.id,
          )}
        </PieceFrame>
      );
    }
    case 'today-events':
      return (
        <PieceFrame
          title={label}
          summary={t('work.todayEvents.none', 'Nothing on the school calendar today')}
          onOpen={onOpen}
        />
      );
    case 'numbers': {
      const [before, now] = [desk.attendanceTrend.at(-2), desk.attendanceTrend.at(-1)];
      const trend =
        before !== undefined && now !== undefined
          ? t('work.numbers.trend', 'Student attendance {{now}} today, {{before}} yesterday', {
              now: percent(now, locale),
              before: percent(before, locale),
            })
          : null;
      return (
        <PieceFrame title={label} onOpen={onOpen}>
          <Inline gap="between">
            <Figure
              value={nf.format(desk.numbers.students)}
              label={t('work.numbers.students', 'students')}
            />
            <Figure
              value={nf.format(desk.numbers.teachers)}
              label={t('work.numbers.teachers', 'teachers')}
            />
            <Figure
              value={nf.format(desk.numbers.classes)}
              label={t('work.numbers.classes', 'classes')}
            />
            <Figure
              value={percent(desk.numbers.attendance, locale)}
              label={t('work.numbers.attendance', 'attendance')}
            />
          </Inline>
          {trend ? (
            <Inline gap="inside" align="center">
              <MiniChart values={desk.attendanceTrend} kind="bars" summary={trend} range={[0, 1]} />
              <Text kind="caption" tone="soft" style={{ flex: 1 }}>
                {trend}
              </Text>
            </Inline>
          ) : null}
        </PieceFrame>
      );
    }
    case 'reports': {
      const behind = desk.pace.filter((p) => p.pace === 'lagging');
      return (
        <PieceFrame
          title={label}
          badge={
            behind.length > 0
              ? {
                  label: t('work.reports.behind', '{{n}} behind', { n: behind.length }),
                  attention: true,
                }
              : undefined
          }
          summary={t('work.reports.summary', 'Syllabus covered this term')}
          onOpen={onOpen}
        >
          {rows(
            [...desk.pace].sort((a, b) => a.done - b.done),
            (p) => (
              <Stack gap="inside">
                <Row label={p.subject} detail={p.grade} note={percent(p.done, locale)} />
                <Progress value={p.done} label={`${p.grade} ${p.subject}`} />
              </Stack>
            ),
            (p) => `${p.grade}-${p.subject}`,
          )}
        </PieceFrame>
      );
    }
    case 'sections':
      return (
        <PieceFrame
          title={label}
          summary={t('work.sections.count', '{{n}} sections, {{c}} classes', {
            n: desk.numbers.sections,
            c: desk.numbers.classes,
          })}
          onOpen={onOpen}
        />
      );
    case 'term-plan':
      return (
        <PieceFrame
          title={label}
          summary={t('work.termPlan.none', 'No term plan yet. It appears here once one is set.')}
          onOpen={onOpen}
        />
      );
    default:
      return null;
  }
}
