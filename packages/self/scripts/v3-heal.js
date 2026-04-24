const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || './packages/classroom/src';

// Hardened Hex Map for Zero-Legacy Stability
const hexMap = {
    "Theme.colors.background": "'#FCF9F2'",
    "Theme.colors.text": "'#2A2318'",
    "Theme.colors.primary": "'#F6BF8C'",
    "Theme.colors.secondary": "'#FCF9F2'",
    "Theme.colors.tertiary": "'#E8E2CF'",
    "Theme.colors.action": "'#8BBF7A'",
    "Theme.colors.border": "'#E8E2CF'",
    "Theme.colors.textSecondary": "'#6B6480'",
    "Theme.colors.textTertiary": "'#968E80'",
    "Theme.colors.ink": "'#2A2318'",
    "Theme.colors.ghost": "'#968E80'",
    "Theme.colors.surface": "'#FCF9F2'",
    "Theme.colors.muted": "'#F5EDD6'",
    "Theme.scene.surface.bg": "'#FCF9F2'",
    "Theme.scene.surface.text": "'#2A2318'",
    "Theme.scene.surface.border": "'#E8E2CF'",
    "Theme.scene.chrome.bg": "'#F5EDD6'",
};

function healFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Structure: Fix Tag & Types (Restoring missing commas in generic definitions)
    content = content.replace(/<([a-zA-Z1-6]+),\s+/g, '<$1 ');
    content = content.replace(/(Omit|Pick|Partial)<([a-zA-Z0-9_|]+)\s+(['"])/g, '$1<$2, $3');
    content = content.replace(/Partial<Pick<([a-zA-Z0-9_|]+)\s+(['"])/g, 'Partial<Pick<$1, $2');
    content = content.replace(/Record<([a-zA-Z0-9_|]+)\s+([^,][^>]*?)>/gs, 'Record<$1, $2>');

    // 1b. Restore Broken Arrow Functions (Systematic Fix for corruption where => became =)
    content = content.replace(/\)\s*=\s*{\s*[\r\n]/g, ') => {\n');
    content = content.replace(/\)\s+=\s+\(/g, ') => (');
    content = content.replace(/\)\s*=\s*(?!\s*=>)(?=\s*[^\s={])/g, ') => ');
    // REMOVED line 41: content = content.replace(/(?:\s+)=\s*(?:\{|\()/g, ' => '); // Too aggressive

    // 2. ClassName & Style: Remove hidden commas and sanitize
    content = content.replace(/className="([^"]*)"/g, (m, c) => 'className="' + c.replace(/,/g, ' ').replace(/\s+/g, ' ').trim() + '"');
    content = content.replace(/className={`([^`]*)`}/g, (m, c) => 'className={`' + c.replace(/,/g, ' ').replace(/\s+/g, ' ').trim() + '`}');
    
    // 3. Theme Purge: Direct hex replacement (Prevents invalid hook calls in StyleSheet)
    const sortedKeys = Object.keys(hexMap).sort((a, b) => b.length - a.length);
    sortedKeys.forEach(key => {
        content = content.split(key).join(hexMap[key]);
    });

    // 4. Cleanup Corrupted Theme Access (e.g. Theme.'#hex' or useTheme().scene.'#hex')
    content = content.replace(/(?:Theme|useTheme\(\)\.(?:scene|surface))\s*\.\s*(['"]#[a-fA-F0-9]{3,6}['"])/g, '$1');
    content = content.replace(/Theme\.colors\.\s*/g, ''); // Nuke dangling prefixes

    // 5. Icon Hardening: Wrap Lucide icons with Sanctuary Icon component if missing
    if (content.includes('lucide-react-native')) {
        const icons = ['Search', 'Bell', 'Settings', 'User', 'Calendar', 'Home', 'Plus', 'Check', 'X', 'ChevronRight', 'ChevronLeft', 'ArrowRight', 'ArrowLeft', 'MoreHorizontal', 'Filter', 'Menu', 'FileText', 'Book', 'Clock', 'Activity', 'Shield', 'Globe', 'Compass', 'Layout', 'Grid', 'Layers', 'Package', 'Database', 'HardDrive', 'Cpu', 'Terminal', 'Code', 'Edit', 'Trash2', 'Share', 'Download', 'Lock', 'Unlock', 'Eye', 'EyeOff'];
        icons.forEach(icon => {
            const regex = new RegExp('<' + icon + '([^>]*)/>', 'g');
            if (content.match(regex)) {
                if (!content.includes('import { Icon }')) {
                    content = content.replace(/import\s*\{([\s\S]*?)\}\s*from\s*['"]@repo\/ui['"]/g, (m, pre) => {
                        if (!pre.includes('Icon')) return `import { Icon, ${pre.trim()} } from '@repo/ui'`;
                        return m;
                    });
                }
                content = content.replace(regex, '<Icon as={' + icon + '}$1/>');
            }
        });
    }

    // 6. Hook Management & useTheme Stabilizer
    if (content.includes('useThemedColors')) {
        if (!content.includes('useTheme')) {
            content = content.replace(/import\s*\{([\s\S]*?)\}\s*from\s*['"]@repo\/ui['"]/g, (m, pre) => {
                const cleaned = pre.split('useThemedColors').join('useTheme').replace(/,\s*,/g, ',').trim();
                return `import { ${cleaned} } from '@repo/ui'`;
            });
        }
        content = content.replace(/useThemedColors\s*\(\s*\)/g, 'useTheme().scene');
    }

    // 7. Final Cleanup: Resolve comma stacking and syntax debris
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/\{\s*,/g, '{');
    content = content.replace(/,\s*\}/g, '}');
    content = content.replace(/\[\s*,/g, '[');
    content = content.replace(/,\s*\]/g, ']');
    
    // Fix corrupted generic/ternary debris
    content = content.replace(/\?\s*>\s*\(/g, '? (');
    content = content.replace(/:\s*>\s*\(/g, ': (');
    content = content.replace(/&&\s*>\s*\(/g, '&& (');
    
    // Purge Theme imports
    content = content.replace(/import\s*\{[\s\S]*?Theme[\s\S]*?\}\s*from\s*['"]@repo\/(?:ui|core)['"]/g, (m) => {
        const cleaned = m.replace(/\bTheme\b,?/g, '').replace(/\{\s*,\s*\}/g, '{}');
        return (cleaned.includes('{}')) ? '' : cleaned;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`[STABILIZED] ${filePath}`);
    }
}

function processPath(target) {
    if (!fs.existsSync(target)) return;
    const stats = fs.statSync(target);
    const basename = path.basename(target);
    
    // Safety Exclusions: NEVER touch node_modules or generated assets
    if (['node_modules', 'dist', '.turbo', '.expo', 'android', 'ios', 'archives'].includes(basename)) return;
    if (target.includes('node_modules')) return;

    if (stats.isFile()) {
        if (target.endsWith('.tsx') || target.endsWith('.ts')) {
            try { healFile(target); } catch (e) { console.error(`Err ${target}: ${e.message}`); }
        }
    } else if (stats.isDirectory()) {
        const files = fs.readdirSync(target);
        files.forEach(file => processPath(path.join(target, file)));
    }
}

processPath(targetDir);
console.log('Zero-Legacy Structural Stability Pass Complete!');
