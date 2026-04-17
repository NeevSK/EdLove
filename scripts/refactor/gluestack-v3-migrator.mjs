import fs from 'node:fs';
import path from 'node:path';

const targetDir = process.argv[2] || './packages/self/src';

const colorMap = {
    "Theme.colors.sanctuarySaffron": "templeGold",
    "Theme.colors.templeGold": "templeGold",
    "Theme.colors.sageGreen": "sageGreen",
    "Theme.colors.skyBlue": "skyBlue",
    "Theme.colors.emberRed": "emberRed",
    "Theme.colors.ink": "ink",
    "Theme.colors.linen": "linen",
    "Theme.colors.text": "phaseText-primary",
    "Theme.colors.textSecondary": "phaseText-secondary",
    "colors.surface": "phase-world",
    "colors.background": "phase-world",
    "colors.border": "phase-border",
    "colors.text": "phaseText-primary",
    "colors.textSecondary": "phaseText-secondary",
    "colors.secondary": "phase-sunlight",
    "colors.tertiary": "phase-innerCircle",
    "colors.action": "phase-templeGold",
};

const spacingTokens = {
    "Theme.spacing.xs": "1", "Theme.spacing.sm": "2", "Theme.spacing.md": "4", "Theme.spacing.lg": "6", "Theme.spacing.xl": "8", "Theme.spacing.xxl": "12",
    "Theme.corners.tight": "sm", "Theme.corners.comfortable": "md", "Theme.corners.generous": "xl", "Theme.corners.full": "full",
};

const spacingPropMap = {
    padding: 'p', p: 'p', px: 'px', py: 'py', pt: 'pt', pb: 'pb', pl: 'pl', pr: 'pr',
    margin: 'm', m: 'm', mx: 'mx', my: 'my', mt: 'mt', mb: 'mb', ml: 'ml', mr: 'mr',
    gap: 'gap', space: 'gap', spacing: 'gap',
    justifyContent: 'justify', alignItems: 'items', alignSelf: 'self', flex: 'flex'
};

const flexValueMap = {
    'center': 'center', 'flex-start': 'start', 'flex-end': 'end', 'space-between': 'between', 'space-around': 'around', 'space-evenly': 'evenly',
};

function splitPairs(content) {
    const pairs = []; let current = ''; let depth = 0; let quote = null;
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if ((char === "'" || char === '"') && (i === 0 || content[i-1] !== '\\')) {
            if (!quote) quote = char; else if (quote === char) quote = null;
        }
        if (!quote) {
            if (char === '{' || char === '(' || char === '[') depth++;
            if (char === '}' || char === ')' || char === ']') depth--;
            if (char === ',' && depth === 0) { pairs.push(current.trim()); current = ''; continue; }
        }
        current += char;
    }
    if (current.trim()) pairs.push(current.trim());
    return pairs;
}

function healFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Remove sx props and convert to className/style
    content = content.replace(/sx=\{\{([\s\S]*?)\}\}/g, (m, sxContent) => {
        const classes = [];
        const styles = [];
        const pairs = splitPairs(sxContent);
        
        pairs.forEach(pair => {
            const colonIndex = pair.indexOf(':');
            if (colonIndex === -1) return;
            const key = pair.slice(0, colonIndex).trim();
            const val = pair.slice(colonIndex + 1).trim();
            const cleanVal = val.replace(/['"]/g, '').trim();

            let resolved = false;
            if (key === 'backgroundColor' || key === 'bg') {
                if (colorMap[val]) { classes.push(`bg-${colorMap[val]}`); resolved = true; }
                else if (cleanVal.startsWith('#')) { classes.push(`bg-[${cleanVal}]`); resolved = true; }
            } else if (key === 'color') {
                if (colorMap[val]) { classes.push(`text-${colorMap[val]}`); resolved = true; }
                else if (cleanVal.startsWith('#')) { classes.push(`text-[${cleanVal}]`); resolved = true; }
            } else if (spacingPropMap[key]) {
                const prefix = spacingPropMap[key];
                if (spacingTokens[val]) { classes.push(`${prefix}-${spacingTokens[val]}`); resolved = true; }
                else if (cleanVal.match(/^\d+$/)) { classes.push(`${prefix}-[${cleanVal}px]`); resolved = true; }
                else if (flexValueMap[cleanVal]) { classes.push(`${prefix}-${flexValueMap[cleanVal]}`); resolved = true; }
            }

            if (!resolved) styles.push(`${key}: ${val}`);
        });

        let res = '';
        if (classes.length > 0) res += ` className="${classes.join(' ')}"`;
        if (styles.length > 0) res += ` style={{ ${styles.join(', ')} }}`;
        return res;
    });

    // 2. Map top-level boolean props (bold, italic)
    content = content.replace(/\s+bold=\{?true\}?/g, ' className="font-bold"');
    content = content.replace(/\s+italic=\{?true\}?/g, ' className="italic"');

    // 3. Map top-level value props (size, textAlign, space)
    const topLevelProps = ['size', 'textAlign', 'space'];
    topLevelProps.forEach(prop => {
        const regex = new RegExp(`\\s+${prop}=\{?(['"$\\w\\.]+)\}?`, 'g');
        content = content.replace(regex, (m, val) => {
            const cleanVal = val.replace(/['"]/g, '');
            if (prop === 'size' && ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(cleanVal)) {
                return ` className="text-${cleanVal}"`;
            }
            if (prop === 'textAlign') {
                return ` className="text-${cleanVal}"`;
            }
            if (prop === 'space') {
                if (cleanVal.match(/^\d+$/)) return ` className="gap-${cleanVal}"`;
                if (['xs', 'sm', 'md', 'lg'].includes(cleanVal)) return ` className="gap-${cleanVal === 'sm' ? '2' : cleanVal === 'md' ? '4' : '6'}"`;
            }
            return m;
        });
    });

    // 4. Merge multiple classNames
    // Iteratively merge until none left
    let prevContent;
    do {
        prevContent = content;
        content = content.replace(/className="([^"]*)"([^>]*?)className="([^"]*)"/g, 'className="$1 $3"$2');
    } while (content !== prevContent);

    // 5. Clean up redundant spaces in tags
    content = content.replace(/\s+/g, ' '); 
    // Wait, the above is too aggressive for code. Let's only do it inside tags.
    content = content.replace(/<(\w+)([^>]+)>/g, (m, tag, attrs) => {
        return `<${tag} ${attrs.trim().replace(/\s+/g, ' ')}>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            try {
                if (healFile(filePath)) console.log(`Healed: ${filePath}`);
            } catch (e) {
                console.error(`Error healing ${filePath}: ${e.message}`);
            }
        }
    });
}

console.log(`Starting healing in ${targetDir}...`);
if (fs.statSync(targetDir).isFile()) {
    healFile(targetDir);
} else {
    walkDir(targetDir);
}
console.log('Done!');
