import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type MetabolicIntensity,
  type RouteMetabolicProfile,
  resolveRouteMetabolicProfile,
} from '../routeManifest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEDGER_PATH = path.resolve(__dirname, '../routeMetabolic.generated.json');

interface GeneratedRouteEntry {
  intensity: MetabolicIntensity;
  intent?: 'canvas-mount' | 'heavy-navigation' | 'data-sync-burst';
  transitionDwellMs: number;
  score: number;
  dominantPlatform: 'mobile' | 'web';
  breakdown: {
    gpu: string[];
    motion: string[];
    virtualization: string[];
    governed: string[];
    unvirtualizedLoops: number;
    unselectedStores: number;
    complexity: boolean;
    totalJsxTags: number;
    totalLines: number;
  };
  leversBound: number;
  unregulatedSink: boolean;
  sources: string[];
}

interface GeneratedLedger {
  version: string;
  generatedAt: string;
  routeCount: number;
  unregulatedSinkCount: number;
  routes: Record<string, GeneratedRouteEntry>;
}

describe('AOT Route Metabolism & Complexity Invariants (Anti-Mocking Code Analysis)', () => {
  const ledgerExists = fs.existsSync(LEDGER_PATH);

  it('maintains a fresh, valid static metabolic ledger', () => {
    expect(ledgerExists).toBe(true);
    const raw = fs.readFileSync(LEDGER_PATH, 'utf8');
    const ledger: GeneratedLedger = JSON.parse(raw);

    expect(ledger.routeCount).toBeGreaterThan(0);
    expect(Object.keys(ledger.routes).length).toBe(ledger.routeCount);
  });

  it('INVARIANT 1 (Zero Unregulated Metabolic Sinks): Every heavy/intensive route MUST bind Verger levers', () => {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf8');
    const ledger: GeneratedLedger = JSON.parse(raw);

    const sinks: string[] = [];
    for (const [routePath, entry] of Object.entries(ledger.routes)) {
      if (entry.unregulatedSink) {
        sinks.push(`${routePath} (score: ${entry.score}, levers: ${entry.leversBound})`);
      }
    }

    expect(sinks, `Found ${sinks.length} unregulated metabolic sinks: ${sinks.join(', ')}`).toEqual([]);
    expect(ledger.unregulatedSinkCount).toBe(0);
  });

  it('INVARIANT 2 (AOT Intent Soundness): Routes with GPU domination must anticipate canvas-mount', () => {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf8');
    const ledger: GeneratedLedger = JSON.parse(raw);

    for (const entry of Object.values(ledger.routes)) {
      const hasGpu = entry.breakdown.gpu.length > 0;
      const isHeavyOrIntensive = entry.intensity === 'heavy' || entry.intensity === 'intensive';

      if (hasGpu && isHeavyOrIntensive) {
        // Must declare an intent and transition dwell >= 400ms
        expect(entry.intent).toBeDefined();
        expect(entry.transitionDwellMs).toBeGreaterThanOrEqual(400);
      }
    }
  });

  it('INVARIANT 3 (Static Profile Resolution Consistency): resolveRouteMetabolicProfile matches static ledger', () => {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf8');
    const ledger: GeneratedLedger = JSON.parse(raw);

    // Test a sample of canonical routes
    const testCases = ['/', '/self', '/workspace', '/profile', '/auth'];

    for (const testRoute of testCases) {
      const staticEntry = ledger.routes[testRoute];
      if (staticEntry) {
        const resolved = resolveRouteMetabolicProfile(testRoute);
        expect(resolved.intensity).toBe(staticEntry.intensity);
      }
    }
  });

  it('INVARIANT 4 (Complexity Sanity): Interactive screens with unvirtualized loops and motion/GPU are never nominal', () => {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf8');
    const ledger: GeneratedLedger = JSON.parse(raw);

    for (const entry of Object.values(ledger.routes)) {
      // If a route has unvirtualized loops AND motion or GPU markers, it must be heavy or intensive
      if (
        entry.breakdown.unvirtualizedLoops >= 1 &&
        (entry.breakdown.motion.length > 0 || entry.breakdown.gpu.length > 0)
      ) {
        expect(entry.intensity).not.toBe('nominal');
      }
    }
  });
});
