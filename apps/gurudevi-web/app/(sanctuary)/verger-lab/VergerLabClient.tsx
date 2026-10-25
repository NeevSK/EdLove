'use client';

import {
  GURUDEVI_WEB_HOST,
  type LabResult,
  labConfigure,
  labSections,
  labTune,
  VERGER_LAB_PATCH_KEY,
  type Verger,
} from '@repo/core/verger';
import { useVergerLab } from '@repo/verger-react';
import { useState } from 'react';

const LEVERS = GURUDEVI_WEB_HOST.levers;

/**
 * Applies a typed activation patch live and, only if it applied, keeps it in `localStorage`
 * for the next launch (`localPatch`); empty text clears it. A refusal, or storage that throws,
 * comes back as its reason.
 */
export function applyWebLabPatch(
  verger: Verger,
  text: string,
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
): LabResult {
  const outcome = labConfigure(verger, LEVERS, text);
  if (!outcome.ok) return outcome;
  try {
    if (text.trim() === '') storage.removeItem(VERGER_LAB_PATCH_KEY);
    else storage.setItem(VERGER_LAB_PATCH_KEY, text);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `applied, not saved: ${String(error)}` };
  }
}

/** Saves the session recording as a JSON file, for `pnpm --filter @repo/verger-core compare`. */
function downloadRecording(verger: Verger): LabResult {
  const recording = verger.recording();
  if (!recording) return { ok: false, error: 'not recording' };
  const url = URL.createObjectURL(new Blob([JSON.stringify(recording)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `verger-recording-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  return { ok: true };
}

export function VergerLabClient() {
  const { verger, report } = useVergerLab(LEVERS);
  const [patchText, setPatchText] = useState('');
  const [tuneText, setTuneText] = useState('');
  const [result, setResult] = useState<{ readonly what: string; readonly outcome: LabResult } | null>(
    null,
  );

  if (!verger || !report) return <p className="text-sm text-ink-soft">No verger is bound.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <header className="border-b border-line pb-4">
        <p className="text-[11px] font-mono uppercase tracking-widest text-ink-soft">Development only</p>
        <h1 className="text-2xl font-bold font-display text-ink m-0">Verger lab</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {labSections(report).map((section) => (
          <section key={section.title} className="rounded-xl border border-line p-4">
            <h2 className="text-sm font-semibold text-ink mb-2">{section.title}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
              {section.rows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="text-ink m-0 break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-line p-4 overflow-x-auto">
        <h2 className="text-sm font-semibold text-ink mb-2">Levers</h2>
        <table className="text-xs w-full border-separate border-spacing-x-2 border-spacing-y-1">
          <thead>
            <tr className="text-left text-ink-soft">
              <th>lever</th>
              <th>level</th>
              <th>proposed</th>
              <th>limit ≤ ceiling ≤ home ≤ floor</th>
              <th>pressure</th>
              <th>not for</th>
            </tr>
          </thead>
          <tbody>
            {report.levers.map((lever) => (
              <tr key={lever.id} className="text-ink">
                <td className="font-mono">{lever.id}</td>
                <td>{lever.level}</td>
                <td>{lever.proposed}</td>
                <td>
                  {lever.limit} ≤ {lever.ceiling} ≤ {lever.home} ≤ {lever.floor}
                </td>
                <td>{lever.pressure}</td>
                <td>{lever.ineffective.join(', ') || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-line p-4 space-y-3">
        <label className="block text-sm font-semibold text-ink">
          Activation patch (JSON; empty returns to the launch)
          <textarea
            className="mt-1 block w-full rounded-md border border-line p-2 font-mono text-xs"
            value={patchText}
            onChange={(event) => setPatchText(event.target.value)}
            placeholder='{"grow": false}'
            rows={3}
          />
        </label>
        <button
          type="button"
          className="rounded-md bg-action px-3 py-2 text-sm font-semibold text-paper-light"
          onClick={() =>
            setResult({ what: 'activation', outcome: applyWebLabPatch(verger, patchText, window.localStorage) })
          }
        >
          Apply and save
        </button>
        <label className="block text-sm font-semibold text-ink">
          Thresholds (JSON; empty returns to the host&apos;s)
          <textarea
            className="mt-1 block w-full rounded-md border border-line p-2 font-mono text-xs"
            value={tuneText}
            onChange={(event) => setTuneText(event.target.value)}
            placeholder='{"upgradeAfterMs": 2000}'
            rows={3}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-action px-3 py-2 text-sm font-semibold text-paper-light"
            onClick={() =>
              setResult({ what: 'thresholds', outcome: labTune(verger, GURUDEVI_WEB_HOST.config, tuneText) })
            }
          >
            Tune
          </button>
          <button
            type="button"
            className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink"
            onClick={() => setResult({ what: 'recording', outcome: downloadRecording(verger) })}
          >
            Download session recording
          </button>
        </div>
        {result ? (
          <p role="status" className={result.outcome.ok ? 'text-sm text-ink' : 'text-sm text-ember-red'}>
            {result.what}: {result.outcome.ok ? 'applied' : result.outcome.error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
