import { ROOT_DIR } from '../utils/constants.js';
import { runCommand } from '../utils/execution.js';

function toMcpText(stdout: string, isError?: boolean) {
  return {
    content: [{ type: 'text' as const, text: stdout }],
    isError: Boolean(isError),
  };
}

export class DeviceService {
  async handleDeviceAction(action: string, params: Record<string, any> = {}) {
    console.error(`Sovereign Device Action: "${action}" with params`, params);

    // Map action to CLI commands
    const command = 'pnpm';
    const args: string[] = ['--filter', '@repo/platform-mcp', 'exec'];

    if (params.tool === 'argent') {
      args.push('argent');
      switch (action) {
        case 'doctor':
          args.push('tools'); // argent tools lists capabilities / verifies connection
          break;
        case 'screenshot':
          args.push('screenshot');
          break;
        case 'logs':
          args.push('logs');
          break;
        default:
          args.push('run', action);
          if (params.args && Array.isArray(params.args)) {
            args.push(...params.args);
          }
          break;
      }
    } else {
      // Default to agent-device (Callstack)
      args.push('agent-device');
      switch (action) {
        case 'doctor':
          args.push('doctor');
          break;
        case 'snapshot':
          args.push('snapshot');
          if (params.platform) args.push('--platform', params.platform);
          break;
        case 'screenshot':
          args.push('screenshot');
          if (params.platform) args.push('--platform', params.platform);
          break;
        case 'open_app':
          args.push('open');
          if (params.appId) args.push(params.appId);
          if (params.platform) args.push('--platform', params.platform);
          break;
        case 'press':
          args.push('press');
          if (params.element) args.push(params.element);
          break;
        case 'type':
          args.push('type');
          if (params.text) args.push(params.text);
          break;
        case 'scroll':
          args.push('scroll');
          if (params.direction) args.push(params.direction);
          break;
        case 'tap':
          args.push('tap');
          if (params.x !== undefined && params.y !== undefined) {
            args.push(String(params.x), String(params.y));
          }
          break;
        case 'logs':
          args.push('logs');
          break;
        default:
          return toMcpText(`Unsupported action "${action}" for agent-device`, true);
      }
    }

    try {
      const result = runCommand(command, args, { cwd: ROOT_DIR, shell: true });
      return toMcpText(result.combined, !result.ok);
    } catch (err: any) {
      return toMcpText(err.message || String(err), true);
    }
  }
}
