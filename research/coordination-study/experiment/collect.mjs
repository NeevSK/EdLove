import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const study = path.resolve(here, '..');
const root = process.argv[2];
const sessions = process.argv[3];
if (!root || !sessions) throw new Error('usage: node collect.mjs prepared-root scoped-session-directory');
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2));
const manifestFile = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const matching = execFileSync('rg', ['-l', '--fixed-strings', path.basename(root), sessions, '-g', '*.jsonl'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
const observed = [];
for (const file of matching) {
  const events = fs.readFileSync(file, 'utf8').trim().split('\n').map(JSON.parse);
  const meta = events.find((event) => event.type === 'session_meta')?.payload;
  const spawn = meta?.source?.subagent?.thread_spawn;
  if (spawn?.parent_thread_id !== '01a1c971-6dff-7de1-946c-ded959a6e656' || !/^\/root\/work_\d+$/.test(spawn.agent_path ?? '')) continue;
  const index = Number(spawn.agent_path.split('_').at(-1)) - 1;
  const trial = manifest.trials[index];
  if (!trial) throw new Error(`Unknown worker ${spawn.agent_path}`);
  const outputDir = path.join(study, 'trials', trial.trialId);
  fs.mkdirSync(outputDir, { recursive: true });
  const contexts = events.filter((event) => event.type === 'turn_context').map((event) => ({ model: event.payload.model, effort: event.payload.effort }));
  const calls = events.filter((event) => event.type === 'response_item' && ['function_call', 'custom_tool_call'].includes(event.payload.type));
  const kept = events.filter((event) => event.type === 'response_item' && (['function_call', 'custom_tool_call', 'function_call_output', 'custom_tool_call_output', 'agent_message'].includes(event.payload.type) || event.payload.type === 'message' && ['user', 'assistant'].includes(event.payload.role)) || event.type === 'event_msg' && ['task_started', 'task_complete'].includes(event.payload.type));
  save(path.join(outputDir, 'transcript.json'), { sessionId: meta.id, agentPath: spawn.agent_path, sourceTranscript: file, extraction: 'User requests, parent messages, tool calls and outputs, assistant messages, task lifecycle. System/developer instructions and private reasoning excluded.', events: kept });
  const final = events.filter((event) => event.type === 'response_item' && event.payload.type === 'message' && event.payload.role === 'assistant' && event.payload.phase === 'final_answer').at(-1);
  const finalText = final?.payload.content?.map((item) => item.text ?? '').join('') ?? null;
  const originalDirectory = trial.originalDirectory ?? trial.directory;
  const responseFile = path.join(originalDirectory, 'response.json');
  let output = null;
  if (finalText) {
    fs.writeFileSync(path.join(outputDir, 'raw-final.txt'), finalText);
    try { output = JSON.parse(finalText.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch {}
  }
  if (!output && fs.existsSync(responseFile)) output = JSON.parse(fs.readFileSync(responseFile, 'utf8'));
  if (output) {
    save(path.join(outputDir, 'response.json'), output);
    const snapshot = path.join(outputDir, 'work');
    fs.cpSync(originalDirectory, snapshot, { recursive: true });
    Object.assign(trial, { originalDirectory, directory: snapshot, packetFile: path.join(snapshot, 'work.json') });
  }
  const usage = events.filter((event) => event.type === 'event_msg' && event.payload.type === 'token_count' && event.payload.info).at(-1)?.payload.info?.total_token_usage ?? null;
  const errors = events.filter((event) => event.type === 'event_msg' && event.payload.type === 'task_complete' && event.payload.last_agent_message?.includes('usage limit')).map((event) => event.payload.last_agent_message);
  const observedRecord = { collectedAt: new Date().toISOString(), sessionId: meta.id, agentPath: spawn.agent_path, contexts, toolActionsObserved: calls.length, toolActionDefinition: 'Model-visible function/custom tool invocations. Nested calls inside the exec entrypoint are retained in transcripts but not separately counted.', tokens: usage, monetaryCost: null, infrastructureErrors: errors, hasFinal: Boolean(finalText), hasOutput: Boolean(output), prototypeSha256: null };
  save(path.join(outputDir, 'observation.json'), observedRecord);
  Object.assign(trial, { status: output ? 'completed' : 'in_flight_or_failed', model: contexts.at(-1)?.model ?? null, reasoningEffort: contexts.at(-1)?.effort ?? null, toolActionsObserved: calls.length, tokens: usage, transcript: path.join(outputDir, 'transcript.json'), output: output ? path.join(outputDir, 'response.json') : null, monetaryCost: null });
  observed.push({ trialId: trial.trialId, status: trial.status, toolActions: calls.length });
}
save(manifestFile, manifest);
save(path.join(study, 'trial-manifest.json'), manifest);
console.log(JSON.stringify({ observed, completed: manifest.trials.filter((trial) => trial.status === 'completed').length, total: manifest.trials.length }, null, 2));
