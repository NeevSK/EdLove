import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { createSessionRecorder, replayRecording } from './recording';
import { replayVerger } from './replay';
import type { VergerEvent } from './types';

const options = { at: 0, levers: SAMPLE_LEVERS, memorySensing: true };

describe('session recording', () => {
  it('keeps the head and counts the drops past its bound', () => {
    const recorder = createSessionRecorder(4, options, 2);
    for (let at = 1; at <= 5; at += 1) recorder.record({ type: 'interaction', at });
    const recording = recorder.recording();
    expect(recording.events.map((e) => e.at)).toEqual([1, 2]);
    expect(recording.dropped).toBe(3);
  });

  it('refuses to replay through a policy of another version', () => {
    const recording = createSessionRecorder(VERGER_POLICY.version, options).recording();
    expect(() => replayRecording(recording, VERGER_POLICY_P5)).toThrow(/policy 4, not 5/);
  });

  it('replays in reduction order, not timestamp order', () => {
    // A late-stamped trim lands after a later interaction; sorting would reorder them.
    const events: VergerEvent[] = [
      { type: 'interaction', at: 2000 },
      { type: 'memory-trim', at: 1000, severity: 'critical' },
    ];
    const recorder = createSessionRecorder(VERGER_POLICY.version, options);
    let state = VERGER_POLICY.create(options);
    for (const event of events) {
      recorder.record(event);
      state = VERGER_POLICY.reduce(state, event);
    }
    const replayed = replayRecording(recorder.recording(), VERGER_POLICY).final;
    expect(replayed).toEqual(VERGER_POLICY.snapshot(state));
    expect(replayVerger(options, events).final).not.toEqual(replayed);
  });

  it('a recording is plain data: it survives JSON and still replays', () => {
    const recorder = createSessionRecorder(VERGER_POLICY.version, options);
    recorder.record({ type: 'memory-trim', at: 10, severity: 'moderate' });
    const recording = recorder.recording();
    const copy = JSON.parse(JSON.stringify(recording));
    expect(replayRecording(copy, VERGER_POLICY).snapshots).toEqual(replayRecording(recording, VERGER_POLICY).snapshots);
  });
});
