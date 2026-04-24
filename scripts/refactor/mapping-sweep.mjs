import fs from 'node:fs';
import path from 'node:path';

/**
 * Primitive Mapping Sweep
 * Converts standard RN View imports to @repo/ui Box imports.
 */

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    // 1. Identify files importing View from react-native
    const rnViewImport = /import\s*\{([^}]*View[^}]*)\}\s*from\s*['"]react-native['"]/;
    
    if (rnViewImport.test(content)) {
        // Remove View from react-native import
        content = content.replace(rnViewImport, (m, imports) => {
            const remaining = imports.split(',').map(i => i.trim()).filter(i => i !== 'View').join(', ');
            return remaining ? `import { ${remaining} } from 'react-native'` : '';
        });

        // Add Box to @repo/ui import or create new one
        const uiImport = /import\s*\{([^}]*)\}\s*from\s*['"]@repo\/ui['"]/;
        if (uiImport.test(content)) {
            content = content.replace(uiImport, (m, imports) => {
                if (imports.includes('Box')) return m;
                return `import { Box, ${imports.trim()} } from '@repo/ui'`;
            });
        } else {
            // Add after react-native import or at top
            content = `import { Box } from '@repo/ui';\n` + content;
        }

        // 3. Replace <View and </View> with <Box and </Box>
        content = content.replace(/<(View)(\s|>)/g, '<Box$2');
        content = content.replace(/<\/(View)>/g, '</Box>');
    }

    // 4. Handle Text from react-native (move to @repo/ui)
    const rnTextImport = /import\s*\{([^}]*Text[^}]*)\}\s*from\s*['"]react-native['"]/;
    if (rnTextImport.test(content)) {
        content = content.replace(rnTextImport, (m, imports) => {
            const remaining = imports.split(',').map(i => i.trim()).filter(i => i !== 'Text').join(', ');
            return remaining ? `import { ${remaining} } from 'react-native'` : '';
        });

        const uiImport = /import\s*\{([^}]*)\}\s*from\s*['"]@repo\/ui['"]/;
        if (uiImport.test(content)) {
            content = content.replace(uiImport, (m, imports) => {
                if (imports.includes('Text')) return m;
                return `import { Text, ${imports.trim()} } from '@repo/ui'`;
            });
        } else {
            content = `import { Text } from '@repo/ui';\n` + content;
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Mapped: ${filePath}`);
        return true;
    }
    return false;
}

const target = process.argv[2];
if (target) {
    if (fs.lstatSync(target).isDirectory()) {
        const files = fs.readdirSync(target, { recursive: true }).filter(f => f.endsWith('.tsx'));
        files.forEach(f => processFile(path.join(target, f)));
    } else {
        processFile(target);
    }
}
