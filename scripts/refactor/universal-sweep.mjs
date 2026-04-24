import fs from 'node:fs';
import path from 'node:path';

/**
 * Robust Systematic Prop Sweep (V3)
 * Migrates legacy Gluestack props to NativeWind classNames.
 */

const PROP_MAP = {
    // Spacing
    mt: 'mt-', mb: 'mb-', ml: 'ml-', mr: 'mr-', mx: 'mx-', my: 'my-',
    p: 'p-', pt: 'pt-', pb: 'pb-', pl: 'pl-', pr: 'pr-', px: 'px-', py: 'py-',
    // Layout
    flex: 'flex-', 
    justifyContent: {
        'center': 'justify-center',
        'flex-start': 'justify-start',
        'flex-end': 'justify-end',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
    },
    alignItems: {
        'center': 'items-center',
        'flex-start': 'items-start',
        'flex-end': 'items-end',
        'stretch': 'items-stretch',
    },
    // Typography
    textAlign: 'text-',
    bold: 'font-bold',
    italic: 'italic',
};

// Common color mapping logic
function getColorClass(val) {
    if (!val) return '';
    const clean = val.replace(/['"{} ]/g, '');
    if (clean === 'white') return 'text-white';
    if (clean === 'black') return 'text-black';
    if (clean.startsWith('$')) return `text-${clean.slice(1)}`;
    return `text-${clean}`;
}

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    // 1. Handle direct props (simple strings/numbers)
    Object.keys(PROP_MAP).forEach(prop => {
        const mapping = PROP_MAP[prop];
        
        // Match string literals: prop="val"
        const stringRegex = new RegExp(`\\s${prop}=["']([^"']+)["']`, 'g');
        content = content.replace(stringRegex, (m, val) => {
            const cleanVal = val.trim();
            const className = (prop === 'bold' || prop === 'italic') ? mapping : `${mapping}${cleanVal}`;
            return ` className="${className}"`;
        });

        // Match simple brace literals: prop={val} where val is just a word/number
        const braceRegex = new RegExp(`\\s${prop}=\\{([\\w\\.\\$]+)\\}`, 'g');
        content = content.replace(braceRegex, (m, val) => {
            const cleanVal = val.trim();
            const className = (prop === 'bold' || prop === 'italic') ? mapping : `${mapping}${cleanVal}`;
            return ` className="${className}"`;
        });
    });

    // 2. Handle Color Prop specifically (Strings only)
    content = content.replace(/\scolor=["']([^"']+)["']/g, (m, val) => {
        const cls = getColorClass(val);
        return cls ? ` className="${cls}"` : m;
    });

    // Match simple color brace: color={'$text'} or color={'white'}
    content = content.replace(/\scolor=\{\s*['"]([^'"]+)['"]\s*\}/g, (m, val) => {
        const cls = getColorClass(val);
        return cls ? ` className="${cls}"` : m;
    });

    // 3. Handle boolean shorthands (bold, italic)
    content = content.replace(/\s(bold|italic)(?=\s|>)/g, (m, prop) => {
        const className = prop === 'bold' ? 'font-bold' : 'italic';
        return ` className="${className}"`;
    });

    // 4. Handle SX Prop (The Big One) - Surgical, Safe, and Smart
    content = content.replace(/\ssx=\{\{\s*([\s\S]*?)\s*\}\}/g, (m, inner) => {
        // Smart split on commas ONLY if not inside parentheses
        const parts = [];
        let currentPart = '';
        let depth = 0;
        for (let i = 0; i < inner.length; i++) {
            const char = inner[i];
            if (char === '(') depth++;
            if (char === ')') depth--;
            if (char === ',' && depth === 0) {
                parts.push(currentPart.trim());
                currentPart = '';
            } else {
                currentPart += char;
            }
        }
        parts.push(currentPart.trim());

        const classes = [];
        const styles = [];

        parts.filter(Boolean).forEach(part => {
            const colonIdx = part.indexOf(':');
            if (colonIdx === -1) return;
            const key = part.slice(0, colonIdx).trim();
            const rawVal = part.slice(colonIdx + 1).trim().replace(/['"]/g, '');

            if (PROP_MAP[key] && !rawVal.includes('Theme') && !rawVal.includes('rgba') && !rawVal.includes('(')) {
                const mapping = PROP_MAP[key];
                if (typeof mapping === 'string') classes.push(`${mapping}${rawVal}`);
                else if (typeof mapping === 'object' && mapping[rawVal]) classes.push(mapping[rawVal]);
                else styles.push(`${key}: ${part.slice(colonIdx + 1).trim()}`);
            } else {
                styles.push(`${key}: ${part.slice(colonIdx + 1).trim()}`);
            }
        });

        let res = '';
        if (classes.length > 0) res += ` className="${classes.join(' ')}"`;
        if (styles.length > 0) res += ` style={{ ${styles.join(', ')} }}`;
        return res;
    });

    // 5. Cleanup: Merge double classNames and normalize spaces
    let prev;
    do {
        prev = content;
        content = content.replace(/(<[\w\.]+\s+[^>]*?)className="([^"]*)"([^>]*?)className="([^"]*)"/g, (m, tagPrefix, c1, middle, c2) => {
            const merged = [...new Set((c1 + ' ' + c2).split(/\s+/))].join(' ').trim();
            return `${tagPrefix}className="${merged}"${middle}`;
        });
    } while (content !== prev);

    // Final pass to clean up double spaces inside tags
    content = content.replace(/<([\w\.]+)\s+([^>]+)>/g, (m, tag, attrs) => {
        return `<${tag} ${attrs.replace(/\s+/g, ' ').trim()}>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Universal Heal: ${filePath}`);
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
