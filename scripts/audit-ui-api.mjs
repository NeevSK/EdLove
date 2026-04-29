import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const uiDir = path.join(rootDir, 'packages/ui/src');

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat?.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

function extractApi(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, '.tsx');

  // Look for exported interface or type ending in Props
  const propMatch = content.match(
    /(?:export\s+)?(?:interface|type)\s+(\w*Props)\s*=\{?([\s\S]*?)\};?/,
  );
  const props = propMatch ? propMatch[2].trim() : 'Internal Props / Not Found';

  // Find primary component export
  const componentMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
  const componentName = componentMatch ? componentMatch[1] : fileName;

  return {
    component: componentName,
    props: props
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//')).length,
    rawProps: props,
  };
}

async function runAudit() {
  console.error('🕵️ Scouting UI Component APIs...');
  const files = getFiles(uiDir);
  const apis = files.map(extractApi);

  console.log('# UI Component API Inventory\n');
  apis.forEach((api) => {
    console.log(`## ${api.component}`);
    console.log(`- **Props Count**: ${api.props}`);
    console.log('```typescript');
    console.log(api.rawProps);
    console.log('```\n');
  });

  const total = apis.length;
  console.log(`\n✅ Indexed ${total} components in @repo/ui.`);
}

runAudit().catch((err) => {
  console.error(`❌ Failure: ${err.message}`);
  process.exit(1);
});
