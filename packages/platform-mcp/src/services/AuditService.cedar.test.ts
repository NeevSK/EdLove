import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runCommand } from '../utils/execution.js';
import { AuditService } from './AuditService.js';
import { DocumentService } from './DocumentService.js';

vi.mock('../utils/execution.js', () => ({
  executeSovereignTool: vi.fn(),
  runPowerShellScript: vi.fn(),
  runCommand: vi.fn(),
}));

describe('Cedar audit gateway', () => {
  const service = new AuditService(new DocumentService());
  beforeEach(() => vi.resetAllMocks());

  it('reports failed validation as a tool error', () => {
    vi.mocked(runCommand).mockReturnValue({
      ok: false,
      stdout: '12 files failed',
      stderr: '',
      combined: '12 files failed',
      exitCode: 1,
      command: process.execPath,
      args: [],
    });
    expect(service.handleCedarAudit(false)).toMatchObject({
      isError: true,
      content: [{ text: '12 files failed' }],
    });
  });

  it('requests the scenario mode and returns its results', () => {
    vi.mocked(runCommand).mockReturnValue({
      ok: true,
      stdout: '3 passed',
      stderr: '',
      combined: '3 passed',
      exitCode: 0,
      command: process.execPath,
      args: [],
    });
    expect(service.handleCedarAudit(true)).toMatchObject({
      isError: false,
      content: [{ text: '3 passed' }],
    });
    expect(runCommand).toHaveBeenCalledWith(
      process.execPath,
      ['packages/policies/scripts/audit-cedar.mjs', '--scenarios'],
      expect.any(Object),
    );
  });
});
