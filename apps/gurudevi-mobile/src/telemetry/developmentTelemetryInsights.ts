import { INPUT_DELAY_DURATION_THRESHOLD_MS } from '@repo/verger-react';
import type {
  DevelopmentTelemetryRow,
  DevelopmentTelemetrySourceStatus,
} from './developmentTelemetryDatabase';

export interface DevelopmentTelemetryInsight {
  readonly severity: 'attention' | 'info';
  readonly title: string;
  readonly evidence: string;
  readonly nextStep: string;
  readonly sequence: number | null;
}

function attributesOf(row: DevelopmentTelemetryRow): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(row.attributes_json);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? Object.fromEntries(Object.entries(parsed))
      : {};
  } catch {
    return {};
  }
}

function numericAttribute(row: DevelopmentTelemetryRow, key: string): number | null {
  const value = attributesOf(row)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function nestedAttributesOf(row: DevelopmentTelemetryRow): Record<string, unknown> {
  const nested = attributesOf(row).attributes;
  return nested !== null && typeof nested === 'object' && !Array.isArray(nested)
    ? Object.fromEntries(Object.entries(nested))
    : {};
}

function nestedNumber(row: DevelopmentTelemetryRow, key: string): number | null {
  const value = nestedAttributesOf(row)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function analyzeDevelopmentTelemetry(
  rows: readonly DevelopmentTelemetryRow[],
  databaseError: string | null,
  sources: readonly DevelopmentTelemetrySourceStatus[] = [],
  totalSessionEventCount?: number,
): DevelopmentTelemetryInsight[] {
  const findings: DevelopmentTelemetryInsight[] = [];
  if (totalSessionEventCount !== undefined && rows.length < totalSessionEventCount) {
    findings.push({
      severity: 'info',
      title: 'Findings use a bounded session window',
      evidence: `Analyzed ${rows.length} event row(s) out of ${totalSessionEventCount} persisted for this session.`,
      nextStep:
        'Use the timeline time/source filters to inspect earlier events; findings do not cover rows outside this analysis window.',
      sequence: null,
    });
  }
  const incompleteSources = sources.filter((source) =>
    ['unsupported', 'disabled', 'capped', 'failed'].includes(source.state),
  );
  if (sources.length === 0) {
    findings.push({
      severity: 'info',
      title: 'Source completeness is unavailable',
      evidence:
        'This session has no persisted source manifest, so missing event families cannot be distinguished from unused instrumentation.',
      nextStep:
        'Check whether startup instrumentation ran, then refresh the session after source status is persisted.',
      sequence: null,
    });
  } else if (incompleteSources.length > 0) {
    findings.push({
      severity: 'info',
      title: 'Capture coverage limits these conclusions',
      evidence: incompleteSources.map((source) => `${source.source}=${source.state}`).join('; '),
      nextStep:
        'Treat absent events from these sources as unavailable evidence. Enable a supported source or attach its original profiler artifact before attributing CPU, render, memory, GPU, or native time.',
      sequence: null,
    });
  }

  const bootstrapAnchor = rows
    .filter(
      (row) =>
        row.source === 'runtime' &&
        ['early-bootstrap-shim', 'development-telemetry-started'].includes(row.name),
    )
    .reduce<DevelopmentTelemetryRow | null>(
      (first, row) => (first === null || row.at_ms < first.at_ms ? row : first),
      null,
    );
  const interactiveScreens = rows
    .map((row) => ({ row, attributes: nestedAttributesOf(row) }))
    .filter(
      (item) =>
        item.row.source === 'runtime' &&
        item.attributes.category === 'screen-interactive' &&
        item.attributes.state === 'ready' &&
        typeof item.attributes.task === 'string',
    )
    .sort((left, right) => left.row.at_ms - right.row.at_ms);
  const timedScreens = bootstrapAnchor
    ? interactiveScreens.filter(({ row }) => row.at_ms >= bootstrapAnchor.at_ms)
    : [];
  if (bootstrapAnchor && timedScreens.length > 0) {
    const anchorLabel =
      bootstrapAnchor.name === 'early-bootstrap-shim'
        ? 'earliest JS bootstrap marker'
        : 'local telemetry start';
    findings.push({
      severity: 'info',
      title: 'Screen interactivity timing captured',
      evidence: timedScreens
        .map(
          ({ row, attributes }) =>
            `${String(attributes.task)} +${(row.at_ms - bootstrapAnchor.at_ms).toFixed(1)} ms from ${anchorLabel}`,
        )
        .join('; '),
      nextStep:
        'This is a local JavaScript screen-ready interval, not OS launch-to-TTI. Compare the same journey with a native launch trace and a release-like build before optimizing.',
      sequence: timedScreens[0]?.row.sequence ?? null,
    });
  }
  if (interactiveScreens.length === 0) {
    findings.push({
      severity: 'info',
      title: 'Screen interactivity timing unavailable',
      evidence: 'This session has no persisted screen-ready marker.',
      nextStep:
        'Enable screen-readiness capture for a ready Self or welcome screen; shell-frame and route-gate events do not prove that screen content is usable.',
      sequence: null,
    });
  }
  if (
    interactiveScreens.length > 0 &&
    (!bootstrapAnchor || timedScreens.length < interactiveScreens.length)
  ) {
    findings.push({
      severity: 'info',
      title: 'Screen readiness interval cannot be established',
      evidence: bootstrapAnchor
        ? 'At least one screen-ready marker precedes the bootstrap anchor in the retained window.'
        : 'Screen-ready markers exist, but this window has no bootstrap anchor.',
      nextStep:
        'Inspect the complete session and clock provenance before comparing startup intervals.',
      sequence: interactiveScreens[0]?.row.sequence ?? null,
    });
  }

  const startupTraceRows = rows
    .map((row) => ({ row, attributes: nestedAttributesOf(row) }))
    .filter(
      (item) =>
        item.row.source === 'runtime' && typeof item.attributes.trace_session_id === 'string',
    );
  const startupTraceIds = Array.from(
    new Set(
      startupTraceRows
        .filter(({ attributes }) =>
          ['entry-module-ready', 'entry-module-evaluated'].includes(String(attributes.category)),
        )
        .map(({ attributes }) => attributes.trace_session_id)
        .filter((traceId): traceId is string => typeof traceId === 'string'),
    ),
  );
  const startupIntervals = startupTraceIds.flatMap((traceId) => {
    const traceRows = startupTraceRows.filter(
      ({ attributes }) => attributes.trace_session_id === traceId,
    );
    const first = (predicate: (attributes: Record<string, unknown>) => boolean) =>
      traceRows
        .filter(({ attributes }) => predicate(attributes))
        .sort((left, right) => left.row.at_ms - right.row.at_ms)[0]?.row;
    const entry = first((attributes) =>
      ['entry-module-ready', 'entry-module-evaluated'].includes(String(attributes.category)),
    );
    const earlyBootstrap = first(
      (attributes) =>
        attributes.category === 'process-bootstrap' && attributes.task === 'early-bootstrap-shim',
    );
    const boundary = first(
      (attributes) =>
        attributes.category === 'startup-boundary' && attributes.task === 'first-effect',
    );
    const essential = first(
      (attributes) =>
        attributes.category === 'essential-stage' &&
        attributes.task === 'initializeDeviceAccounts' &&
        (attributes.outcome === 'complete' || attributes.state === 'complete'),
    );
    const shell = traceRows
      .filter(({ row }) => row.name === 'first-shell-frame')
      .sort((left, right) => left.row.at_ms - right.row.at_ms)[0]?.row;
    const shellMounted = first(
      (attributes) =>
        attributes.category === 'startup-boundary' && attributes.task === 'entry-shell-mounted',
    );
    const essentialReady = first(
      (attributes) =>
        attributes.category === 'startup-boundary' &&
        attributes.task === 'essential-startup' &&
        attributes.state === 'completed',
    );
    const firstRouteContent = first(
      (attributes) => attributes.category === 'route-transition' && attributes.state === 'content',
    );
    const firstScreenReady = traceRows
      .filter(
        ({ attributes }) =>
          attributes.category === 'screen-interactive' && attributes.state === 'ready',
      )
      .sort((left, right) => left.row.at_ms - right.row.at_ms)[0]?.row;
    const stageNames = [
      'bootstrapPlatform',
      'runtimeRegistration',
      'loadCatalog',
      'registerAppCatalog',
      'initializeDeviceAccounts',
    ];
    const stageDurations = stageNames.flatMap((stage) => {
      const start = first(
        (attributes) =>
          attributes.category === 'essential-stage' &&
          attributes.task === stage &&
          attributes.state === 'started',
      );
      const finish = first(
        (attributes) =>
          attributes.category === 'essential-stage' &&
          attributes.task === stage &&
          ['complete', 'failed'].includes(String(attributes.state)),
      );
      return start && finish ? [`${stage} ${(finish.at_ms - start.at_ms).toFixed(1)} ms`] : [];
    });
    if (!entry || !boundary || !essential) return [];
    return [
      {
        traceId,
        entry,
        boundary,
        essential,
        shell,
        earlyBootstrap,
        shellMounted,
        essentialReady,
        firstRouteContent,
        firstScreenReady,
        stageDurations,
      },
    ];
  });
  if (startupIntervals.length > 0) {
    const elapsed = (start: number, end: number) => Math.max(0, end - start).toFixed(1);
    findings.push({
      severity: 'info',
      title: 'Startup boundary intervals captured',
      evidence: startupIntervals
        .map(
          ({
            traceId,
            entry,
            boundary,
            essential,
            shell,
            earlyBootstrap,
            shellMounted,
            essentialReady,
            firstRouteContent,
            firstScreenReady,
            stageDurations,
          }) => {
            const phases = [
              earlyBootstrap
                ? `early shim to Router entry ${elapsed(earlyBootstrap.at_ms, entry.at_ms)} ms`
                : `Router entry to first effect ${elapsed(entry.at_ms, boundary.at_ms)} ms`,
              earlyBootstrap
                ? `Router entry to first effect ${elapsed(entry.at_ms, boundary.at_ms)} ms`
                : null,
              stageDurations.length ? `essential stages ${stageDurations.join(', ')}` : null,
              `first effect to final essential stage ${elapsed(boundary.at_ms, essential.at_ms)} ms`,
              essentialReady && shellMounted
                ? `essential gate to shell mount ${elapsed(essentialReady.at_ms, shellMounted.at_ms)} ms`
                : null,
              shellMounted && shell
                ? `shell mount to first frame callback ${elapsed(shellMounted.at_ms, shell.at_ms)} ms`
                : shell
                  ? `essential stage to first frame callback ${elapsed(essential.at_ms, shell.at_ms)} ms`
                  : null,
              shell && firstRouteContent
                ? `shell frame to route content ${elapsed(shell.at_ms, firstRouteContent.at_ms)} ms`
                : null,
              firstRouteContent && firstScreenReady
                ? `route content to screen-ready marker ${elapsed(firstRouteContent.at_ms, firstScreenReady.at_ms)} ms`
                : null,
            ].filter((phase): phase is string => phase !== null);
            return `${traceId}: ${phases.join('; ')}`;
          },
        )
        .join('; '),
      nextStep:
        'Compare repeated cold starts in the same build and environment. These JavaScript-clock intervals localize the app bundle and React startup path but do not include OS launch or attribute native CPU; use a native launch trace and a Hermes profile before changing module or startup order.',
      sequence: startupIntervals[0]?.entry.sequence ?? null,
    });
  }

  const optionalStartupOverlaps = startupTraceIds.flatMap((traceId) => {
    const traceRows = startupTraceRows
      .filter(({ attributes }) => attributes.trace_session_id === traceId)
      .sort((left, right) => left.row.at_ms - right.row.at_ms);
    const shell = traceRows.find(({ row }) => row.name === 'first-shell-frame')?.row;
    if (!shell) return [];

    const taskNames = Array.from(
      new Set(
        traceRows
          .filter(
            ({ attributes }) =>
              attributes.category === 'startup-task' && attributes.state === 'started',
          )
          .map(({ attributes }) => attributes.task)
          .filter((task): task is string => typeof task === 'string'),
      ),
    );
    return taskNames
      .flatMap((task) => {
        const taskRows = traceRows.filter(({ attributes }) => attributes.task === task);
        const starts = taskRows.filter(({ attributes }) => attributes.state === 'started');
        const finishes = taskRows.filter(({ attributes }) =>
          ['completed', 'failed'].includes(String(attributes.state)),
        );
        return starts.flatMap(({ row: start }, index) => {
          const nextStart = starts[index + 1]?.row;
          const finish = finishes.find(
            ({ row }) =>
              row.at_ms >= start.at_ms && (nextStart === undefined || row.at_ms < nextStart.at_ms),
          )?.row;
          return finish && start.at_ms < shell.at_ms && finish.at_ms > shell.at_ms
            ? [{ task, finish }]
            : [];
        });
      })
      .map(({ task, finish }) => ({ traceId, task, finish, shell }));
  });
  if (optionalStartupOverlaps.length > 0) {
    const elapsed = (start: number, end: number) => Math.max(0, end - start).toFixed(1);
    findings.push({
      severity: 'info',
      title: 'Optional startup work overlaps shell frame',
      evidence: optionalStartupOverlaps
        .map(
          ({ traceId, task, finish, shell }) =>
            `${traceId}: ${task} was still in flight at the first shell frame and completed ${elapsed(shell.at_ms, finish.at_ms)} ms later`,
        )
        .join('; '),
      nextStep:
        'Overlap establishes concurrency, not main-thread blocking. Compare a short Hermes and native trace around this interval before changing when these services start.',
      sequence: optionalStartupOverlaps[0]?.shell.sequence ?? null,
    });
  }

  const longTasks = rows.filter((row) => row.name === 'long-task');
  const worstLongTask = longTasks.reduce<DevelopmentTelemetryRow | null>((worst, row) => {
    const duration = numericAttribute(row, 'durationMs');
    return duration !== null &&
      (worst === null || duration > (numericAttribute(worst, 'durationMs') ?? 0))
      ? row
      : worst;
  }, null);
  if (worstLongTask) {
    const duration = numericAttribute(worstLongTask, 'durationMs') ?? 0;
    findings.push({
      severity: 'attention',
      title: 'JavaScript task blocked the event loop',
      evidence: `${longTasks.length} long-task event(s); worst observed ${duration.toFixed(1)} ms at sequence ${worstLongTask.sequence}.`,
      nextStep:
        'Record a short Hermes CPU profile in React Native DevTools and inspect the matching timeline interval.',
      sequence: worstLongTask.sequence,
    });
  }

  const delayedInputs = rows.filter(
    (row) =>
      row.name === 'input-delay' &&
      (numericAttribute(row, 'durationMs') ?? 0) >= INPUT_DELAY_DURATION_THRESHOLD_MS,
  );
  if (delayedInputs.length > 0) {
    const worst = delayedInputs.reduce((max, row) =>
      (numericAttribute(row, 'durationMs') ?? 0) > (numericAttribute(max, 'durationMs') ?? 0)
        ? row
        : max,
    );
    findings.push({
      severity: 'attention',
      title: 'Input delay crossed the Event Timing threshold',
      evidence: `${delayedInputs.length} delayed input event(s) at or above ${INPUT_DELAY_DURATION_THRESHOLD_MS} ms; worst ${(numericAttribute(worst, 'durationMs') ?? 0).toFixed(1)} ms at sequence ${worst.sequence}.`,
      nextStep:
        'Compare the event time with nearby long-task and frame-window events, then verify the action outcome on device.',
      sequence: worst.sequence,
    });
  }

  const frameRows = rows.filter((row) => row.name === 'frame-window');
  const poorFrames = frameRows.filter((row) => {
    const frame = attributesOf(row).window;
    if (frame === null || typeof frame !== 'object') return false;
    const droppedRatio = Reflect.get(frame, 'droppedRatio');
    return typeof droppedRatio === 'number' && droppedRatio >= 0.1;
  });
  if (poorFrames.length > 0) {
    const worst = poorFrames.reduce((max, row) => {
      const maxFrame = attributesOf(max).window;
      const rowFrame = attributesOf(row).window;
      const maxRatio =
        maxFrame && typeof maxFrame === 'object' ? Reflect.get(maxFrame, 'droppedRatio') : 0;
      const rowRatio =
        rowFrame && typeof rowFrame === 'object' ? Reflect.get(rowFrame, 'droppedRatio') : 0;
      return typeof rowRatio === 'number' && typeof maxRatio === 'number' && rowRatio > maxRatio
        ? row
        : max;
    });
    findings.push({
      severity: 'attention',
      title: 'Frame windows report repeated missed vsyncs',
      evidence: `${poorFrames.length} frame window(s) report at least 10% missed vsyncs; inspect sequence ${worst.sequence}.`,
      nextStep:
        'Capture an Android Studio or Perfetto trace for the same flow; DevTools JS profiles alone cannot attribute UI, render, GPU, or worklet time.',
      sequence: worst.sequence,
    });
  }

  const deferredTasks = rows
    .filter((row) => {
      const attributes = nestedAttributesOf(row);
      return attributes.category === 'startup-task' && attributes.state === 'completed';
    })
    .map((row) => ({
      row,
      duration: numericAttribute(row, 'durationMs') ?? nestedNumber(row, 'duration_ms'),
    }))
    .filter(
      (item): item is { row: DevelopmentTelemetryRow; duration: number } => item.duration !== null,
    )
    .sort((left, right) => right.duration - left.duration)
    .slice(0, 3);
  if (deferredTasks.length > 0) {
    findings.push({
      severity: 'info',
      title: 'Long deferred startup work observed',
      evidence: deferredTasks
        .map(({ row, duration }) => `${row.name} ${duration.toFixed(0)} ms`)
        .join('; '),
      nextStep:
        'These tasks are measured separately from the essential startup gate. Check whether their overlapping JS or network work delays the first usable frame before changing startup order.',
      sequence: deferredTasks[0]?.row.sequence ?? null,
    });
  }

  const presentationEvents = rows
    .map((row) => ({ row, duration: nestedNumber(row, 'presentation_delay_ms') }))
    .filter(
      (item): item is { row: DevelopmentTelemetryRow; duration: number } => item.duration !== null,
    )
    .sort((left, right) => right.duration - left.duration);
  const slowestPresentation = presentationEvents[0];
  if (slowestPresentation) {
    findings.push({
      severity: 'info',
      title: 'Interaction presentation delay captured',
      evidence: `${slowestPresentation.row.name} recorded ${slowestPresentation.duration.toFixed(1)} ms of presentation delay; reviewed ${presentationEvents.length} Event Timing sample(s). No local threshold is configured for this component.`,
      nextStep:
        'Compare this source timestamp with nearby route, long-task and frame events; confirm the same action with a short React Native DevTools performance recording.',
      sequence: slowestPresentation.row.sequence,
    });
  }

  const importedSpans = rows
    .filter((row) => {
      const attributes = attributesOf(row);
      return row.source === 'rn-devtools-trace' && attributes.ph === 'X';
    })
    .map((row) => ({ row, durationMs: (numericAttribute(row, 'dur') ?? 0) / 1000 }))
    .filter(({ durationMs }) => durationMs > 0)
    .sort((left, right) => right.durationMs - left.durationMs)
    .slice(0, 3);
  if (importedSpans.length > 0) {
    findings.push({
      severity: 'info',
      title: 'Imported DevTools trace duration spans',
      evidence: importedSpans
        .map(({ row, durationMs }) => {
          const category = attributesOf(row).cat;
          return `${row.name} ${durationMs.toFixed(2)} ms${typeof category === 'string' ? ` (${category.slice(0, 80)})` : ''}`;
        })
        .join('; '),
      nextStep:
        'Use each event’s category, process/thread IDs and neighboring trace rows to locate the busy lane. These are captured durations, not proof that a span caused a dropped frame.',
      sequence: importedSpans[0]?.row.sequence ?? null,
    });
  }

  if (databaseError) {
    findings.push({
      severity: 'attention',
      title: 'Queryable capture is incomplete',
      evidence: databaseError,
      nextStep:
        'Check SQLite status and device storage, then retain the JSONL fallback before repeating the journey.',
      sequence: null,
    });
  }

  if (findings.length === 0) {
    findings.push({
      severity: 'info',
      title:
        rows.length === 0
          ? 'No queryable events in this session'
          : 'No configured thresholds crossed',
      evidence:
        rows.length === 0
          ? 'The selected session has no persisted events yet; a silent source may be unsupported, disabled, or simply unused.'
          : `Reviewed ${rows.length} persisted event(s). This is observational evidence, not proof of zero jank or full source coverage.`,
      nextStep:
        'Inspect source completeness and use a repeatable route/action flow before drawing a performance conclusion.',
      sequence: null,
    });
  }
  return findings;
}
