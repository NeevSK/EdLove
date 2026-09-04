import { ROOT_DIR } from '../utils/constants.js';
import { runCommand } from '../utils/execution.js';

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
// regression, network inspection, RN component tree, and video recording.
function buildArgentArgs(action: string, params: DeviceParams): string[] {
  switch (action) {
    // ── Diagnostics ──────────────────────────────────────────────────────────
    case 'doctor':
      return ['tools'];

    // ── Visuals ──────────────────────────────────────────────────────────────
    case 'screenshot':
      return ['screenshot'];
    /**
     * Visual regression diff against a baseline screenshot.
     * params: { baseline?: string } — path to baseline image; omit to save new baseline.
     */
    case 'visual-diff': {
      const args = ['visual-diff'];
      if (params.baseline) args.push('--baseline', String(params.baseline));
      return args;
    }

    // ── Video Recording (argent 0.23) ─────────────────────────────────────
    /**
     * Start or stop a screen recording session.
     * params: { stop?: boolean, output?: string }
     */
    case 'record': {
      if (params.stop) {
        const args = ['record', '--stop'];
        if (params.output) args.push('--output', String(params.output));
        return args;
      }
      return ['record'];
    }

    // ── UI Inspection ────────────────────────────────────────────────────────
    /** React Native component tree (live, 0.22+) */
    case 'component-tree':
      return ['component-tree'];

    // ── Gestures (argent 0.21+) ──────────────────────────────────────────────
    /**
     * Swipe gesture.
     * params: { direction: 'up' | 'down' | 'left' | 'right', element?: string }
     */
    case 'swipe': {
      const args = ['swipe', String(params.direction ?? 'up')];
      if (params.element) args.push('--element', String(params.element));
      return args;
    }
    /**
     * Pinch / zoom gesture.
     * params: { direction: 'in' | 'out', scale?: number }
     */
    case 'pinch': {
      const args = ['pinch', String(params.direction ?? 'in')];
      if (params.scale !== undefined) args.push('--scale', String(params.scale));
      return args;
    }
    /**
     * Long press on an element.
     * params: { element: string, duration?: number (ms) }
     */
    case 'long-press': {
      const args = ['long-press'];
      if (params.element) args.push(String(params.element));
      if (params.duration !== undefined) args.push('--duration', String(params.duration));
      return args;
    }

    // ── Element Waiting & Assertions (argent 0.21+) ───────────────────────
    /**
     * Wait until an element appears (or a timeout elapses).
     * params: { element: string, timeout?: number (ms, default 5000) }
     */
    case 'wait': {
      const args = ['wait', String(params.element ?? '')];
      if (params.timeout !== undefined) args.push('--timeout', String(params.timeout));
      return args;
    }
    /**
     * Assert that an element exists / has specific text.
     * params: { element: string, text?: string }
     */
    case 'assert': {
      const args = ['assert', String(params.element ?? '')];
      if (params.text) args.push('--text', String(params.text));
      return args;
    }

    // ── Network Inspection (argent 0.21+) ─────────────────────────────────
    /** Dump captured native-level network requests */
    case 'network':
      return ['network'];

    // ── Logs ─────────────────────────────────────────────────────────────────
    case 'logs':
      return ['logs'];

    // ── Fallback: pass-through ────────────────────────────────────────────
    default: {
      const extra = Array.isArray(params.args) ? (params.args as string[]) : [];
      return ['run', action, ...extra];
    }
  }
}

export class DeviceService {
  async handleDeviceAction(action: string, params: DeviceParams = {}) {
    console.error(`Sovereign Device Action: "${action}" with params`, params);

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
