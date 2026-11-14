#!/usr/bin/env node
/**
 * @file scripts/hermes-bench.mjs
 * Deterministic Heap Allocation & Nursery GC Stress Benchmark.
 *
 * Micro-benchmarks critical transaction paths (PowerSync batching, Layout sentinels)
 * against strict allocation budgets to catch Hermes nursery GC stalls and heap bloat.
 */

import { performance } from 'node:perf_hooks';
import { createLayoutSentinel } from '../packages/ui/src/sentinels/layoutSentinel.ts';

console.log('🔬 [HERMES BENCHMARK] Profiling Allocation Velocity & Memory Budgets...\n');

const results = [];

function formatBytes(bytes) {
  if (Math.abs(bytes) < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

async function benchmark(name, budgetBytes, iterations, setup, fn) {
  if (typeof global.gc === 'function') global.gc();

  const ctx = setup ? await setup() : undefined;

  const startMem = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    await fn(i, ctx);
  }

  const endTime = performance.now();
  const endMem = process.memoryUsage().heapUsed;
  const heapDelta = endMem - startMem;
  const durationMs = endTime - startTime;
  const passed = heapDelta <= budgetBytes;

  const result = {
    name,
    iterations,
    heapDelta,
    budgetBytes,
    durationMs: durationMs.toFixed(2),
    passed,
  };
  results.push(result);

  const badge = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${badge} ${name}`);
  console.log(`   Iterations: ${iterations}`);
  console.log(`   Duration:   ${result.durationMs}ms (${((durationMs / iterations) * 1000).toFixed(2)} µs/op)`);
  console.log(`   Heap Delta: ${formatBytes(heapDelta)} (Budget: ${formatBytes(budgetBytes)})\n`);

  return passed;
}

// 1. LayoutLoopSentinel Allocation Benchmark (Single mounted instance receiving 100 rapid dispatches)
await benchmark(
  'LayoutLoopSentinel: 100 Dispatches on Mounted Component',
  25 * 1024, // 25 KB budget
  100,
  () => {
    return createLayoutSentinel('BenchCard', undefined, 3, 200);
  },
  (i, sentinel) => {
    sentinel({
      nativeEvent: { layout: { x: 0, y: 0, width: 100, height: 100 + i } },
    });
  }
);

// 2. PowerSync Batch Outbox: 50 Mutations (Standard sync batch size)
await benchmark(
  'PowerSync Batch Outbox: 50 Mutation Deserializations (Standard Sync Batch)',
  45 * 1024, // 45 KB budget
  50,
  () => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: `mut-${i}`,
      table: 'classroom_students',
      op: 'INSERT',
      data: JSON.stringify({
        id: `student-${i}`,
        classroom_id: 'class-123',
        account_id: 'acc-456',
        enrolled_at: '2026-10-17T00:00:00Z',
      }),
    }));
  },
  (i, mutations) => {
    const mut = mutations[i];
    const parsed = JSON.parse(mut.data);
    if (!parsed.classroom_id) throw new Error('Failed');
  }
);

console.log('======================================================');
console.log('          HERMES ALLOCATION BUDGET REPORT             ');
console.log('======================================================');

const failed = results.filter((r) => !r.passed);

if (failed.length === 0) {
  console.log('✨ ALL 2 CRITICAL DATA PATHS COMPLIED WITH STRICT ALLOCATION BUDGETS!\n');
  process.exit(0);
} else {
  console.error(`💥 ${failed.length} data paths exceeded memory allocation budgets!`);
  process.exit(1);
}
