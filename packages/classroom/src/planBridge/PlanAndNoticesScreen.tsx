/**
 * Plan & notices (plan-and-bridge, first slice).
 * Plan an event for a grade class > write a notice > preview when it goes out
 * (school quiet hours nudge) > see scheduled and sent notices. Guardians get
 * the notice in their existing in-app notifications.
 */
import type {
  CalendarEventType,
  PlanEvent,
  PlanNotice,
} from '@repo/core/api/planBridge.orpc.contract';
import { DEFAULT_SCHOOL_TIMEZONE } from '@repo/core/logic/modes/schedule';
import { ArrowLeft, Calendar, Clock, Moon, Send, Users, WifiOff } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  eventNoticeDue,
  noticeStatusView,
  readScheduleConflict,
  schoolLocalToIso,
  suggestedNoticeTime,
  timingPrompt,
  validateNoticeDraft,
} from './noticeComposer';
import { usePlanBridge } from './usePlanBridge';

const EVENT_TYPES: CalendarEventType[] = ['event', 'exam', 'sports', 'meeting', 'holiday'];

function Card({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Box
      accessibilityLabel={label}
      className="bg-phase-surface p-5 rounded-3xl border border-phase-border gap-4"
    >
      {children}
    </Box>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <VStack className="gap-1 flex-1">
      <Text className="text-[12px] font-semibold text-phaseText-secondary">{props.label}</Text>
      <Input className="h-12 rounded-2xl bg-phase-canvas/50 border-phase-border">
        <InputField
          accessibilityLabel={props.label}
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          keyboardType={props.keyboardType}
          className="text-[15px] text-phaseText-primary"
        />
      </Input>
      {props.error ? (
        <Text accessibilityLiveRegion="polite" className="text-[12px] text-red-600">
          {props.error}
        </Text>
      ) : null}
    </VStack>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className={`px-4 py-2 rounded-full border ${selected ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-canvas border-phase-border'}`}
    >
      <Text
        className={`text-[13px] font-semibold ${selected ? 'text-white' : 'text-phaseText-primary'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Quiet({ text }: { text: string }) {
  return <Text className="text-[13px] text-phaseText-secondary leading-relaxed">{text}</Text>;
}

export default function PlanAndNoticesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useSanctuaryToast();
  const [pickedClassId, setGradeClassId] = useState<string | null>(null);
  const pb = usePlanBridge(pickedClassId);
  const gradeClassId = pb.gradeClassId;
  const tz = pb.settings.data?.timezone ?? DEFAULT_SCHOOL_TIMEZONE;
  const classes = pb.gradeClasses.data ?? [];
  const current = classes.find((c) => c.id === gradeClassId) ?? null;

  // --- plan an event -------------------------------------------------------
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('event');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('08:00');
  const [leadDays, setLeadDays] = useState('3');
  const eventStarts = schoolLocalToIso(eventDate, eventTime, tz);

  const saveEvent = async () => {
    if (!gradeClassId || !eventStarts || eventTitle.trim().length < 2) return;
    try {
      const lead = Number.parseInt(leadDays, 10);
      await pb.createEvent.mutateAsync({
        gradeClassId,
        title: eventTitle.trim(),
        type: eventType,
        startsAt: eventStarts,
        ...(Number.isFinite(lead) ? { noticeLeadDays: Math.max(0, Math.min(60, lead)) } : {}),
      });
      setEventTitle('');
      setEventDate('');
      showToast({ message: t('planBridge.event.saved', 'Event planned.'), type: 'success' });
    } catch {
      showToast({
        message: t('planBridge.event.failed', 'The event was not saved. Try again.'),
        type: 'error',
      });
    }
  };

  // --- compose a notice ----------------------------------------------------
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkedEvent, setLinkedEvent] = useState<PlanEvent | null>(null);
  const [when, setWhen] = useState<'now' | 'later'>('now');
  const [sendDate, setSendDate] = useState('');
  const [sendTime, setSendTime] = useState('07:00');
  const [urgent, setUrgent] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validateNoticeDraft>>({});
  const requestedAt = when === 'later' ? schoolLocalToIso(sendDate, sendTime, tz) : null;
  const preview = pb.preview.data;
  const prompt = useMemo(() => (preview ? timingPrompt(preview) : null), [preview]);

  const resetComposer = () => {
    setTitle('');
    setBody('');
    setLinkedEvent(null);
    setWhen('now');
    setUrgent(false);
    setOverrideReason('');
    setErrors({});
    pb.preview.reset();
  };

  const startNoticeFor = (event: PlanEvent) => {
    setLinkedEvent(event);
    setTitle(event.title);
    const suggested = suggestedNoticeTime(event, tz);
    if (suggested) {
      const local = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(suggested));
      setWhen('later');
      setSendDate(local);
      setSendTime('07:00');
    }
    pb.preview.reset();
  };

  const review = async () => {
    const draftErrors = validateNoticeDraft({ title, body, timing: 'as_requested' });
    setErrors(draftErrors);
    if (!gradeClassId || Object.keys(draftErrors).length > 0) return;
    if (when === 'later' && !requestedAt) {
      setErrors({
        body: t('planBridge.compose.badTime', 'Use YYYY-MM-DD and HH:MM for the send time.'),
      });
      return;
    }
    try {
      await pb.preview.mutateAsync({ gradeClassId, sendAt: requestedAt });
    } catch {
      showToast({
        message: t('planBridge.compose.previewFailed', 'Could not check the send time.'),
        type: 'error',
      });
    }
  };

  const send = async (timing: 'as_requested' | 'next_allowed' | 'override') => {
    if (!gradeClassId) return;
    const draftErrors = validateNoticeDraft({ title, body, timing, overrideReason });
    setErrors(draftErrors);
    if (Object.keys(draftErrors).length > 0) return;
    try {
      const notice = await pb.schedule.mutateAsync({
        gradeClassId,
        calendarEventId: linkedEvent?.id ?? null,
        title: title.trim(),
        body: body.trim(),
        sendAt: requestedAt,
        timing,
        ...(timing === 'override' ? { overrideReason: overrideReason.trim() } : {}),
      });
      showToast({ message: noticeStatusView(notice, tz).label, type: 'success' });
      resetComposer();
    } catch (error) {
      const conflict = readScheduleConflict(error);
      if (conflict) {
        // Times moved under us (e.g. quiet hours started): ask again.
        await pb.preview.mutateAsync({ gradeClassId, sendAt: requestedAt }).catch(() => undefined);
        showToast({ message: conflict.message, type: 'info' });
        return;
      }
      showToast({
        message: t('planBridge.compose.failed', 'The notice was not saved. Nothing was sent.'),
        type: 'error',
      });
    }
  };

  // --- school quiet hours (principal/admin) ---------------------------------
  // Local edits only; until the principal types, show what the server has.
  const [quietEdit, setQuietEdit] = useState<{
    start?: string;
    end?: string;
    lock?: 'locked' | 'suggested' | 'off';
  }>({});
  const savedQuiet = pb.settings.data?.good_night;
  const quietStart = quietEdit.start ?? savedQuiet?.everyday?.start ?? '';
  const quietEnd = quietEdit.end ?? savedQuiet?.everyday?.end ?? '';
  const quietLock = quietEdit.lock ?? savedQuiet?.lock ?? 'suggested';
  const setQuietStart = (start: string) => setQuietEdit((e) => ({ ...e, start }));
  const setQuietEnd = (end: string) => setQuietEdit((e) => ({ ...e, end }));
  const setQuietLock = (lock: 'locked' | 'suggested' | 'off') =>
    setQuietEdit((e) => ({ ...e, lock }));
  const saveQuietHours = async () => {
    try {
      await pb.updateQuietHours.mutateAsync({
        start: quietStart.trim(),
        end: quietEnd.trim(),
        lock: quietLock,
      });
      setQuietEdit({});
      showToast({ message: t('planBridge.quiet.saved', 'Quiet hours updated.'), type: 'success' });
    } catch {
      showToast({
        message: t('planBridge.quiet.saveFailed', 'Use HH:MM, for example 20:00 and 06:30.'),
        type: 'error',
      });
    }
  };

  // --- render --------------------------------------------------------------
  if (pb.gradeClasses.isLoading || pb.settings.isLoading) {
    return (
      <VStack className="flex-1 items-center justify-center bg-phase-canvas gap-3">
        <Spinner accessibilityLabel={t('planBridge.loading', 'Loading your classes')} />
        <Quiet text={t('planBridge.loading', 'Loading your classes')} />
      </VStack>
    );
  }

  const loadError = pb.gradeClasses.error || pb.settings.error;
  const quiet = pb.settings.data?.good_night;
  const quietLabel = quiet?.everyday
    ? `${quiet.everyday.start}–${quiet.everyday.end}`
    : t('planBridge.quiet.custom', 'custom schedule');

  return (
    <ScrollView className="flex-1 bg-phase-canvas" keyboardShouldPersistTaps="handled">
      <VStack className="gap-5 p-5 pb-16">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back', 'Back')}
          className="self-start flex-row items-center gap-2 px-3 py-2 rounded-2xl border border-phase-border"
        >
          <Icon as={ArrowLeft} size="sm" className="text-phaseText-primary" />
          <Text className="text-[13px] font-semibold text-phaseText-primary">
            {t('common.back', 'Back')}
          </Text>
        </Pressable>

        <VStack className="gap-1">
          <Heading
            accessibilityRole="header"
            className="text-[24px] font-bold text-phaseText-primary"
          >
            {t('planBridge.title', 'Plan & notices')}
          </Heading>
          <Quiet
            text={t('planBridge.subtitle', 'Plan ahead. Notices reach families at calm hours.')}
          />
          {quiet && quiet.lock !== 'off' ? (
            <HStack
              className="items-center gap-2 mt-1"
              accessibilityLabel={`School quiet hours ${quietLabel}`}
            >
              <Icon as={Moon} size="xs" className="text-phaseText-secondary" />
              <Text className="text-[12px] text-phaseText-secondary">
                {t('planBridge.quiet.banner', 'School quiet hours')}: {quietLabel} ({tz})
                {quiet.provisional
                  ? ` · ${t('planBridge.quiet.provisional', 'default, not yet set by your school')}`
                  : ''}
              </Text>
            </HStack>
          ) : null}
        </VStack>

        {pb.isOffline ? (
          <HStack
            accessibilityLiveRegion="polite"
            className="items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200"
          >
            <Icon as={WifiOff} size="sm" className="text-amber-700" />
            <Text className="text-[13px] text-amber-800 flex-1">
              {t(
                'planBridge.offline',
                'You are offline. Planning and notices need a connection; nothing is queued.',
              )}
            </Text>
          </HStack>
        ) : null}

        {loadError ? (
          <Card label="Error">
            <Quiet text={t('planBridge.loadFailed', 'Your classes could not be loaded.')} />
            <Button
              onPress={() => void pb.gradeClasses.refetch()}
              accessibilityLabel={t('common.retry', 'Try again')}
            >
              <ButtonText>{t('common.retry', 'Try again')}</ButtonText>
            </Button>
          </Card>
        ) : classes.length === 0 ? (
          <Card label="No classes">
            <Heading className="text-[16px] text-phaseText-primary">
              {t('planBridge.empty.title', 'No classes yet')}
            </Heading>
            <Quiet
              text={t(
                'planBridge.empty.body',
                'Plans and notices are for grade classes you are assigned to. Ask your principal to add you as a class teacher.',
              )}
            />
          </Card>
        ) : (
          <>
            <VStack className="gap-2">
              <Text className="text-[12px] font-semibold text-phaseText-secondary">
                {t('planBridge.class', 'Class')}
              </Text>
              <HStack accessibilityRole="radiogroup" className="flex-wrap gap-2">
                {classes.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    selected={c.id === gradeClassId}
                    onPress={() => setGradeClassId(c.id)}
                  />
                ))}
              </HStack>
              {current ? (
                <HStack
                  className="items-center gap-2"
                  accessibilityLabel={`${current.verified_guardian_count} verified guardians`}
                >
                  <Icon as={Users} size="xs" className="text-phaseText-secondary" />
                  <Text className="text-[12px] text-phaseText-secondary">
                    {current.enrolled_count} {t('planBridge.students', 'students')} ·{' '}
                    {current.verified_guardian_count}{' '}
                    {t('planBridge.verifiedGuardians', 'verified guardians')}
                  </Text>
                </HStack>
              ) : null}
            </VStack>

            {/* 1. Plan */}
            <Card label={t('planBridge.event.title', 'Plan an event')}>
              <HStack className="items-center gap-2">
                <Icon as={Calendar} size="sm" className="text-phaseText-primary" />
                <Heading className="text-[16px] text-phaseText-primary">
                  {t('planBridge.event.title', 'Plan an event')}
                </Heading>
              </HStack>
              <Field
                label={t('planBridge.event.name', 'What')}
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholder="Sports day"
              />
              <HStack accessibilityRole="radiogroup" className="flex-wrap gap-2">
                {EVENT_TYPES.map((type) => (
                  <Chip
                    key={type}
                    label={t(`planBridge.eventType.${type}`, type)}
                    selected={eventType === type}
                    onPress={() => setEventType(type)}
                  />
                ))}
              </HStack>
              <HStack className="gap-3">
                <Field
                  label={t('planBridge.date', 'Date')}
                  value={eventDate}
                  onChangeText={setEventDate}
                  placeholder="YYYY-MM-DD"
                />
                <Field
                  label={t('planBridge.time', 'Time')}
                  value={eventTime}
                  onChangeText={setEventTime}
                  placeholder="HH:MM"
                />
              </HStack>
              <Field
                label={t('planBridge.event.leadDays', 'Tell families this many days before')}
                value={leadDays}
                onChangeText={setLeadDays}
                keyboardType="numeric"
              />
              <Button
                onPress={() => void saveEvent()}
                isDisabled={
                  pb.isOffline ||
                  !eventStarts ||
                  eventTitle.trim().length < 2 ||
                  pb.createEvent.isPending
                }
                accessibilityLabel={t('planBridge.event.save', 'Save event')}
                className="self-start rounded-2xl"
              >
                <ButtonText>
                  {pb.createEvent.isPending
                    ? t('common.saving', 'Saving…')
                    : t('planBridge.event.save', 'Save event')}
                </ButtonText>
              </Button>

              {(pb.events.data ?? []).length === 0 ? (
                <Quiet text={t('planBridge.event.none', 'Nothing planned yet for this class.')} />
              ) : (
                <VStack className="gap-2">
                  {(pb.events.data ?? []).map((event) => {
                    const due = eventNoticeDue(event, tz);
                    return (
                      <HStack
                        key={event.id}
                        className="items-center justify-between gap-3 p-3 rounded-2xl bg-phase-canvas"
                      >
                        <VStack className="flex-1">
                          <Text className="text-[14px] font-semibold text-phaseText-primary">
                            {event.title}
                          </Text>
                          <Text className="text-[12px] text-phaseText-secondary">
                            {new Intl.DateTimeFormat('en-GB', {
                              timeZone: tz,
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            }).format(new Date(event.starts_at))}
                            {due
                              ? ` · ${t('planBridge.event.noticeDue', 'notice due')} ${due}`
                              : ''}
                          </Text>
                        </VStack>
                        <Pressable
                          onPress={() => startNoticeFor(event)}
                          accessibilityRole="button"
                          accessibilityLabel={`${t('planBridge.event.writeNotice', 'Write notice')}: ${event.title}`}
                          className="px-3 py-2 rounded-xl border border-phase-border"
                        >
                          <Text className="text-[12px] font-semibold text-phaseText-primary">
                            {t('planBridge.event.writeNotice', 'Write notice')}
                          </Text>
                        </Pressable>
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </Card>

            {/* 2. Compose + schedule */}
            <Card label={t('planBridge.compose.title', 'Write a notice')}>
              <HStack className="items-center gap-2">
                <Icon as={Send} size="sm" className="text-phaseText-primary" />
                <Heading className="text-[16px] text-phaseText-primary">
                  {t('planBridge.compose.title', 'Write a notice')}
                </Heading>
              </HStack>
              {linkedEvent ? (
                <Quiet text={`${t('planBridge.compose.for', 'For')}: ${linkedEvent.title}`} />
              ) : null}
              <Field
                label={t('planBridge.compose.subject', 'Title')}
                value={title}
                onChangeText={setTitle}
                error={errors.title}
              />
              <VStack className="gap-1">
                <Text className="text-[12px] font-semibold text-phaseText-secondary">
                  {t('planBridge.compose.body', 'Message')}
                </Text>
                <Textarea className="rounded-2xl bg-phase-canvas/50 border border-phase-border min-h-[110px]">
                  <TextareaInput
                    accessibilityLabel={t('planBridge.compose.body', 'Message')}
                    value={body}
                    onChangeText={setBody}
                    multiline
                    className="text-[15px] text-phaseText-primary p-3"
                  />
                </Textarea>
                {errors.body ? (
                  <Text className="text-[12px] text-red-600">{errors.body}</Text>
                ) : null}
              </VStack>
              <HStack accessibilityRole="radiogroup" className="gap-2">
                <Chip
                  label={t('planBridge.compose.now', 'As soon as allowed')}
                  selected={when === 'now'}
                  onPress={() => {
                    setWhen('now');
                    pb.preview.reset();
                  }}
                />
                <Chip
                  label={t('planBridge.compose.later', 'Pick a time')}
                  selected={when === 'later'}
                  onPress={() => {
                    setWhen('later');
                    pb.preview.reset();
                  }}
                />
              </HStack>
              {when === 'later' ? (
                <HStack className="gap-3">
                  <Field
                    label={t('planBridge.date', 'Date')}
                    value={sendDate}
                    onChangeText={(v) => {
                      setSendDate(v);
                      pb.preview.reset();
                    }}
                    placeholder="YYYY-MM-DD"
                  />
                  <Field
                    label={t('planBridge.time', 'Time')}
                    value={sendTime}
                    onChangeText={(v) => {
                      setSendTime(v);
                      pb.preview.reset();
                    }}
                    placeholder="HH:MM"
                  />
                </HStack>
              ) : null}

              {!prompt ? (
                <Button
                  onPress={() => void review()}
                  isDisabled={pb.isOffline || pb.preview.isPending}
                  accessibilityLabel={t('planBridge.compose.review', 'Check send time')}
                  className="self-start rounded-2xl"
                >
                  <ButtonText>
                    {pb.preview.isPending
                      ? t('common.checking', 'Checking…')
                      : t('planBridge.compose.review', 'Check send time')}
                  </ButtonText>
                </Button>
              ) : (
                <VStack
                  accessibilityLiveRegion="polite"
                  className="gap-3 p-4 rounded-2xl bg-phase-canvas border border-phase-border"
                >
                  <Text className="text-[13px] text-phaseText-primary">
                    {preview && preview.recipient_count > 0
                      ? `${t('planBridge.compose.goesTo', 'Goes to')} ${preview.recipient_count} ${t('planBridge.verifiedGuardians', 'verified guardians')}.`
                      : t(
                          'planBridge.compose.noRecipients',
                          'No verified guardians in this class yet. It will be saved, but no one will receive it.',
                        )}
                  </Text>
                  {prompt.kind === 'send' ? (
                    <Button
                      onPress={() => void send('as_requested')}
                      isDisabled={pb.schedule.isPending}
                      accessibilityLabel={`Send ${prompt.label}`}
                      className="self-start rounded-2xl"
                    >
                      <ButtonText>
                        {when === 'now'
                          ? t('planBridge.compose.sendNow', 'Send now')
                          : `${t('planBridge.compose.scheduleFor', 'Schedule for')} ${prompt.label}`}
                      </ButtonText>
                    </Button>
                  ) : (
                    <>
                      <HStack className="items-start gap-2">
                        <Icon as={Moon} size="sm" className="text-phaseText-secondary mt-0.5" />
                        <Text className="text-[14px] text-phaseText-primary flex-1">
                          {t('planBridge.quiet.nudge', {
                            defaultValue: 'School quiet hours are {{window}}. Send at {{when}}?',
                            window: prompt.windowLabel,
                            when: prompt.suggestedLabel,
                          })}
                        </Text>
                      </HStack>
                      <Button
                        onPress={() => void send('next_allowed')}
                        isDisabled={pb.schedule.isPending}
                        accessibilityLabel={`${t('planBridge.quiet.accept', 'Send at')} ${prompt.suggestedLabel}`}
                        className="self-start rounded-2xl"
                      >
                        <HStack className="items-center gap-2">
                          <Icon as={Clock} size="xs" className="text-white" />
                          <ButtonText>{`${t('planBridge.quiet.accept', 'Send at')} ${prompt.suggestedLabel}`}</ButtonText>
                        </HStack>
                      </Button>
                      {preview?.lock === 'suggested' ? (
                        <Button
                          variant="outline"
                          onPress={() => void send('as_requested')}
                          isDisabled={pb.schedule.isPending}
                          accessibilityLabel={t('planBridge.quiet.sendAnyway', 'Send as planned')}
                          className="self-start rounded-2xl"
                        >
                          <ButtonText>
                            {t('planBridge.quiet.sendAnyway', 'Send as planned')}
                          </ButtonText>
                        </Button>
                      ) : prompt.canOverride ? (
                        urgent ? (
                          <VStack className="gap-2">
                            <Field
                              label={t(
                                'planBridge.override.reason',
                                'Why can this not wait? (logged, seen by the principal)',
                              )}
                              value={overrideReason}
                              onChangeText={setOverrideReason}
                              error={errors.overrideReason}
                            />
                            <Button
                              action="negative"
                              variant="outline"
                              onPress={() => void send('override')}
                              isDisabled={pb.schedule.isPending}
                              accessibilityLabel={t('planBridge.override.send', 'Send now anyway')}
                              className="self-start rounded-2xl"
                            >
                              <ButtonText>
                                {t('planBridge.override.send', 'Send now anyway')}
                              </ButtonText>
                            </Button>
                          </VStack>
                        ) : (
                          <Pressable
                            onPress={() => setUrgent(true)}
                            accessibilityRole="button"
                            accessibilityLabel={t(
                              'planBridge.override.open',
                              'This is an emergency',
                            )}
                          >
                            <Text className="text-[13px] text-phaseText-secondary underline">
                              {t('planBridge.override.open', 'This is an emergency')}
                            </Text>
                          </Pressable>
                        )
                      ) : (
                        <Quiet
                          text={t(
                            'planBridge.override.ask',
                            'For an emergency, ask the principal to send it.',
                          )}
                        />
                      )}
                    </>
                  )}
                  <Pressable
                    onPress={() => pb.preview.reset()}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.edit', 'Edit')}
                  >
                    <Text className="text-[13px] text-phaseText-secondary">
                      {t('planBridge.compose.edit', 'Keep editing')}
                    </Text>
                  </Pressable>
                </VStack>
              )}
            </Card>

            {pb.settings.data?.can_edit ? (
              <Card label={t('planBridge.quiet.settings', 'School quiet hours')}>
                <HStack className="items-center gap-2">
                  <Icon as={Moon} size="sm" className="text-phaseText-primary" />
                  <Heading className="text-[16px] text-phaseText-primary">
                    {t('planBridge.quiet.settings', 'School quiet hours')}
                  </Heading>
                </HStack>
                <Quiet
                  text={t(
                    'planBridge.quiet.explain',
                    'Staff notices written in these hours wait until the morning. Families still see them in the app; nothing rings at night.',
                  )}
                />
                <HStack accessibilityRole="radiogroup" className="flex-wrap gap-2">
                  <Chip
                    label={t('planBridge.lock.suggested', 'Suggest (staff decide)')}
                    selected={quietLock === 'suggested'}
                    onPress={() => setQuietLock('suggested')}
                  />
                  <Chip
                    label={t('planBridge.lock.locked', 'Hold until morning')}
                    selected={quietLock === 'locked'}
                    onPress={() => setQuietLock('locked')}
                  />
                  <Chip
                    label={t('planBridge.lock.off', 'Off')}
                    selected={quietLock === 'off'}
                    onPress={() => setQuietLock('off')}
                  />
                </HStack>
                <HStack className="gap-3">
                  <Field
                    label={t('planBridge.quiet.from', 'From')}
                    value={quietStart}
                    onChangeText={setQuietStart}
                    placeholder="20:00"
                  />
                  <Field
                    label={t('planBridge.quiet.to', 'Until')}
                    value={quietEnd}
                    onChangeText={setQuietEnd}
                    placeholder="06:30"
                  />
                </HStack>
                <Button
                  onPress={() => void saveQuietHours()}
                  isDisabled={pb.isOffline || pb.updateQuietHours.isPending}
                  accessibilityLabel={t('planBridge.quiet.save', 'Save quiet hours')}
                  className="self-start rounded-2xl"
                >
                  <ButtonText>{t('planBridge.quiet.save', 'Save quiet hours')}</ButtonText>
                </Button>
              </Card>
            ) : null}

            {/* 3. Scheduled and sent */}
            <Card label={t('planBridge.list.title', 'Notices')}>
              <Heading className="text-[16px] text-phaseText-primary">
                {t('planBridge.list.title', 'Notices')}
              </Heading>
              {pb.notices.isLoading ? (
                <Spinner accessibilityLabel={t('planBridge.list.loading', 'Loading notices')} />
              ) : pb.notices.error ? (
                <Quiet text={t('planBridge.list.failed', 'Notices could not be loaded.')} />
              ) : (pb.notices.data ?? []).length === 0 ? (
                <Quiet text={t('planBridge.list.empty', 'No notices for this class yet.')} />
              ) : (
                (pb.notices.data ?? []).map((notice: PlanNotice) => {
                  const status = noticeStatusView(notice, tz);
                  return (
                    <HStack
                      key={notice.id}
                      accessibilityLabel={`${notice.title}. ${status.a11y}`}
                      className="items-center justify-between gap-3 p-3 rounded-2xl bg-phase-canvas"
                    >
                      <VStack className="flex-1">
                        <Text className="text-[14px] font-semibold text-phaseText-primary">
                          {notice.title}
                        </Text>
                        <Text
                          className={`text-[12px] ${status.tone === 'problem' ? 'text-red-600' : 'text-phaseText-secondary'}`}
                        >
                          {status.label}
                        </Text>
                      </VStack>
                      {notice.status === 'scheduled' ? (
                        <Pressable
                          onPress={() =>
                            void pb.cancel.mutateAsync(notice.id).catch(() =>
                              showToast({
                                message: t('planBridge.list.cancelFailed', 'Could not cancel.'),
                                type: 'error',
                              }),
                            )
                          }
                          accessibilityRole="button"
                          accessibilityLabel={`${t('planBridge.list.cancel', 'Cancel')}: ${notice.title}`}
                          className="px-3 py-2 rounded-xl border border-phase-border"
                        >
                          <Text className="text-[12px] text-phaseText-primary">
                            {t('planBridge.list.cancel', 'Cancel')}
                          </Text>
                        </Pressable>
                      ) : null}
                    </HStack>
                  );
                })
              )}
            </Card>
          </>
        )}
      </VStack>
    </ScrollView>
  );
}
