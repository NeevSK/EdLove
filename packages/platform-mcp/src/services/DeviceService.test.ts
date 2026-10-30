import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AGENT_DEVICE_BIN,
  ARGENT_BIN,
  buildAgentDeviceArgs,
  buildArgentArgs,
  DeviceService,
} from './DeviceService.js';

describe('DeviceService argv builders & security invariants', () => {
  it('resolves physical binary targets on disk', () => {
    expect(fs.existsSync(AGENT_DEVICE_BIN)).toBe(true);
    expect(fs.existsSync(ARGENT_BIN)).toBe(true);
  });

  describe('agent-device argument mappings', () => {
    it('maps diagnostics and inspection correctly', () => {
      expect(buildAgentDeviceArgs('doctor', {})).toEqual(['doctor']);
      expect(buildAgentDeviceArgs('snapshot', {})).toEqual(['snapshot']);
      expect(buildAgentDeviceArgs('snapshot', { platform: 'android' })).toEqual([
        'snapshot',
        '--platform',
        'android',
      ]);
      expect(buildAgentDeviceArgs('screenshot', { platform: 'ios' })).toEqual([
        'screenshot',
        '--platform',
        'ios',
      ]);
    });

    it('maps interaction verbs with --settle default', () => {
      expect(buildAgentDeviceArgs('press', { element: 'submit-btn' })).toEqual([
        'press',
        'submit-btn',
        '--settle',
      ]);
      expect(buildAgentDeviceArgs('press', { element: 'submit-btn', settle: false })).toEqual([
        'press',
        'submit-btn',
      ]);
      expect(buildAgentDeviceArgs('tap', { x: 100, y: 250 })).toEqual([
        'press',
        '100',
        '250',
        '--settle',
      ]);
      expect(buildAgentDeviceArgs('scroll', { direction: 'down', amount: 500 })).toEqual([
        'scroll',
        'down',
        '500',
        '--settle',
      ]);
      expect(buildAgentDeviceArgs('type', { text: 'teacher@edlove.org' })).toEqual([
        'type',
        'teacher@edlove.org',
      ]);
    });

    it('maps element finders correctly', () => {
      expect(buildAgentDeviceArgs('find-text', { text: 'Sign In' })).toEqual([
        'find',
        'Sign In',
        'get',
      ]);
      expect(buildAgentDeviceArgs('find-text', { text: 'Sign In', first: true })).toEqual([
        'find',
        'Sign In',
        'get',
        '--first',
      ]);
      expect(buildAgentDeviceArgs('find-role', { role: 'button' })).toEqual([
        'find',
        'role=button',
        'get',
      ]);
    });

    it('maps logs, profiling, and metro bundler', () => {
      expect(buildAgentDeviceArgs('logs', {})).toEqual(['logs', 'doctor']);
      expect(buildAgentDeviceArgs('logs', { message: 'verger:checkpoint:1' })).toEqual([
        'logs',
        'mark',
        'verger:checkpoint:1',
      ]);
      expect(buildAgentDeviceArgs('profile', {})).toEqual(['perf', 'frames', '--json']);
      expect(buildAgentDeviceArgs('profile', { kind: 'memory' })).toEqual([
        'perf',
        'memory',
        'sample',
        '--json',
      ]);
      expect(buildAgentDeviceArgs('reload', {})).toEqual(['metro', 'reload']);
      expect(buildAgentDeviceArgs('clear-cache', {})).toEqual(['metro', 'reload']);
      expect(buildAgentDeviceArgs('mark', { message: 'sync-mark' })).toEqual([
        'logs',
        'mark',
        'sync-mark',
      ]);
      expect(buildAgentDeviceArgs('trace', { kind: 'perfetto', out: 'trace.pftrace' })).toEqual([
        'perf',
        'trace',
        'start',
        '--kind',
        'perfetto',
        '--out',
        'trace.pftrace',
      ]);
      expect(buildAgentDeviceArgs('trace', { stop: true })).toEqual([
        'perf',
        'trace',
        'stop',
        '--kind',
        'perfetto',
      ]);
      expect(buildAgentDeviceArgs('cpu-profile', { kind: 'simpleperf', out: 'cpu.perf.data' })).toEqual([
        'perf',
        'cpu',
        'profile',
        'start',
        '--kind',
        'simpleperf',
        '--out',
        'cpu.perf.data',
      ]);
    });

    it('returns null for unknown action', () => {
      expect(buildAgentDeviceArgs('unknown-action', {})).toBeNull();
    });
  });

  describe('argent argument mappings', () => {
    it('maps doctor to tools subcommand', () => {
      expect(buildArgentArgs('doctor', {})).toEqual(['tools']);
    });

    it('maps device actions with udid flag', () => {
      expect(buildArgentArgs('screenshot', { udid: 'emulator-5554' })).toEqual([
        'run',
        'screenshot',
        '--udid',
        'emulator-5554',
      ]);
      expect(buildArgentArgs('component-tree', { serial: 'A52-REAL' })).toEqual([
        'run',
        'debugger-component-tree',
        '--udid',
        'A52-REAL',
      ]);
      expect(
        buildArgentArgs('swipe', { deviceId: 'dev-1', direction: 'left' }),
      ).toEqual(['run', 'gesture-swipe', '--udid', 'dev-1', '--direction', 'left']);
      expect(buildArgentArgs('pinch', { udid: 'dev-1', scale: 0.5 })).toEqual([
        'run',
        'gesture-pinch',
        '--udid',
        'dev-1',
        '--scale',
        '0.5',
      ]);
      expect(buildArgentArgs('wait', { udid: 'dev-1', condition: 'visible' })).toEqual([
        'run',
        'await-ui-element',
        '--udid',
        'dev-1',
        '--condition',
        'visible',
      ]);
    });

    it('maps visual-diff and custom tool fallback', () => {
      expect(buildArgentArgs('visual-diff', { baseline: 'b.png', current: 'c.png' })).toEqual([
        'run',
        'screenshot-diff',
        '--baseline',
        'b.png',
        '--current',
        'c.png',
      ]);
      expect(buildArgentArgs('custom-tool', { udid: 'dev-1', args: ['--custom', '1'] })).toEqual([
        'run',
        'custom-tool',
        '--udid',
        'dev-1',
        '--custom',
        '1',
      ]);
      expect(buildArgentArgs('trace', { udid: 'dev-1' })).toEqual([
        'run',
        'debugger-profiler',
        '--udid',
        'dev-1',
      ]);
    });
  });

  describe('DeviceService handler capabilities', () => {
    it('returns valid JSON capabilities manifest', async () => {
      const service = new DeviceService();
      const result = await service.handleDeviceAction('capabilities');
      expect(result.isError).toBe(false);
      expect(result.content[0]).toBeDefined();
      const manifest = JSON.parse(result.content[0]!.text);
      expect(manifest.agentDevice).toContain('press');
      expect(manifest.agentDevice).toContain('snapshot');
      expect(manifest.argent).toContain('screenshot');
      expect(manifest.argent).toContain('component-tree');
    });

    it('returns structured error for unsupported action', async () => {
      const service = new DeviceService();
      const result = await service.handleDeviceAction('non-existent');
      expect(result.isError).toBe(true);
      expect(result.content[0]).toBeDefined();
      expect(result.content[0]!.text).toContain('Unsupported action "non-existent"');
    });
  });
});
