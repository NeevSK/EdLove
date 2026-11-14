import { Button, Icon, Inline, Stack, Surface, Text } from '@repo/ui/components/native';
import { BookOpen, CircleCheck, Clock, MapPin, Sparkles } from '@repo/ui/icons';
import type React from 'react';
import {
  type PeriodSlotInput,
  useTeacherPeriodDispatcher,
} from '../../hooks/useTeacherPeriodDispatcher';

export interface TeacherActivePeriodCardProps {
  customPeriods?: PeriodSlotInput[];
  onTakeAttendance?: (classroomId?: string, className?: string) => void;
  onOpenClassroom?: (classroomId?: string, className?: string) => void;
}

/** The teacher's place in the day's timetable: now, the interval, before school, or done. */
export const TeacherActivePeriodCard: React.FC<TeacherActivePeriodCardProps> = ({
  customPeriods,
  onTakeAttendance,
  onOpenClassroom,
}) => {
  const { status, currentSlot, nextSlot, isLoading } = useTeacherPeriodDispatcher({
    customPeriods,
  });

  if (isLoading) {
    return (
      <Surface tone="raised">
        <Inline gap="inside">
          <Icon icon={Clock} tone="faint" />
          <Text kind="caption" tone="soft">
            Reading timetable rhythm...
          </Text>
        </Inline>
      </Surface>
    );
  }

  // In a period: the one lit moment of the day.
  if (status === 'in_period' && currentSlot) {
    return (
      <Surface tone="raised">
        <Stack gap="group">
          <Inline justify="between">
            <Text kind="label" tone="lamp">
              Active Period Dispatch
            </Text>
            <Inline gap="inside">
              <Icon icon={Clock} size="sm" tone="soft" />
              <Text kind="caption">{currentSlot.remainingMinutes}m remaining</Text>
            </Inline>
          </Inline>

          <Stack gap="inside">
            <Text kind="title" accessibilityRole="header">
              Period {currentSlot.periodNumber} • {currentSlot.subject}
            </Text>
            <Inline gap="between">
              <Inline gap="inside">
                <Icon icon={BookOpen} size="sm" tone="faint" />
                <Text kind="caption" tone="soft">
                  {currentSlot.className}
                </Text>
              </Inline>
              <Inline gap="inside">
                <Icon icon={MapPin} size="sm" tone="faint" />
                <Text kind="caption" tone="soft">
                  {currentSlot.roomVenue || 'Room Venue'}
                </Text>
              </Inline>
            </Inline>
          </Stack>

          <Inline gap="between">
            <Button
              label="Mark Roll Call"
              icon={CircleCheck}
              onPress={() => onTakeAttendance?.(currentSlot.classroomId, currentSlot.className)}
            />
            {onOpenClassroom ? (
              <Button
                label="Open"
                variant="secondary"
                onPress={() => onOpenClassroom(currentSlot.classroomId, currentSlot.className)}
              />
            ) : null}
          </Inline>

          {nextSlot ? (
            <Inline justify="between">
              <Text kind="label" tone="faint">
                Next Up
              </Text>
              <Text kind="caption" tone="soft">
                Period {nextSlot.periodNumber}: {nextSlot.subject} ({nextSlot.className})
              </Text>
            </Inline>
          ) : null}
        </Stack>
      </Surface>
    );
  }

  if (status === 'interval' && nextSlot) {
    return (
      <Surface tone="raised">
        <Inline justify="between" wrap={false}>
          <Stack gap="inside" style={{ flex: 1 }}>
            <Text kind="label" tone="soft">
              Recess / Interval
            </Text>
            <Text kind="title" accessibilityRole="header">
              Next: Period {nextSlot.periodNumber} • {nextSlot.subject}
            </Text>
            <Text kind="caption" tone="soft">
              {nextSlot.className} in {nextSlot.roomVenue || 'Scheduled Venue'}
            </Text>
          </Stack>
          <Stack gap="none" align="center">
            <Text kind="label" tone="faint">
              Starts in
            </Text>
            <Text kind="value" tone="lamp">
              {nextSlot.startsInMinutes}m
            </Text>
          </Stack>
        </Inline>
      </Surface>
    );
  }

  if (status === 'before_school' && nextSlot) {
    return (
      <Surface tone="raised">
        <Stack gap="inside">
          <Inline gap="inside">
            <Icon icon={Sparkles} size="sm" tone="lamp" />
            <Text kind="label" tone="faint">
              Morning Preparation
            </Text>
          </Inline>
          <Text kind="title" accessibilityRole="header">
            First Period: {nextSlot.subject} ({nextSlot.className})
          </Text>
          <Text kind="caption" tone="soft">
            Period 1 starts at {nextSlot.startTime} (in {nextSlot.startsInMinutes} minutes)
          </Text>
        </Stack>
      </Surface>
    );
  }

  return (
    <Surface tone="raised">
      <Inline justify="between" wrap={false}>
        <Stack gap="none">
          <Text kind="label" tone="faint">
            Timetable Rhythm
          </Text>
          <Text kind="body">
            {status === 'after_school'
              ? 'Day complete — all periods delivered'
              : 'Open study & preparation time'}
          </Text>
        </Stack>
        <Icon icon={Clock} tone="faint" />
      </Inline>
    </Surface>
  );
};
