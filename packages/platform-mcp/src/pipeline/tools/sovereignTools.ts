import { AuditService } from '../../services/AuditService.js';
import { DiscoveryService } from '../../services/DiscoveryService.js';
import { MaintenanceService } from '../../services/MaintenanceService.js';
import { DeviceService } from '../../services/DeviceService.js';
import { DocumentService } from '../../services/DocumentService.js';
import { runCommand } from '../../utils/execution.js';
import { ROOT_DIR } from '../../utils/constants.js';

export interface SovereignToolsBundle {
  discovery: DiscoveryService;
  audit: AuditService;
  maintenance: MaintenanceService;
  device: DeviceService;
  verifyDopplerConfig: () => { ok: boolean; output: string };
  validateLikeC4Model: () => { ok: boolean; output: string };
  runAstGrep: (pattern: string, targetPath?: string) => { ok: boolean; output: string };
  runRipgrep: (query: string, target?: string) => { ok: boolean; output: string };
  runSdRefactor: (find: string, replace: string, filePath?: string) => { ok: boolean; output: string };
}

export function createSovereignTools(): SovereignToolsBundle {
  const document = new DocumentService();
  const discovery = new DiscoveryService();
  const audit = new AuditService(document);
  const maintenance = new MaintenanceService();
  const device = new DeviceService();

  return {
    discovery,
    audit,
    maintenance,
    device,

    verifyDopplerConfig: () => {
      const res = runCommand('node', ['scripts/verify-doppler-config.mjs', '--scope', 'workspace'], { cwd: ROOT_DIR });
      return { ok: res.ok, output: res.combined };
    },

    validateLikeC4Model: () => {
      const res = runCommand('pnpm', ['exec', 'likec4', 'validate', 'docs/architecture/model'], { cwd: ROOT_DIR });
      return { ok: res.ok, output: res.combined };
    },

    runAstGrep: (pattern: string, targetPath: string = '.') => {
      const res = runCommand('ast-grep', ['run', '--pattern', pattern, targetPath], { cwd: ROOT_DIR });
      return { ok: res.ok, output: res.combined };
    },

    runRipgrep: (query: string, target: string = '.') => {
      const result = discovery.handleGrepCode({ query, target });
      const text = result.content?.[0]?.text || '';
      return { ok: !result.isError, output: text };
    },

    runSdRefactor: (find: string, replace: string, filePath?: string) => {
      const result = maintenance.handleRefactorReplace({ find, replace, target: filePath });
      const text = result.content?.[0]?.text || '';
      return { ok: !result.isError, output: text };
    },
  };
}
