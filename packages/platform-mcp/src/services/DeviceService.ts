import { ROOT_DIR } from '../utils/constants.js';
import { runCommand } from '../utils/execution.js';

function toMcpText(stdout: string, isError?: boolean) {
  return {
    content: [{ type: 'text' as const, text: stdout }],
    isError: Boolean(isError),
  };
}

type DeviceParams = Record<string, any>;

// agent-device (Callstack): action -> argv fragments
const AGENT_DEVICE_ACTIONS: Record<string, (params: DeviceParams) => string[]> = {
  doctor: () => ['doctor'],
  snapshot: (p) => (p.platform ? ['snapshot', '--platform', p.platform] : ['snapshot']),
  screenshot: (p) => (p.platform ? ['screenshot', '--platform', p.platform] : ['screenshot']),
  open_app: (p) => {
    const args = ['open'];
    if (p.appId) args.push(p.appId);
    if (p.platform) args.push('--platform', p.platform);
    return args;
  },
  press: (p) => (p.element ? ['press', p.element] : ['press']),
  type: (p) => (p.text ? ['type', p.text] : ['type']),
  scroll: (p) => (p.direction ? ['scroll', p.direction] : ['scroll']),
  tap: (p) =>
    p.x !== undefined && p.y !== undefined ? ['tap', String(p.x), String(p.y)] : ['tap'],
  logs: () => ['logs'],
};

// argent (SWM): action -> argv fragments; unknown actions fall through to `run`
function buildArgentArgs(action: string, params: DeviceParams): string[] {
  const fixed: Record<string, string[]> = {
    doctor: ['tools'],
    screenshot: ['screenshot'],
    logs: ['logs'],
  };
  if (fixed[action]) return fixed[action];
  const extra = params.args && Array.isArray(params.args) ? params.args : [];
  return ['run', action, ...extra];
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
