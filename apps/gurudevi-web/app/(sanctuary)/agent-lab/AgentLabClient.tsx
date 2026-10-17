'use client';

import { useState } from 'react';

type Capability = 'teacher-summary' | 'student-support';

type ScenarioRun = {
  id: string;
  capability: Capability;
  scenario: string;
  status: 'completed' | 'running';
  summaryDraft: string;
  timeline: Array<{ action: string; time: string }>;
};

const initialRuns: ScenarioRun[] = [
  {
    id: 'run-9021',
    capability: 'teacher-summary',
    scenario: 'attendance-dip',
    status: 'completed',
    summaryDraft:
      'Identified a 14% attendance dip in Week 4 linked to monsoon seasonal patterns. Recommended personalized check-ins for 3 students and asynchronous review modules.',
    timeline: [
      { action: 'Ingested 4-week classroom attendance logs', time: '10:02:14' },
      { action: 'Correlated regional weather and holiday patterns', time: '10:02:18' },
      { action: 'Generated draft teacher support summary', time: '10:02:22' },
      { action: 'Queued for human mentor review', time: '10:02:25' },
    ],
  },
  {
    id: 'run-9022',
    capability: 'student-support',
    scenario: 'resilient-improver',
    status: 'completed',
    summaryDraft:
      'Student demonstrated 22% improvement in fractions across recent exercises. Drafted encouragement note emphasizing curiosity and sustained effort.',
    timeline: [
      { action: 'Analyzed Unit 3 homework progressions', time: '11:15:02' },
      { action: 'Detected high persistence pattern on difficult tasks', time: '11:15:05' },
      { action: 'Formulated personalized praise draft', time: '11:15:08' },
    ],
  },
];

const SCENARIOS: Record<Capability, string[]> = {
  'teacher-summary': ['attendance-dip', 'steady-growth', 'wellbeing-watch'],
  'student-support': ['quiet-struggle', 'resilient-improver', 'wellbeing-watch'],
};

export function AgentLabClient() {
  const [runs, setRuns] = useState<ScenarioRun[]>(initialRuns);
  const [capability, setCapability] = useState<Capability>('teacher-summary');
  const [scenario, setScenario] = useState<string>('attendance-dip');
  const [isExecuting, setIsExecuting] = useState(false);

  function handleTriggerRun() {
    setIsExecuting(true);
    const newRunId = `run-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toTimeString().split(' ')[0] || '12:00:00';

    setTimeout(() => {
      const newRun: ScenarioRun = {
        id: newRunId,
        capability,
        scenario,
        status: 'completed',
        summaryDraft: `Synthesized recommendations for scenario [${scenario}]. Context safely bounded within active classroom scope. Ready for pedagogical review.`,
        timeline: [
          { action: `Triggered simulation for ${scenario}`, time: now },
          { action: 'Context assembled via @repo/core data contracts', time: now },
          { action: 'Synthesized evidence-backed pedagogical draft', time: now },
        ],
      };
      setRuns((prev) => [newRun, ...prev]);
      setIsExecuting(false);
    }, 800);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-ink-soft">
            Internal Platform Lab · Web Canonical
          </span>
          <h1 className="text-2xl font-bold font-display text-ink m-0">
            Durable Agent Execution Lab
          </h1>
          <p className="text-sm text-ink-soft m-0">
            Execute and inspect scenario simulations for teacher summaries and student support.
          </p>
        </div>
      </div>

      {/* Execution Controls */}
      <div className="p-6 rounded-xl border border-line bg-paper-light shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-soft m-0">
          Queue New Scenario Simulation
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1" htmlFor="cap-select">
              Capability
            </label>
            <select
              id="cap-select"
              value={capability}
              onChange={(e) => {
                const newCap = e.target.value as Capability;
                setCapability(newCap);
                const firstScenario = SCENARIOS[newCap]?.[0] || 'attendance-dip';
                setScenario(firstScenario);
              }}
              className="px-3 py-2 rounded-lg border border-line bg-paper text-ink text-sm min-h-[44px]"
            >
              <option value="teacher-summary">Teacher Classroom Summary</option>
              <option value="student-support">Student Individual Support</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1" htmlFor="scen-select">
              Scenario Preset
            </label>
            <select
              id="scen-select"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="px-3 py-2 rounded-lg border border-line bg-paper text-ink text-sm min-h-[44px]"
            >
              {SCENARIOS[capability].map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              type="button"
              disabled={isExecuting}
              onClick={handleTriggerRun}
              className="touch-target-min px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-95 shadow-sm disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-action, #a85022)' }}
            >
              {isExecuting ? 'Simulating Trace...' : 'Run Simulation'}
            </button>
          </div>
        </div>
      </div>

      {/* Execution Runs List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display text-ink m-0">Recent Execution Traces</h2>

        <div className="space-y-4">
          {runs.map((run) => (
            <article
              key={run.id}
              className="p-5 rounded-xl border border-line bg-paper-light shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-line pb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-action">{run.id}</span>
                  <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-paper border border-line text-ink-soft">
                    {run.capability}
                  </span>
                  <span className="text-xs font-semibold text-ink">Scenario: {run.scenario}</span>
                </div>
                <span className="text-xs font-bold text-green-700 uppercase font-mono">
                  {run.status}
                </span>
              </div>

              <div className="text-sm text-ink leading-relaxed font-sans bg-paper/40 p-3 rounded-lg border border-line/40">
                <strong className="block text-xs uppercase font-mono text-ink-soft mb-1">
                  Synthesized Draft:
                </strong>
                {run.summaryDraft}
              </div>

              {/* Timeline */}
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase text-ink-soft m-0">Timeline:</p>
                <ul className="text-xs space-y-1 list-none p-0 m-0">
                  {run.timeline.map((step) => (
                    <li
                      key={step.action}
                      className="flex items-center gap-2 text-ink-soft font-mono"
                    >
                      <span className="text-action">›</span>
                      <span>[{step.time}]</span>
                      <span>{step.action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
