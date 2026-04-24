const fs = require('fs');
const path = require('path');

const targetDirs = ['packages/admin/src', 'apps/gurudevi-mobile/src', 'packages/self/src'];

function repairFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Repair broken arrow functions (Result of corrupted regex)
    // Pattern: const name => ) =>
    content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=>\s*\)\s*=>/g, 'const $1 = () =>');
    
    // Pattern: const name => arg: Type) =>
    content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=>\s*([^)]+)\)\s*=>/g, 'const $1 = ($2) =>');

    // 2. Repair broken object assignments
    // Pattern: name: Type => (with newline following)
    // We look for : type followed by => and then a newline and a property-like line
    content = content.replace(/(\bconst\s+[a-zA-Z0-9_]+:\s*[a-zA-Z0-9_|\[\]<> ,]+)\s*=>\s*[\r\n]+(\s+)([a-zA-Z0-9_]+[:\],])/g, '$1 = {\n$2$3');
    
    // 3. Repair simple variable => { assignments
    content = content.replace(/(\bconst\s+[a-zA-Z0-9_]+)\s*=>\s*[\r\n]+(\s+)([a-zA-Z0-9_]+[:\],])/g, '$1 = {\n$2$3');

    // 4. Fix specific TabNavigator => ) pattern
    content = content.replace(/const\s+checkScreenSize\s*=>\s*\)\s*=>/g, 'const checkScreenSize = () =>');

    // 5. Fix s => e.data patterns
    content = content.replace(/const\s+s\s*=>\s*e\.data/g, 'const s = (e.data');

    // 6. Fix comparison: TenantComparison =>
    content = content.replace(/comparison:\s*TenantComparison\s*=>/g, 'comparison: TenantComparison = {');
    content = content.replace(/result:\s*ReportResult\s*=>/g, 'result: ReportResult = {');
    content = content.replace(/metrics:\s*Record<MetricDefinition,\s*number>\s*=>/g, 'metrics: Record<MetricDefinition, number> = {');
    content = content.replace(/layoutOptions:\s*ForceLayoutOptions\s*=>/g, 'layoutOptions: ForceLayoutOptions = {');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`[REPAIRED] ${filePath}`);
    }
}

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            repairFile(fullPath);
        }
    });
}

console.log('Starting surgical repair of corrupted syntax...');
targetDirs.forEach(processDir);
console.log('Surgical repair complete.');
