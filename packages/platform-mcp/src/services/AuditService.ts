import { execSync } from "child_process";
import { ROOT_DIR } from "../utils/constants.js";
import { normalizeTarget, readReport } from "../utils/pathUtils.js";

export class AuditService {
  handleAuditHygiene() {
    console.error("Running Hygiene Audit...");
    try {
      execSync("powershell -ExecutionPolicy Bypass -File scripts/check-hygiene.ps1", { cwd: ROOT_DIR });
    } catch (e) {
      console.error("Hygiene script reported errors (expected result).");
    }
    
    const circular = readReport("circular_deps.txt");
    const unused = readReport("unused_code.txt");
    const architecture = readReport("architecture.txt");

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ circular, unused, architecture }, null, 2)
      }]
    };
  }

  handleAuditA11y(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Auditing accessibility for: ${target}`);
    const output = execSync(
      `powershell -ExecutionPolicy Bypass -File scripts/audit-accessibility.ps1 -Target "${target}"`,
      { cwd: ROOT_DIR },
    ).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleCheckContrast(args: { fg: string; bg: string }) {
    console.error(`Checking contrast: ${args.fg} vs ${args.bg}`);
    const output = execSync(`node scripts/analyze-contrast.mjs "${args.fg}" "${args.bg}"`, {
      cwd: ROOT_DIR,
    }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleLintPackage(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Biome linting for: ${target}`);
    const output = execSync(
      `powershell -ExecutionPolicy Bypass -File scripts/biome-audit.ps1 -Target "${target}"`,
      { cwd: ROOT_DIR },
    ).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleAuditLegacyUI(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Auditing legacy UI for: ${target}`);
    const output = execSync(
      `powershell -ExecutionPolicy Bypass -File scripts/audit-legacy-ui.ps1 -Target "${target}"`,
      { cwd: ROOT_DIR },
    ).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleAuditPackageArchitecture(args: { target: string }) {
    const target = normalizeTarget(args.target);
    console.error(`Auditing package architecture for: ${target}`);
    const output = execSync(`node scripts/audit-package-architecture.mjs "${target}"`, {
      cwd: ROOT_DIR,
    }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleAuditColors() {
    console.error("Auditing design system colors...");
    const output = execSync("node scripts/audit-colors.js", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleCheckClassroomBoundaries() {
    console.error("Checking classroom package boundaries...");
    const output = execSync("node scripts/check-classroom-boundaries.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleCheckSelfBoundaries() {
    console.error("Checking self package boundaries...");
    const output = execSync("node scripts/check-self-boundaries.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }
}
