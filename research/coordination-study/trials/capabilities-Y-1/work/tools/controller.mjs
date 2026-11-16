import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const stages = ['context', 'analysis', 'verification', 'reconciliation'];
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const exact = (value, keys) => object(value) && Object.keys(value).every((key) => keys.includes(key));
const string = (value) => typeof value === 'string' && value.trim().length > 0;

export function loadSources(packetFile) {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  return packet.sources.map((source) => ({
    id: source.id,
    sha256: sha(fs.readFileSync(path.resolve(path.dirname(packetFile), source.file))),
  }));
}

export function createState(packetFile) {
  return { version: 1, workId: JSON.parse(fs.readFileSync(packetFile, 'utf8')).workId, events: [] };
}

function actionError(action) {
  if (!exact(action, ['id', 'kind', 'stage', 'summary', 'evidence', 'unresolved'])) return 'invalid_action_shape';
  if (!string(action.id) || action.kind !== 'record' || !stages.includes(action.stage) || !string(action.summary)) return 'invalid_action_shape';
  if (!Array.isArray(action.unresolved) || !action.unresolved.every(string)) return 'invalid_unresolved';
  if (!Array.isArray(action.evidence) || !action.evidence.length) return 'incomplete_evidence';
  if (!action.evidence.every((item) => exact(item, ['sourceId', 'sha256']) && string(item.sourceId) && /^[a-f0-9]{64}$/.test(item.sha256))) return 'invalid_evidence';
  if (new Set(action.evidence.map((item) => item.sourceId)).size !== action.evidence.length) return 'duplicate_evidence';
  return null;
}

export function project(state, sources) {
  if (!exact(state, ['version', 'workId', 'events']) || state.version !== 1 || !string(state.workId) || !Array.isArray(state.events)) throw new Error('invalid_state');
  const current = new Map(sources.map((source) => [source.id, source.sha256]));
  const completed = [];
  const invalidated = [];
  let stale = false;
  let unresolved = [];
  const ids = new Set();
  for (const [eventIndex, event] of state.events.entries()) {
    const error = actionError(event);
    if (error || ids.has(event.id)) throw new Error('invalid_event_history');
    ids.add(event.id);
    if (stages[eventIndex] !== event.stage) throw new Error('invalid_event_order');
    const changed = event.evidence.some((item) => current.get(item.sourceId) !== item.sha256);
    if (changed || stale) {
      stale = true;
      if (!invalidated.includes(event.stage)) invalidated.push(event.stage);
    } else {
      completed.push(event.stage);
      unresolved = event.unresolved;
    }
  }
  return { workId: state.workId, completed, invalidated, unresolved, nextAction: stages[completed.length] ?? (unresolved.length ? 'resolve_authority' : 'complete'), canComplete: completed.length === stages.length && unresolved.length === 0 };
}

export function record(state, action, sources) {
  const error = actionError(action);
  if (error) throw new Error(error);
  const existing = state.events.find((event) => event.id === action.id);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(action)) throw new Error('action_id_conflict');
    return { state, duplicate: true, status: project(state, sources) };
  }
  const status = project(state, sources);
  if (status.invalidated.length) throw new Error('stale_inputs_require_rebase');
  if (action.stage !== status.nextAction) throw new Error('missing_prerequisite');
  const sourceMap = new Map(sources.map((source) => [source.id, source.sha256]));
  if (action.evidence.some((item) => sourceMap.get(item.sourceId) !== item.sha256)) throw new Error('stale_or_unknown_evidence');
  const next = { ...state, events: [...state.events, action] };
  return { state: next, duplicate: false, status: project(next, sources) };
}

function writeState(file, state) {
  const temporary = `${file}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(state, null, 2), { flag: 'wx' });
  fs.renameSync(temporary, file);
}

export function run(argv) {
  const [command, packetFile, stateFile, actionFile] = argv;
  if (!packetFile || !stateFile || !['init', 'status', 'record', 'rebase'].includes(command)) throw new Error('usage: controller.mjs init|status|record|rebase work.json state.json [action.json]');
  const sources = loadSources(packetFile);
  if (command === 'init') {
    if (fs.existsSync(stateFile)) throw new Error('state_already_exists');
    writeState(stateFile, createState(packetFile));
  }
  let state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  if (state.workId !== JSON.parse(fs.readFileSync(packetFile, 'utf8')).workId) throw new Error('work_id_mismatch');
  if (command === 'record') {
    const result = record(state, JSON.parse(fs.readFileSync(actionFile, 'utf8')), sources);
    if (!result.duplicate) writeState(stateFile, result.state);
    state = result.state;
  }
  if (command === 'rebase') {
    const status = project(state, sources);
    const first = status.invalidated[0];
    if (first) {
      const archive = `${stateFile}.previous-${crypto.randomUUID()}.json`;
      fs.copyFileSync(stateFile, archive, fs.constants.COPYFILE_EXCL);
      state = { ...state, events: state.events.slice(0, state.events.findIndex((event) => event.stage === first)) };
      writeState(stateFile, state);
    }
  }
  return { ...project(state, sources), sources, guarantees: 'Checks evidence references, source freshness and declared stage order. It does not establish truthful interpretation, actual reading, authorization identity, or resistance to direct local file edits.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(run(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error(JSON.stringify({ error: error.message })); process.exitCode = 1; }
}
