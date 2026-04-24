import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UI_SRC = path.resolve(__dirname, '../packages/ui/src');

// Categorize core exports
const LOGIC_EXPORTS = new Set([
  'Role', 'RoleSchema', 'UserSchema', 'UserContextSchema', 'AuthorityTier',
  'handleAPIError', 'validators', 'validateForm', 'LanguageUtils',
  'useAuth', 'useStore', 'usePermissions', 'useSchool', 'useAcademicCycles',
  'createDefaultWorkspaceLayout', 'normalizeWorkspaceLayout', 'resolveWorkspaceSurfaceLayout',
  'groupResolvedWorkspaceSurfacesByZone', 'WORKSPACE_CANVAS_ZONES', 'WorkflowResult',
  'getAcademicYear', 'getTodayStatus', 'getCurrentTerm', 'TimeTablePeriod', 'MoodLog',
  'AccountingRecord', 'StaffMember', 'Student', 'Classroom'
]);

const NATIVE_EXPORTS = new Set([
  'supabase', 'authAPI', 'identityAPI', 'GuestDataSync', 'storage', 
  'useWorkspaceLayoutSync', 'useAuthorityLifecycle', 'FlowResolver',
  'appCrypto', 'deviceTrust', 'runtime', 'sentry'
]);

const TYPES_EXPORTS = new Set([
     'WorkspaceSurfaceDefinition', 'ResolvedWorkspaceSurface', 'WorkspaceLayout', 'WorkspaceZoneId'
]);

function getAllFiles(dirPath, arrayOfFiles = []) {
  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(UI_SRC).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Handle standard @repo/core imports
  content = content.replace(/import\s+\{(.*?)\}\s+from\s+['"]@repo\/core['"]/g, (match, importList) => {
    const items = importList.split(',').map(i => i.trim()).filter(Boolean);
    const logic = items.filter(i => LOGIC_EXPORTS.has(i.split(' as ')[0]));
    const native = items.filter(i => NATIVE_EXPORTS.has(i.split(' as ')[0]));
    const types = items.filter(i => TYPES_EXPORTS.has(i.split(' as ')[0]));
    const fallback = items.filter(i => !LOGIC_EXPORTS.has(i.split(' as ')[0]) && !NATIVE_EXPORTS.has(i.split(' as ')[0]) && !TYPES_EXPORTS.has(i.split(' as ')[0]));

    let newImports = [];
    if (logic.length) newImports.push(`import { ${logic.join(', ')} } from '@repo/core/logic'`);
    if (native.length) newImports.push(`import { ${native.join(', ')} } from '@repo/core/native'`);
    if (types.length) newImports.push(`import { ${types.join(', ')} } from '@repo/core/types'`);
    // Fallback everything else to logic by default for safety in this pass
    if (fallback.length) newImports.push(`import { ${fallback.join(', ')} } from '@repo/core/logic'`);

    changed = true;
    return newImports.join(';\n');
  });

  // Handle @repo/core/workspace/canvas imports -> @repo/core/logic
  const oldCanvas = /from\s+['"]@repo\/core\/workspace\/canvas['"]/g;
  if (oldCanvas.test(content)) {
      content = content.replace(oldCanvas, "from '@repo/core/logic'");
      changed = true;
  }

  if (changed) {
    console.log(`Migrated imports in ${path.relative(UI_SRC, filePath)}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
