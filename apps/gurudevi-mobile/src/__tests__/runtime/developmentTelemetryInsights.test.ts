import { describe, expect, it } from 'vitest';
import type { DevelopmentTelemetryRow } from '@/telemetry/developmentTelemetryDatabase';
import { analyzeDevelopmentTelemetry } from '@/telemetry/developmentTelemetryInsights';

function row(
  sequence: number,
  name: string,
  attributes: Record<string, unknown>,
  source = 'runtime',
): DevelopmentTelemetryRow {
  return {
    schema: 1,
    session: 'development-session',
    sequence,
    at_ms: sequence * 10,
    wall_time_ms: sequence * 10,
    source,
    name,
    attributes_json: JSON.stringify(attributes),
  };
}

describe('development telemetry insights', () => {
  it('reports disabled profiler streams as coverage limits, not as evidence of no regression', () => {
    const findings = analyzeDevelopmentTelemetry([], null, [
      {
        source: 'android-native-profile',
        state: 'disabled',
        details: 'Capture manually with Android Studio or Perfetto.',
        updated_at_ms: 1,
      },
    ]);

    expect(findings).toContainEqual(
      expect.objectContaining({
        severity: 'info',
        title: 'Capture coverage limits these conclusions',
        evidence: 'android-native-profile=disabled',
      }),
    );
    expect(findings[0]?.nextStep).toContain('unavailable evidence');
  });

  it('discloses when findings only inspect the bounded newest part of a session', () => {
    const findings = analyzeDevelopmentTelemetry([row(1, 'recent-event', {})], null, [], 12_000);
    expect(findings[0]).toMatchObject({
      severity: 'info',
      title: 'Findings use a bounded session window',
      evidence: 'Analyzed 1 event row(s) out of 12000 persisted for this session.',
    });
  });

  it('discloses a missing source manifest even when the event timeline is empty', () => {
    const findings = analyzeDevelopmentTelemetry([], null);

    expect(findings[0]).toMatchObject({
      severity: 'info',
      title: 'Source completeness is unavailable',
    });
  });

  it('reports long deferred work without labeling it a TTI blocker', () => {
    const findings = analyzeDevelopmentTelemetry(
      [
        row(1, 'workflow-event-bridge', {
          durationMs: 5219,
          attributes: { category: 'startup-task', state: 'completed', duration_ms: 5219 },
        }),
        row(2, 'install-referrer-resolution', {
          durationMs: 5884,
          attributes: { category: 'startup-task', state: 'completed', duration_ms: 5884 },
        }),
      ],
      null,
    );
    const finding = findings.find((item) => item.title === 'Long deferred startup work observed');

    expect(finding).toMatchObject({
      severity: 'info',
      sequence: 2,
    });
    expect(finding?.evidence).toContain('install-referrer-resolution 5884 ms');
    expect(finding?.nextStep).toContain('essential startup gate');
    expect(finding?.nextStep).toContain('first usable frame');
  });

  it('reports presentation delay as observed data without inventing a threshold', () => {
    const findings = analyzeDevelopmentTelemetry(
      [
        row(3, 'touchend', {
          attributes: { category: 'interaction', presentation_delay_ms: 328.9 },
        }),
      ],
      null,
    );
    const finding = findings.find(
      (item) => item.title === 'Interaction presentation delay captured',
    );

    expect(finding).toMatchObject({
      severity: 'info',
      sequence: 3,
    });
    expect(finding?.evidence).toContain('328.9 ms');
    expect(finding?.evidence).toContain('No local threshold is configured');
  });

  it('reports local screen readiness separately from OS launch-to-TTI', () => {
    const findings = analyzeDevelopmentTelemetry(
      [
        row(1, 'development-telemetry-started', {}, 'runtime'),
        row(2, 'onboarding', {
          attributes: { category: 'screen-interactive', task: 'onboarding', state: 'ready' },
        }),
      ],
      null,
    );
    const finding = findings.find((item) => item.title === 'Screen interactivity timing captured');

    expect(finding).toMatchObject({ severity: 'info', sequence: 2 });
    expect(finding?.evidence).toContain('onboarding +10.0 ms from local telemetry start');
    expect(finding?.nextStep).toContain('not OS launch-to-TTI');
  });

  it('distinguishes a missing or later anchor from a missing readiness marker', () => {
    const ready = row(1, 'self', {
      attributes: { category: 'screen-interactive', task: 'self', state: 'ready' },
    });
    for (const rows of [[ready], [ready, row(2, 'development-telemetry-started', {})]]) {
      const findings = analyzeDevelopmentTelemetry(rows, null);
      expect(findings).toContainEqual(
        expect.objectContaining({
          title: 'Screen readiness interval cannot be established',
          sequence: 1,
        }),
      );
      expect(findings.map((finding) => finding.title)).not.toContain(
        'Screen interactivity timing captured',
      );
      expect(findings.map((finding) => finding.title)).not.toContain(
        'Screen interactivity timing unavailable',
      );
    }
  });

  it('separates entry module evaluation, first root effect and essential boot intervals', () => {
    const trace = 'boot-cycle-1';
    const findings = analyzeDevelopmentTelemetry(
      [
        {
          ...row(1, 'expo-router-root-registered', {
            attributes: {
              trace_session_id: trace,
              category: 'entry-module-ready',
              task: 'expo-router-root-registered',
              state: 'complete',
            },
          }),
          at_ms: 10,
        },
        {
          ...row(2, 'first-effect', {
            attributes: {
              trace_session_id: trace,
              category: 'startup-boundary',
              task: 'first-effect',
              state: 'started',
            },
          }),
          at_ms: 100,
        },
        {
          ...row(3, 'initializeDeviceAccounts', {
            attributes: {
              trace_session_id: trace,
              category: 'essential-stage',
              task: 'initializeDeviceAccounts',
              outcome: 'complete',
            },
          }),
          at_ms: 175,
        },
        {
          ...row(4, 'first-shell-frame', {
            attributes: { trace_session_id: trace, category: 'observe' },
          }),
          at_ms: 200,
        },
      ],
      null,
    );
    const finding = findings.find((item) => item.title === 'Startup boundary intervals captured');

    expect(finding?.evidence).toContain(
      'boot-cycle-1: Router entry to first effect 90.0 ms; first effect to final essential stage 75.0 ms; essential stage to first frame callback 25.0 ms',
    );
    expect(finding?.nextStep).toContain('do not include OS launch');
  });

  it('reports fine-grained JS startup milestones from the earliest bootstrap marker', () => {
    const trace = 'fine-grained-boot';
    const traced = (
      sequence: number,
      atMs: number,
      name: string,
      category: string,
      task: string,
      state: string,
    ) => ({
      ...row(sequence, name, {
        attributes: { trace_session_id: trace, category, task, state },
      }),
      at_ms: atMs,
    });
    const findings = analyzeDevelopmentTelemetry(
      [
        traced(
          1,
          5,
          'early-bootstrap-shim',
          'process-bootstrap',
          'early-bootstrap-shim',
          'complete',
        ),
        traced(
          2,
          40,
          'expo-router-entry-evaluated',
          'entry-module-ready',
          'expo-router-entry-evaluated',
          'complete',
        ),
        traced(3, 50, 'first-effect', 'startup-boundary', 'first-effect', 'started'),
        traced(4, 52, 'bootstrapPlatform', 'essential-stage', 'bootstrapPlatform', 'started'),
        traced(5, 70, 'bootstrapPlatform', 'essential-stage', 'bootstrapPlatform', 'complete'),
        traced(
          6,
          72,
          'initializeDeviceAccounts',
          'essential-stage',
          'initializeDeviceAccounts',
          'started',
        ),
        traced(
          7,
          77,
          'initializeDeviceAccounts',
          'essential-stage',
          'initializeDeviceAccounts',
          'complete',
        ),
        traced(8, 78, 'essential-startup', 'startup-boundary', 'essential-startup', 'completed'),
        traced(
          9,
          90,
          'entry-shell-mounted',
          'startup-boundary',
          'entry-shell-mounted',
          'committed',
        ),
        traced(10, 100, 'first-shell-frame', 'startup', 'first-shell-frame', 'committed'),
        traced(11, 120, 'self', 'route-transition', 'self', 'content'),
        traced(12, 140, 'self', 'screen-interactive', 'self', 'ready'),
      ],
      null,
    );
    const timing = findings.find((item) => item.title === 'Startup boundary intervals captured');
    const screenReady = findings.find(
      (item) => item.title === 'Screen interactivity timing captured',
    );

    expect(timing?.evidence).toContain('early shim to Router entry 35.0 ms');
    expect(timing?.evidence).toContain('bootstrapPlatform 18.0 ms');
    expect(timing?.evidence).toContain('essential gate to shell mount 12.0 ms');
    expect(timing?.evidence).toContain('shell frame to route content 20.0 ms');
    expect(timing?.evidence).toContain('route content to screen-ready marker 20.0 ms');
    expect(screenReady?.evidence).toContain('self +135.0 ms from earliest JS bootstrap marker');
  });

  it('reports optional startup work spanning the shell frame without claiming it blocked rendering', () => {
    const trace = 'boot-cycle-overlap';
    const findings = analyzeDevelopmentTelemetry(
      [
        {
          ...row(1, 'expo-router-root-registered', {
            attributes: {
              trace_session_id: trace,
              category: 'entry-module-evaluated',
              task: 'expo-router-root-registered',
              state: 'complete',
            },
          }),
          at_ms: 10,
        },
        {
          ...row(2, 'workflow-event-bridge', {
            attributes: {
              trace_session_id: trace,
              category: 'startup-task',
              task: 'workflow-event-bridge',
              state: 'started',
            },
          }),
          at_ms: 150,
        },
        {
          ...row(3, 'first-shell-frame', {
            attributes: { trace_session_id: trace, category: 'startup' },
          }),
          at_ms: 200,
        },
        {
          ...row(4, 'workflow-event-bridge', {
            attributes: {
              trace_session_id: trace,
              category: 'startup-task',
              task: 'workflow-event-bridge',
              state: 'completed',
            },
          }),
          at_ms: 250,
        },
      ],
      null,
    );
    const finding = findings.find(
      (item) => item.title === 'Optional startup work overlaps shell frame',
    );

    expect(finding).toMatchObject({ severity: 'info', sequence: 3 });
    expect(finding?.evidence).toContain('workflow-event-bridge');
    expect(finding?.evidence).toContain('completed 50.0 ms later');
    expect(finding?.nextStep).toContain('not main-thread blocking');
  });

  it('summarizes captured DevTools spans in milliseconds without attributing frame causality', () => {
    const findings = analyzeDevelopmentTelemetry(
      [
        row(
          4,
          'JS Call',
          { ts: 1000, dur: 12_500, ph: 'X', cat: 'devtools.timeline' },
          'rn-devtools-trace',
        ),
      ],
      null,
    );
    const finding = findings.find(
      (item) => item.title === 'Imported DevTools trace duration spans',
    );

    expect(finding).toMatchObject({ severity: 'info', sequence: 4 });
    expect(finding?.evidence).toContain('JS Call 12.50 ms (devtools.timeline)');
    expect(finding?.nextStep).toContain('not proof');
  });
});
