import { readFileSync } from 'node:fs';
import { dispatchCoordinationRequest } from '../services/CoordinationService.js';

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  process.stdout.write(
    'Usage: pnpm --filter @repo/platform-mcp coordination <request.json|-> [--store database.sqlite]\nActions: inventory, context, create, status, record, check, lifecycle. Lifecycle requests manage versioned artifacts, role tasks, reviews and real checks. JSON requests use the same schema as sovereign_coordination.\n',
  );
  process.exitCode = args.length === 0 ? 2 : 0;
} else {
  try {
    if (args.length !== 1 && !(args.length === 3 && args[1] === '--store'))
      throw new Error('Expected request file and optional --store path');
    const file = args[0];
    if (!file) throw new Error('Missing request file');
    const request: unknown = JSON.parse(readFileSync(file === '-' ? 0 : file, 'utf8'));
    const result = await dispatchCoordinationRequest(request, args[2] ? { databasePath: args[2] } : {});
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n`,
    );
    process.exitCode = 1;
  }
}
