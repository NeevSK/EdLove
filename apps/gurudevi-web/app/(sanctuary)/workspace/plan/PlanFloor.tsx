'use client';

import { planBridgeAPI } from '@repo/core/api/planBridge';
import {
  type CalendarEventType,
  type PlanEvent,
  type PlanGradeClass,
  type PlanNotice,
  type PlanSettings,
  type SchedulePreview,
} from '@repo/core/api/planBridge.orpc.contract';
import {
  MIN_OVERRIDE_REASON,
  noticeStatusView,
  readScheduleConflict,
  schoolLocalToIso,
  validateNoticeDraft,
} from '@repo/core/logic/modes/noticeComposer';
import { DEFAULT_SCHOOL_TIMEZONE } from '@repo/core/logic/modes/schedule';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './plan.module.css';

interface PlanFloorProps {
  initialCapacity?: string | null;
  displayName: string;
}

const EVENT_TYPES: CalendarEventType[] = ['event', 'exam', 'sports', 'meeting', 'holiday'];

export function PlanFloor({ initialCapacity, displayName }: Readonly<PlanFloorProps>) {
  const [gradeClasses, setGradeClasses] = useState<PlanGradeClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [settings, setSettings] = useState<PlanSettings | null>(null);
  const [events, setEvents] = useState<PlanEvent[]>([]);
  const [notices, setNotices] = useState<PlanNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notice Composer State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [sendDate, setSendDate] = useState('');
  const [sendTime, setSendTime] = useState('');
  const [preview, setPreview] = useState<SchedulePreview | null>(null);
  const [isOverride, setIsOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [noticeSuccess, setNoticeSuccess] = useState<string | null>(null);

  // Event Planner State
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('event');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventLeadDays, setEventLeadDays] = useState(3);
  const [eventDescription, setEventDescription] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  const [refreshIndex, setRefreshIndex] = useState(0);
  const [initIndex, setInitIndex] = useState(0);

  const reloadClassData = useCallback(() => {
    setRefreshIndex((v) => v + 1);
  }, []);

  const reloadInitial = useCallback(() => {
    setIsLoading(true);
    setInitIndex((v) => v + 1);
  }, []);

  const selectedClass =
    gradeClasses.find((c) => c.id === selectedClassId) ?? gradeClasses[0] ?? null;

  // Load Grade Classes & School Calm Settings
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [classes, s] = await Promise.all([
          planBridgeAPI.listMyGradeClasses(),
          planBridgeAPI.getSettings(),
        ]);
        if (!active) return;
        setError(null);
        setGradeClasses(classes);
        setSettings(s);
        const firstClass = classes[0];
        if (firstClass && !selectedClassId) {
          setSelectedClassId(firstClass.id);
        }
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Could not load plan workspace.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [selectedClassId, initIndex]);

  // Load Events & Notices for Selected Grade Class
  useEffect(() => {
    const classId = selectedClass?.id;
    if (!classId) return;
    let active = true;
    async function fetchClassData() {
      try {
        const [evts, nots] = await Promise.all([
          planBridgeAPI.listEvents({ gradeClassId: classId }),
          planBridgeAPI.listNotices({ gradeClassId: classId }),
        ]);
        if (!active) return;
        setEvents(evts);
        setNotices(nots);
      } catch (err: any) {
        console.warn('Could not refresh class events/notices:', err);
      }
    }
    void fetchClassData();
    return () => {
      active = false;
    };
  }, [selectedClass?.id, refreshIndex]);

  // Preview Notice Schedule
  useEffect(() => {
    if (!selectedClass?.id) return;
    const tz = settings?.timezone ?? DEFAULT_SCHOOL_TIMEZONE;
    const isoSendAt = sendDate && sendTime ? schoolLocalToIso(sendDate, sendTime, tz) : null;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const p = await planBridgeAPI.previewNotice({
          gradeClassId: selectedClass.id,
          sendAt: isoSendAt,
        });
        if (!cancelled) setPreview(p);
      } catch {
        if (!cancelled) setPreview(null);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedClass?.id, sendDate, sendTime, settings?.timezone]);

  // Handle Schedule Notice
  const handleScheduleNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass?.id) return;
    setNoticeError(null);
    setNoticeSuccess(null);

    const timing = isOverride
      ? 'override'
      : preview?.in_quiet_hours
        ? 'next_allowed'
        : 'as_requested';

    const errors = validateNoticeDraft({
      title: noticeTitle,
      body: noticeBody,
      timing,
      overrideReason: isOverride ? overrideReason : undefined,
    });

    if (errors.title || errors.body || errors.overrideReason) {
      setNoticeError(
        errors.title ||
          errors.body ||
          errors.overrideReason ||
          'Please complete all required fields.',
      );
      return;
    }

    const tz = settings?.timezone ?? DEFAULT_SCHOOL_TIMEZONE;
    const isoSendAt = sendDate && sendTime ? schoolLocalToIso(sendDate, sendTime, tz) : null;

    setIsSubmittingNotice(true);
    try {
      await planBridgeAPI.scheduleNotice({
        gradeClassId: selectedClass.id,
        title: noticeTitle.trim(),
        body: noticeBody.trim(),
        sendAt: isoSendAt,
        timing,
        overrideReason: isOverride ? overrideReason.trim() : undefined,
      });

      setNoticeSuccess('Notice scheduled successfully.');
      setNoticeTitle('');
      setNoticeBody('');
      setSendDate('');
      setSendTime('');
      setIsOverride(false);
      setOverrideReason('');
      reloadClassData();
    } catch (err: any) {
      const conflict = readScheduleConflict(err);
      if (conflict) {
        setNoticeError(
          `${conflict.message} Suggested delivery: ${conflict.nextAllowedLabel || 'after quiet hours'}.`,
        );
      } else {
        setNoticeError(err?.message || 'Failed to schedule notice.');
      }
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  // Handle Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass?.id) return;
    setEventError(null);

    if (!eventTitle.trim()) {
      setEventError('Add an event title.');
      return;
    }
    if (!eventStartDate) {
      setEventError('Select an event date.');
      return;
    }

    const tz = settings?.timezone ?? DEFAULT_SCHOOL_TIMEZONE;
    const isoStart = schoolLocalToIso(eventStartDate, eventStartTime || '09:00', tz);
    if (!isoStart) {
      setEventError('Invalid start date or time.');
      return;
    }

    setIsCreatingEvent(true);
    try {
      await planBridgeAPI.createEvent({
        gradeClassId: selectedClass.id,
        title: eventTitle.trim(),
        type: eventType,
        startsAt: isoStart,
        noticeLeadDays: eventLeadDays,
        description: eventDescription.trim() || undefined,
      });

      setEventTitle('');
      setEventStartDate('');
      setEventDescription('');
      reloadClassData();
    } catch (err: any) {
      setEventError(err?.message || 'Failed to create event.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Handle Cancel Notice
  const handleCancelNotice = async (noticeId: string) => {
    try {
      await planBridgeAPI.cancelNotice(noticeId);
      reloadClassData();
    } catch (err: any) {
      alert(err?.message || 'Could not cancel notice.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Loading plan & calm communications workspace…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBanner}>
          {error}
          <div style={{ marginTop: '0.75rem' }}>
            <button className={styles.secondaryBtn} onClick={reloadInitial} type="button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tz = settings?.timezone ?? DEFAULT_SCHOOL_TIMEZONE;

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1>Plan & Calm Notices</h1>
          <p>
            Plan grade class calendar events, compose calm notices, and preview peaceful quiet-hours
            release for families.
          </p>
        </div>

        {gradeClasses.length > 0 ? (
          <div className={styles.classSelectorArea}>
            <label htmlFor="grade-class-select" className={styles.label}>
              Grade Class:
            </label>
            <select
              id="grade-class-select"
              className={styles.classSelect}
              value={selectedClass?.id ?? ''}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {gradeClasses.map((gc) => (
                <option key={gc.id} value={gc.id}>
                  {gc.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </header>

      {/* Class & Policy Stats Banner */}
      <div className={styles.metaGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Enrolled Students</span>
          <span className={styles.statValue}>{selectedClass?.enrolled_count ?? 0}</span>
          <span className={styles.statSub}>Active in {selectedClass?.name ?? 'Grade Class'}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Verified Guardians</span>
          <span className={styles.statValue}>{selectedClass?.verified_guardian_count ?? 0}</span>
          <span className={styles.statSub}>Direct in-app notification recipients</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Quiet Hours Window</span>
          <span className={styles.statValue}>
            {settings?.good_night.everyday
              ? `${settings.good_night.everyday.start} – ${settings.good_night.everyday.end}`
              : '20:00 – 06:30'}
          </span>
          <span className={styles.statSub}>
            Lock mode: {settings?.good_night.lock ?? 'suggested'} ({tz})
          </span>
        </div>
      </div>

      <div className={styles.contentLayout}>
        {/* Left Column: Notice Composer & Event Planner */}
        <div className={styles.panelStack}>
          {/* Notice Composer Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Write Class Notice</h2>
                <p className={styles.cardSubtitle}>
                  Calm communication releases when families are awake, respecting sleep and family
                  rest.
                </p>
              </div>
            </div>

            {noticeError ? <div className={styles.errorBanner}>{noticeError}</div> : null}
            {noticeSuccess ? (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '0.5rem',
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  color: '#166534',
                  fontSize: '0.85rem',
                }}
              >
                {noticeSuccess}
              </div>
            ) : null}

            <form
              onSubmit={handleScheduleNotice}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="notice-title">
                  Notice Title *
                </label>
                <input
                  id="notice-title"
                  className={styles.input}
                  placeholder="e.g. Science field trip permission slip"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  maxLength={140}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="notice-body">
                  Notice Content *
                </label>
                <textarea
                  id="notice-body"
                  className={styles.textarea}
                  placeholder="Share details clearly and concisely for guardians..."
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  maxLength={2000}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="notice-date">
                    Desired Delivery Date (Optional)
                  </label>
                  <input
                    id="notice-date"
                    type="date"
                    className={styles.input}
                    value={sendDate}
                    onChange={(e) => setSendDate(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="notice-time">
                    Delivery Time (Optional)
                  </label>
                  <input
                    id="notice-time"
                    type="time"
                    className={styles.input}
                    value={sendTime}
                    onChange={(e) => setSendTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Live Quiet Hours Preview */}
              {preview?.in_quiet_hours ? (
                <div className={styles.calmBanner}>
                  <div className={styles.calmBannerTitle}>
                    <span>🌙</span> School Quiet Hours Active
                  </div>
                  <p className={styles.calmBannerText}>
                    This notice would arrive during quiet hours (
                    {preview.window ? `${preview.window.start} – ${preview.window.end}` : 'evening'}
                    ). It will be gently held and delivered at{' '}
                    <strong>{preview.suggested_label}</strong>.
                  </p>

                  {preview.can_override ? (
                    <div className={styles.overrideBox}>
                      <label className={styles.overrideCheckbox}>
                        <input
                          type="checkbox"
                          checked={isOverride}
                          onChange={(e) => setIsOverride(e.target.checked)}
                        />
                        Emergency Override (Instant Release)
                      </label>
                      {isOverride ? (
                        <div className={styles.formGroup}>
                          <input
                            className={styles.input}
                            placeholder="Mandatory justification (min 10 characters, logged)..."
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            minLength={MIN_OVERRIDE_REASON}
                            required
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className={styles.actionsRow}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmittingNotice || !noticeTitle.trim() || !noticeBody.trim()}
                >
                  {isSubmittingNotice
                    ? 'Scheduling…'
                    : isOverride
                      ? 'Release Emergency Notice'
                      : preview?.in_quiet_hours
                        ? `Hold for ${preview.suggested_label || 'Morning'}`
                        : 'Schedule Notice'}
                </button>
              </div>
            </form>
          </div>

          {/* Event Planner Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Plan Calendar Event</h2>
                <p className={styles.cardSubtitle}>
                  Set event dates and automatic notice lead-time reminders for your class.
                </p>
              </div>
            </div>

            {eventError ? <div className={styles.errorBanner}>{eventError}</div> : null}

            <form
              onSubmit={handleCreateEvent}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="event-title">
                  Event Title *
                </label>
                <input
                  id="event-title"
                  className={styles.input}
                  placeholder="e.g. Mid-term Mathematics Assessment"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  maxLength={140}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="event-type">
                    Event Type
                  </label>
                  <select
                    id="event-type"
                    className={styles.select}
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="event-lead">
                    Notice Lead Days
                  </label>
                  <input
                    id="event-lead"
                    type="number"
                    min="0"
                    max="60"
                    className={styles.input}
                    value={eventLeadDays}
                    onChange={(e) => setEventLeadDays(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="event-start-date">
                    Start Date *
                  </label>
                  <input
                    id="event-start-date"
                    type="date"
                    className={styles.input}
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="event-start-time">
                    Start Time
                  </label>
                  <input
                    id="event-start-time"
                    type="time"
                    className={styles.input}
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="event-desc">
                  Notes & Details
                </label>
                <textarea
                  id="event-desc"
                  className={styles.textarea}
                  placeholder="Optional details about schedule, venue or gear..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isCreatingEvent || !eventTitle.trim() || !eventStartDate}
                >
                  {isCreatingEvent ? 'Adding Event…' : 'Add Calendar Event'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Scheduled Notices & Upcoming Events */}
        <div className={styles.panelStack}>
          {/* Scheduled / Sent Notices */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Class Notices</h2>
                <p className={styles.cardSubtitle}>Scheduled queues and released circulars</p>
              </div>
            </div>

            {notices.length === 0 ? (
              <div className={styles.emptyState}>No notices for this class yet.</div>
            ) : (
              <div className={styles.list}>
                {notices.map((n) => {
                  const statusView = noticeStatusView(n, tz);
                  const badgeClass =
                    statusView.tone === 'waiting'
                      ? styles.badgeWaiting
                      : statusView.tone === 'done'
                        ? styles.badgeDone
                        : statusView.tone === 'problem'
                          ? styles.badgeProblem
                          : styles.badgeMuted;

                  return (
                    <div key={n.id} className={styles.itemCard}>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.itemTitle}>{n.title}</h3>
                        <span className={`${styles.badge} ${badgeClass}`}>{n.status}</span>
                      </div>
                      <p className={styles.itemBody}>{n.body}</p>
                      <div className={styles.itemFooter}>
                        <span>{statusView.label}</span>
                        {n.status === 'scheduled' ? (
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={() => handleCancelNotice(n.id)}
                          >
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Class Calendar Events</h2>
                <p className={styles.cardSubtitle}>Upcoming milestones and activities</p>
              </div>
            </div>

            {events.length === 0 ? (
              <div className={styles.emptyState}>
                No calendar events planned for this class yet.
              </div>
            ) : (
              <div className={styles.list}>
                {events.map((e) => (
                  <div key={e.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>{e.title}</h3>
                      <span className={`${styles.badge} ${styles.badgeMuted}`}>{e.type}</span>
                    </div>
                    {e.description ? <p className={styles.itemBody}>{e.description}</p> : null}
                    <div className={styles.itemFooter}>
                      <span>Starts: {new Date(e.starts_at).toLocaleDateString()}</span>
                      {e.notice_due_at ? (
                        <span>Notice due: {new Date(e.notice_due_at).toLocaleDateString()}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
