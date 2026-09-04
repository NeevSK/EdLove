import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsNativePath = path.resolve(__dirname, '../src/icons.native.ts');
const iconsFileContent = fs.readFileSync(iconsNativePath, 'utf8');

// Parse all export statements of the form:
// export { default as Name } from 'lucide-react-native/icons/subpath';
const regex = /from\s+['"](lucide-react-native\/icons\/[^'"]+)['"]/g;

let match;
const iconSubpaths = [];
while ((match = regex.exec(iconsFileContent)) !== null) {
  iconSubpaths.push(match[1]);
}

console.log(`Validating ${iconSubpaths.length} icon subpaths from icons.native.ts...`);

let missingCount = 0;
for (const subpath of iconSubpaths) {
  try {
    // Attempt node resolution
    import.meta.resolve(subpath);
  } catch (err) {
    console.error(`❌ Icon subpath failed to resolve: "${subpath}"`);
    missingCount++;
  }
}

if (missingCount > 0) {
  console.error(`\nFound ${missingCount} invalid icon exports in icons.native.ts`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${iconSubpaths.length} icon exports successfully resolved against lucide-react-native!`);
  process.exit(0);
}
