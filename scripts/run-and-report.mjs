import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

// Parse arguments manually to handle flags and arbitrary trailing args cleanly
const args = process.argv.slice(2);

const cmdIndex = args.indexOf('--cmd');
const nameIndex = args.indexOf('--name');
const cwdIndex = args.indexOf('--cwd');

if (cmdIndex === -1 || !args[cmdIndex + 1]) {
  console.error('Usage: node run-and-report.mjs --cmd "command" [--name "name"] [--cwd "dir"]');
  process.exit(1);
}

let cmd = args[cmdIndex + 1];
const name = nameIndex !== -1 ? args[nameIndex + 1] : cmd.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50);
const cwd = cwdIndex !== -1 ? resolve(ROOT_DIR, args[cwdIndex + 1]) : process.cwd();

// Check if report should be bypassed
const noReport = args.includes('--no-report');

// Gather any extra arguments (not part of the parser options) to append to the command
const parsedIndices = new Set([cmdIndex, cmdIndex + 1]);
if (nameIndex !== -1) { parsedIndices.add(nameIndex); parsedIndices.add(nameIndex + 1); }
if (cwdIndex !== -1) { parsedIndices.add(cwdIndex); parsedIndices.add(cwdIndex + 1); }

const extraArgs = args.filter((_, idx) => !parsedIndices.has(idx) && args[idx] !== '--no-report');

if (extraArgs.length > 0) {
  cmd = `${cmd} ${extraArgs.join(' ')}`;
}

if (noReport) {
  console.log(`>>> Running command directly (no report): ${cmd}`);
  const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
  const shellArgs = process.platform === 'win32' ? ['-NoProfile', '-Command', cmd] : ['-c', cmd];
  
  const child = spawn(shell, shellArgs, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  
  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
} else {
  const startTime = new Date();
  const reportsDir = join(ROOT_DIR, 'reports');
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }

  const logFile = join(reportsDir, `run-${name}.log`);
  const reportFile = join(reportsDir, `run-${name}-report.txt`);

  console.log(`>>> Starting Process: ${startTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)`);
  console.log(`>>> Command: ${cmd}`);
  console.log(`>>> Working Dir: ${cwd}`);
  console.log(`>>> Log output: ${logFile}`);
  console.log('-'.repeat(80));

  const rawLines = [];
  let exitCode = 0;

  const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
  const shellArgs = process.platform === 'win32' ? ['-NoProfile', '-Command', `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${cmd}`] : ['-c', cmd];

  const child = spawn(shell, shellArgs, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });

  const stripAnsi = (str) => {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  };

  child.stdout.on('data', (data) => {
    const str = data.toString('utf8');
    process.stdout.write(str);
    rawLines.push(...stripAnsi(str).split('\n'));
  });

  child.stderr.on('data', (data) => {
    const str = data.toString('utf8');
    process.stderr.write(str);
    rawLines.push(...stripAnsi(str).split('\n'));
  });

  let wasExited = false;
  const generateAndExit = (code) => {
    if (wasExited) return;
    wasExited = true;
    exitCode = code ?? 0;

    try {
      // Save raw log encoded as UTF-8
      writeFileSync(logFile, rawLines.join('\n'), 'utf8');
    } catch (err) {
      console.error(`!!! Failed to write raw log: ${err.message}`);
    }

    // Parse logs for findings
    const findings = [];
    let currentError = null;

    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let file = null;
      let lineN = '1';
      let col = '1';
      let code = '';
      let msg = '';
      let severity = 'error';
      let isMatch = false;

      // 1. TypeScript format
      const tsMatch = trimmed.match(/^(.*?)(?:\(|\:)(\d+)(?:[\, \:]+(\d+))?[\)\s\-\:]*\s+(error|warning)\s+TS(\d+):\s*(.*)$/);
      if (tsMatch) {
        file = tsMatch[1].trim();
        lineN = tsMatch[2];
        col = tsMatch[3] || '1';
        severity = tsMatch[4];
        code = `TS${tsMatch[5]}`;
        msg = tsMatch[6];
        isMatch = true;
      }
      // 2. Biome/ESLint format
      else {
        const lintMatch = trimmed.match(/^(.*?\.[a-zA-Z0-9]+)[\:\s]+(\d+)[\:\s]+(\d+)[\s\-]+(error|warning|info)[\:\s]+(.*)$/);
        if (lintMatch) {
          file = lintMatch[1].trim();
          lineN = lintMatch[2];
          col = lintMatch[3];
          severity = lintMatch[4];
          code = 'LINT';
          msg = lintMatch[5];
          isMatch = true;
        }
        // 3. Generic error format (extract specific JS errors or Unhandled Rejections)
        else {
          const genMatch = trimmed.match(/^(?:Web\s+|\[)?(Error|TypeError|RangeError|ReferenceError|SyntaxError|DataCloneError|UnhandledPromiseRejection|FATAL|ERR_[A-Z_]+)\b\s*[:\s\]]+(.*)$/i);
          if (genMatch) {
            severity = 'error';
            code = genMatch[1].toUpperCase();
            msg = genMatch[2];
            isMatch = true;
          }
        }
      }

      if (isMatch) {
        let cleanFile = file;
        let fileUrl = null;

        if (file) {
          try {
            const checkPaths = [resolve(cwd, file), resolve(ROOT_DIR, file)];
            for (const p of checkPaths) {
              if (existsSync(p)) {
                cleanFile = relative(ROOT_DIR, p);
                fileUrl = `file:///${p.replace(/\\/g, '/')}`;
                break;
              }
            }
          } catch {}
        }

        currentError = {
          file: cleanFile,
          fileUrl,
          line: lineN,
          col,
          code,
          severity,
          message: msg,
          context: []
        };
        findings.push(currentError);
      } else {
        // If it doesn't match a new error, append as context to the active error
        if (currentError) {
          currentError.context.push(trimmed);

          // Try to extract a file location from stack traces or paths in context if the error doesn't have one yet
          if (!currentError.file) {
            // Match pattern like C:\path\to\file.js:123
            let pathMatch = trimmed.match(/([a-zA-Z]:\\[^\s\(\)]+?\.[a-zA-Z0-9]+):(\d+)(?::(\d+))?/);
            if (!pathMatch) {
              // Match pattern like (node:internal/process/promises:392:7) or (path/to/file.js:10:5)
              pathMatch = trimmed.match(/\(?([^\s\(\)]+?\.[a-zA-Z0-9]+):(\d+):(\d+)\)?/);
            }

            if (pathMatch) {
              const potentialFile = pathMatch[1];
              currentError.line = pathMatch[2];
              currentError.col = pathMatch[3] || '1';

              if (potentialFile.startsWith('node:')) {
                currentError.file = potentialFile;
              } else {
                try {
                  const checkPaths = [resolve(cwd, potentialFile), resolve(ROOT_DIR, potentialFile), potentialFile];
                  for (const p of checkPaths) {
                    if (existsSync(p)) {
                      currentError.file = relative(ROOT_DIR, p);
                      currentError.fileUrl = `file:///${p.replace(/\\/g, '/')}`;
                      break;
                    }
                  }
                  if (!currentError.file) {
                    currentError.file = potentialFile;
                  }
                } catch {}
              }
            }
          }
        }
      }
    }

    // Build plain text report
    const endTime = new Date();
    const durationSec = ((endTime - startTime) / 1000).toFixed(1);
    const errorsCount = findings.filter(f => f.severity === 'error').length;
    const warningsCount = findings.filter(f => f.severity !== 'error').length;

    const report = [
      '='.repeat(80),
      `COMMAND EXECUTION REPORT: ${name}`,
      '='.repeat(80),
      '',
      `STATUS: ${exitCode === 0 ? (findings.length === 0 ? 'SUCCESS' : 'COMPLETED WITH WARNINGS') : `FAILED (Exit Code: ${exitCode})`}`,
      `Command:  ${cmd}`,
      `Dir:      ${cwd}`,
      `Time:     ${startTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)`,
      `Duration: ${durationSec} s`,
      `Raw Log:  file:///${logFile.replace(/\\/g, '/')}`,
      '',
      '--- METRICS ---',
      `Total Findings: ${findings.length}`,
      `Errors:         ${errorsCount}`,
      `Warnings:       ${warningsCount}`,
      ''
    ];

    if (findings.length > 0) {
      // Top offending files
      const fileGroups = {};
      findings.forEach(f => {
        if (f.file) {
          fileGroups[f.file] = (fileGroups[f.file] || 0) + 1;
        }
      });

      const sortedFiles = Object.keys(fileGroups).sort((a, b) => fileGroups[b] - fileGroups[a]).slice(0, 5);
      if (sortedFiles.length > 0) {
        report.push('--- TOP OFFENDING FILES ---');
        sortedFiles.forEach(f => {
          const item = findings.find(fit => fit.file === f);
          const link = item.fileUrl ? item.fileUrl : f;
          report.push(`* ${link} : ${fileGroups[f]} issues`);
        });
        report.push('');
      }

      // Recommendations
      report.push('--- RECOMMENDATIONS ---');
      if (errorsCount > 0) {
        report.push(`* Action Required: Fix the ${errorsCount} errors shown below to unblock build.`);
      }
      const codes = {};
      findings.forEach(f => {
        if (f.code) codes[f.code] = (codes[f.code] || 0) + 1;
      });
      const topCode = Object.keys(codes).sort((a, b) => codes[b] - codes[a])[0];
      if (topCode) {
        report.push(`* Focus Area: The most frequent issue code is ${topCode} (${codes[topCode]} times).`);
      }
      report.push('* Tip: Open the clickable file URLs below to jump directly to the code in your editor.');
      report.push('');

      // Detailed Findings
      report.push('--- DETAILED FINDINGS ---');
      findings.forEach((f, idx) => {
        const locStr = f.fileUrl ? `${f.fileUrl}#L${f.line}` : (f.file ? `${f.file} at line ${f.line}` : '');
        const filePrefix = locStr ? `${locStr} : ` : '';
        report.push(`[${f.severity.toUpperCase()}] (${f.code}) ${filePrefix}${f.message}`);
        f.context.forEach(ctx => report.push(`  | ${ctx}`));
      });
    } else {
      report.push('--- RECOMMENDATIONS ---');
      report.push('* No actions required: Code is clean.');
    }

    report.push('', '='.repeat(80));

    try {
      writeFileSync(reportFile, report.join('\n'), 'utf8');
      console.log('\n' + '-'.repeat(80));
      console.log('REPORT SUMMARY');
      console.log(`Duration: ${durationSec} seconds`);
      console.log(`Findings: ${findings.length} (Errors: ${errorsCount}, Warnings: ${warningsCount})`);
      console.log(`Raw Log:  ${logFile}`);
      console.log(`Report:   ${reportFile}`);
      console.log('-'.repeat(80));
    } catch (err) {
      console.error(`!!! Failed to write report file: ${err.message}`);
    }

    process.exit(exitCode);
  };

  // Bind exit on child close
  child.on('close', (code) => {
    generateAndExit(code);
  });

  // Intercept SIGINT / SIGTERM for clean teardown of persistent dev servers
  process.on('SIGINT', () => {
    console.log('\n>>> Interrupted (SIGINT). Finishing logs and writing report...');
    child.kill('SIGINT');
    generateAndExit(130);
  });

  process.on('SIGTERM', () => {
    console.log('\n>>> Terminated (SIGTERM). Finishing logs and writing report...');
    child.kill('SIGTERM');
    generateAndExit(143);
  });
}
