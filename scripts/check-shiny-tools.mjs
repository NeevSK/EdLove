import { auditAllShinyTools, isInteractive } from './lib/shiny-tools.mjs';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

console.log(`${colors.bold}${colors.cyan}\n🛡️  Sovereign Tooling & Shiny Tools Pre-flight Check\n${colors.reset}`);

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const noPrompt = args.includes('--no-prompt');

// In interactive mode, autoPrompt allows asking the user permission to download & install missing tools
const shouldPrompt = !noPrompt && isInteractive();

const results = await auditAllShinyTools({ autoPrompt: shouldPrompt });

let allPass = true;
let missingCount = 0;

for (const [key, tool] of Object.entries(results)) {
  if (tool.installed) {
    console.log(
      `${colors.green}✅${colors.reset} ${colors.bold}${tool.name.padEnd(10)}${colors.reset} | ${colors.dim}${tool.version}${colors.reset}`,
    );
  } else {
    allPass = false;
    missingCount++;
    console.log(
      `${colors.red}❌${colors.reset} ${colors.bold}${tool.name.padEnd(10)}${colors.reset} | ${colors.yellow}MISSING${colors.reset}`,
    );
    console.log(`   ${colors.blue}└${colors.reset} Purpose: ${tool.purpose}`);
    const installSuggestion = tool.wingetId ? `winget install --id ${tool.wingetId} -e` : (tool.npmPkg ? `npm install -g ${tool.npmPkg}` : 'see docs');
    console.log(`   ${colors.blue}└${colors.reset} Install: ${colors.cyan}${installSuggestion}${colors.reset}`);
  }
}

if (allPass) {
  console.log(
    `${colors.bold}${colors.green}\n✨ All "Shiny Tools" are present and ready for Sovereign operations.\n${colors.reset}`,
  );
  process.exit(0);
} else {
  if (strict) {
    console.log(
      `${colors.bold}${colors.red}\n⚠️  ${missingCount} shiny tool(s) missing in strict mode. Exiting with failure.\n${colors.reset}`,
    );
    process.exit(1);
  } else {
    console.log(
      `${colors.bold}${colors.yellow}\n⚠️  ${missingCount} shiny tool(s) missing. Standard fallbacks active.\n${colors.reset}`,
    );
    // Non-strict exit code 0 to allow graceful fallbacks across monorepo scripts
    process.exit(0);
  }
}
