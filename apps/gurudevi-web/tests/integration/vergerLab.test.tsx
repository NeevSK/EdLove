import {
  createVerger,
  GURUDEVI_WEB_HOST,
  resolveVergerPolicy,
  UNKNOWN_CAPACITY,
  VERGER_LAB_CONFIG_KEY,
  VERGER_LAB_PATCH_KEY,
  VERGER_LAB_POLICY_KEY,
} from '@repo/core/verger';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { applyWebLabPatch, applyWebLabTune, chooseWebLabPolicy, VergerLabClient } from '../../app/(sanctuary)/verger-lab/VergerLabClient';
import { GurudeviWebVerger } from '../../lib/runtime/GurudeviWebVerger';

describe('the web dev lab (D2, jsdom)', () => {
  it('shows every layer of the page’s verger', async () => {
    render(
      <GurudeviWebVerger>
        <VergerLabClient />
      </GurudeviWebVerger>,
    );
    await waitFor(() => expect(screen.getByText('Self-cost')).toBeTruthy());
    for (const title of ['Launch', 'Readings', 'Accounts', 'Outcomes', 'Levers'])
      expect(screen.getByText(title)).toBeTruthy();
    for (const lever of GURUDEVI_WEB_HOST.levers) expect(screen.getByText(lever.id)).toBeTruthy();
  });

  it('keeps a patch and thresholds only when they applied', async () => {
    const verger = createVerger({
      host: GURUDEVI_WEB_HOST,
      platform: () => ({
        readCapacity: () => UNKNOWN_CAPACITY,
        memorySensing: false,
        createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }),
      }),
      requested: 'active',
      release: 'test',
      now: () => 0,
    });
    await verger.start();
    const kept = new Map<string, string>();
    const storage = {
      setItem: (key: string, value: string) => void kept.set(key, value),
      removeItem: (key: string) => void kept.delete(key),
    };
    expect(applyWebLabPatch(verger, '{"defaultLever":"sideways"}', storage)).toMatchObject({ ok: false });
    expect(kept.size).toBe(0);
    expect(applyWebLabPatch(verger, '{"grow":false}', storage)).toEqual({ ok: true });
    expect(kept.get(VERGER_LAB_PATCH_KEY)).toBe('{"grow":false}');
    expect(applyWebLabTune(verger, '{"upgradeAfterMs":999999}', storage)).toMatchObject({ ok: false });
    expect(kept.has(VERGER_LAB_CONFIG_KEY)).toBe(false);
    expect(applyWebLabTune(verger, '{"upgradeAfterMs":2000}', storage)).toEqual({ ok: true });
    expect(kept.get(VERGER_LAB_CONFIG_KEY)).toBe('{"upgradeAfterMs":2000}');
    const full = { setItem: () => { throw new Error('quota'); }, removeItem: () => {} };
    expect(applyWebLabPatch(verger, '{"grow":false}', full)).toMatchObject({ ok: false, error: expect.stringMatching(/not saved/) });
  });

  it('keeps a policy choice in the form the next load reads back', () => {
    const kept = new Map<string, string>();
    const storage = {
      setItem: (key: string, value: string) => void kept.set(key, value),
      removeItem: (key: string) => void kept.delete(key),
    };
    expect(chooseWebLabPolicy('p5', storage)).toEqual({ ok: true });
    const stored = kept.get(VERGER_LAB_POLICY_KEY);
    expect(resolveVergerPolicy({ build: undefined, local: JSON.parse(stored ?? 'null'), remote: undefined, dev: true })).toMatchObject({ name: 'p5', source: 'lab' });
    expect(chooseWebLabPolicy(null, storage)).toEqual({ ok: true });
    expect(kept.has(VERGER_LAB_POLICY_KEY)).toBe(false);
  });
});
