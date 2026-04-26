const fs = require('fs');
const path = require('path');

const UI_PRIMITIVES = ['useToast', 'SanctuaryToast', 'useSanctuaryToast'];

function healToast(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Replace useToast with useSanctuaryToast in imports
  content = content.replace(/useToast/g, 'useSanctuaryToast');

  // 2. Remove SanctuaryToast from imports
  content = content.replace(/,\s*SanctuaryToast/g, '');
  content = content.replace(/SanctuaryToast\s*,/g, '');

  // 3. Replace hook call
  // const toast = useToast(); -> const { showToast } = useSanctuaryToast();
  content = content.replace(
    /const\s+(\w+)\s*=\s*useSanctuaryToast\(\)/g,
    'const { showToast } = useSanctuaryToast()',
  );

  // 4. Transform toast.show({ ... }) calls
  // toast.show({ placement: 'top', render: ({ id }) => ( <SanctuaryToast message={MSG} type="TYPE" ... /> ) });
  // -> showToast({ message: MSG, type: "TYPE" })

  // Complex regex to capture the message and type from SanctuaryToast inside render
  const toastRegex =
    /toast\.show\(\{\s*placement:.*?\s*render:.*?\((.*?)\).*?<SanctuaryToast\s+message=\{(.*?)\}\s+type="(.*?)"\s+.*?\/>\s+\)\s*\}\)/gs;
  content = content.replace(toastRegex, (match, idParam, message, type) => {
    return `showToast({ message: ${message}, type: "${type}" })`;
  });

  // Handle string literal messages: message="msg"
  const toastStringLimitRegex =
    /toast\.show\(\{\s*placement:.*?\s*render:.*?\((.*?)\).*?<SanctuaryToast\s+message="(.*?)"\s+type="(.*?)"\s+.*?\/>\s+\)\s*\}\)/gs;
  content = content.replace(toastStringLimitRegex, (match, idParam, message, type) => {
    return `showToast({ message: "${message}", type: "${type}" })`;
  });

  // Handle toast.close(id) -> nothing (managed by provider)
  content = content.replace(/toast\.close\((.*?)\)/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Healed Toast: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') walk(fullPath);
    } else {
      healToast(fullPath);
    }
  });
}

const targetDir = process.argv[2] || '.';
walk(targetDir);
console.log('Done.');
