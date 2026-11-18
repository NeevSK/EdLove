const tests = [
  'packages/core/src/lib/sync/sync/SyncOrchestrator.ts',
  'apps/gurudevi-mobile',
  'apps/gurudevi-mobile/package.json',
  'packages/classroom/src/machines/attendanceSessionMachine.ts',
  'packages/admin/src/components/school/SchoolConnectionWelcome.tsx'
];

async function run() {
  for (const t of tests) {
    try {
      const res = await fetch('http://localhost:4242/api/file?path=' + encodeURIComponent(t));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      console.log(`[PASS] ${t} -> ${data.path} (${data.lines} items/lines, kind: ${data.kind || data.ext})`);
    } catch (err) {
      console.error(`[FAIL] ${t} -> ${err.message}`);
    }
  }
}

run();
