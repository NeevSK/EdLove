import { existsSync, statSync, writeFileSync } from "node:fs";
import path from 'node:path';

const [bundlePath, sourcemapPath, reportPath] = process.argv.slice(2);

if (!bundlePath || !sourcemapPath || !reportPath) {
  console.error('Usage: node scripts/report-mobile-bundle.mjs <bundle> <sourcemap> <report>');
  process.exit(2);
}

const exists = existsSync(bundlePath) && existsSync(sourcemapPath);
const report = {
  status: exists ? 'ready' : 'missing',
  bundle: { path: path.resolve(bundlePath), bytes: exists ? statSync(bundlePath).size : 0 },
  sourcemap: { path: path.resolve(sourcemapPath), bytes: exists ? statSync(sourcemapPath).size : 0 },
  generatedAt: new Date().toISOString(),
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
