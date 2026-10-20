import { ROOT_DIR } from '../utils/constants.js';
import { runCommand } from '../utils/execution.js';
import { captureDeviceProfile, type DeviceProfileCaptureInput } from './deviceProfileCapture.js';

function toMcpText(stdout: string, isError?: boolean) {
  return {
    content: [{ type: 'text' as const, text: stdout }],
    isError: Boolean(isError),
  };
}

type DeviceParams = Record<string, any>;

// ─── agent-device (Callstack) ──────────────────────────────────────────────
// Maps sovereign_device action verbs → argv fragments for the `agent-device` CLI.
// Capabilities: UI inspection, interaction, evidence capture, Metro bundler control.
const AGENT_DEVICE_ACTIONS: Record<string, (params: DeviceParams) => string[]> = {
  // ── Diagnostics ────────────────────────────────────────────────────────────
  doctor: () => ['doctor'],

  // ── UI Inspection ──────────────────────────────────────────────────────────
  /** Accessibility tree snapshot (XML + bounding boxes) */
  snapshot: (p) => (p.platform ? ['snapshot', '--platform', p.platform] : ['snapshot']),

  // ── Visuals ────────────────────────────────────────────────────────────────
  screenshot: (p) => (p.platform ? ['screenshot', '--platform', p.platform] : ['screenshot']),

  // ── App Lifecycle ──────────────────────────────────────────────────────────
  open_app: (p) => {
    const args = ['open'];
    if (p.appId) args.push(p.appId);
    if (p.platform) args.push('--platform', p.platform);
    return args;
  },

  // ── Interaction ────────────────────────────────────────────────────────────
  press: (p) => (p.element ? ['press', p.element] : ['press']),
  type: (p) => (p.text ? ['type', p.text] : ['type']),
  scroll: (p) => (p.direction ? ['scroll', p.direction] : ['scroll']),
  tap: (p) =>
    p.x !== undefined && p.y !== undefined ? ['tap', String(p.x), String(p.y)] : ['tap'],

  // ── Element Finders (0.20.x ./finders + ./selectors exports) ─────────────
  /** Find element by visible text content */
  'find-text': (p) => {
    const args = ['find', '--text', String(p.text ?? '')];
    if (p.platform) args.push('--platform', p.platform);
    return args;
  },
  /** Find element by ARIA role (e.g. 'button', 'textbox') */
  'find-role': (p) => {
    const args = ['find', '--role', String(p.role ?? '')];
    if (p.label) args.push('--label', String(p.label));
    if (p.platform) args.push('--platform', p.platform);
    return args;
  },

  // ── Evidence & Logs ───────────────────────────────────────────────────────
  logs: () => ['logs'],
  /** Dump network traffic captured by the device proxy */
  network: () => ['network'],

  // ── Metro Bundler Control (./metro export, 0.20.x) ────────────────────────
  /** Hot-reload the Metro JS bundle without restarting the app */
  reload: () => ['metro', 'reload'],
  /** Clear Metro's transform cache and reload */
  'clear-cache': () => ['metro', 'clear-cache'],

  // ── Performance & Profiling ───────────────────────────────────────────────
  /** Capture a CPU/memory sample (returns JSON) */
  profile: (p) => {
    const args = ['profile'];
    if (p.duration) args.push('--duration', String(p.duration));
    return args;
  },
};

// ─── argent (SWM) ─────────────────────────────────────────────────────────
// Maps sovereign_device action verbs → argv fragments for the `argent` CLI.
// Capabilities expand significantly across 0.21–0.23 with gestures, visual
const ARGENT_ACTIONS: Record<string, (params: DeviceParams) => string[]> = {
  doctor: () => ['tools'],
  screenshot: () => ['screenshot'],
  'visual-diff': (p) => (p.baseline ? ['visual-diff', '--baseline', String(p.baseline)] : ['visual-diff']),
  record: (p) => {
    if (p.stop) {
      const args = ['record', '--stop'];
      if (p.output) args.push('--output', String(p.output));
      return args;
    }
    return ['record'];
  },
  'component-tree': () => ['component-tree'],
  swipe: (p) => {
    const args = ['swipe', String(p.direction ?? 'up')];
    if (p.element) args.push('--element', String(p.element));
    return args;
  },
  pinch: (p) => {
    const args = ['pinch', String(p.direction ?? 'in')];
    if (p.scale !== undefined) args.push('--scale', String(p.scale));
    return args;
  },
  'long-press': (p) => {
    const args = ['long-press'];
    if (p.element) args.push(String(p.element));
    if (p.duration !== undefined) args.push('--duration', String(p.duration));
    return args;
  },
  wait: (p) => {
    const args = ['wait', String(p.element ?? '')];
    if (p.timeout !== undefined) args.push('--timeout', String(p.timeout));
    return args;
  },
  assert: (p) => {
    const args = ['assert', String(p.element ?? '')];
    if (p.text) args.push('--text', String(p.text));
    return args;
  },
  network: () => ['network'],
  logs: () => ['logs'],
};

function buildArgentArgs(action: string, params: DeviceParams): string[] {
  const handler = ARGENT_ACTIONS[action];
  if (handler) {
    return handler(params);
  }
  const extra = Array.isArray(params.args) ? (params.args as string[]) : [];
  return ['run', action, ...extra];
}

export class DeviceService {
  async handleDeviceAction(action: string, params: DeviceParams = {}) {
    const loggedParams = action === 'capture_profile' ? { ...params, serial: '<redacted-device>' } : params;
    console.error(`Sovereign Device Action: "${action}" with params`, loggedParams);

    if (action === 'capture_profile') {
      try {
        const result = await captureDeviceProfile(params as DeviceProfileCaptureInput);
        return toMcpText(JSON.stringify(result.manifest, null, 2));
      } catch (err) {
        return toMcpText(err instanceof Error ? err.message : String(err), true);
      }
    }

    const command = 'pnpm';
    const base: string[] = ['--filter', '@repo/platform-mcp', 'exec'];

    if (params.tool === 'argent') {
      return this.execute(command, [...base, 'argent', ...buildArgentArgs(action, params)]);
    }

    // Default to agent-device (Callstack)
    const builder = AGENT_DEVICE_ACTIONS[action];
    if (!builder) return toMcpText(`Unsupported action "${action}" for agent-device`, true);
    return this.execute(command, [...base, 'agent-device', ...builder(params)]);
  }

  private execute(command: string, args: string[]) {
    try {
      const result = runCommand(command, args, { cwd: ROOT_DIR, shell: true });
      return toMcpText(result.combined, !result.ok);
    } catch (err: any) {
      return toMcpText(err.message || String(err), true);
    }
  }
}
