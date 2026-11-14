import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1. Fix SpreadsheetGrid.tsx
const p1 = path.resolve('packages/library/src/components/SpreadsheetGrid.tsx');
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace('<View space="0" style={{ width: tableWidth }}>', '<View style={{ width: tableWidth }}>');
c1 = c1.replace(
  `<View className="flex-row items-center"
            space="0"
            className="border-b border-phase-border bg-phase-canvas"
            style={{ width: tableWidth }}
          >`,
  `<View
            className="flex-row items-center border-b border-phase-border bg-phase-canvas"
            style={{ width: tableWidth }}
          >`
);
c1 = c1.replace(
  `<View className="flex-row items-center"
              key={\`r-\${rowIndex}\`}
              space="0"
              style={{ width: tableWidth }}
              className={rowIndex % 2 === 0 ? 'bg-white dark:bg-obsidian' : 'bg-phase-canvas'}
            >`,
  `<View
              key={\`r-\${rowIndex}\`}
              className={\`flex-row items-center \${rowIndex % 2 === 0 ? 'bg-white dark:bg-obsidian' : 'bg-phase-canvas'}\`}
              style={{ width: tableWidth }}
            >`
);
const tmp1 = p1 + '.tmp';
fs.writeFileSync(tmp1, c1, 'utf8');
execSync(`cmd.exe /c move /y "${tmp1}" "${p1}"`);

// 2. Fix ToolsHubScreen.tsx
const p2 = path.resolve('packages/library/src/screens/ToolsHubScreen.tsx');
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace('<View space="xs">', '<View className="gap-1">');
const tmp2 = p2 + '.tmp';
fs.writeFileSync(tmp2, c2, 'utf8');
execSync(`cmd.exe /c move /y "${tmp2}" "${p2}"`);

console.log('Fixed SpreadsheetGrid.tsx and ToolsHubScreen.tsx');
