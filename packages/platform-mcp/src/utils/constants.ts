import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Repo root (from `packages/platform-mcp/src/utils` -> ../../../../)
export const ROOT_DIR = path.resolve(path.join(__dirname, '..', '..', '..', '..'));
