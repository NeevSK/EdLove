import fs from 'node:fs';
import path from 'node:path';

/**
 * Stage 1: SX Prop Sweep
 * Safely converts sx={{ ... }} to className and style props.
 */

const targetDir = process.argv[2] || './packages/self/src';

const colorMap = {
  'Theme.colors.sanctuarySaffron': 'templeGold',
  'Theme.colors.templeGold': 'templeGold',
  'Theme.colors.sageGreen': 'sageGreen',
  'Theme.colors.skyBlue': 'skyBlue',
  'Theme.colors.emberRed': 'emberRed',
  'Theme.colors.ink': 'ink',
  'Theme.colors.linen': 'linen',
  'Theme.colors.text': 'phaseText-primary',
  'Theme.colors.textSecondary': 'phaseText-secondary',
};

const spacingTokens = {
  'Theme.spacing.xs': '1',
  'Theme.spacing.sm': '2',
  'Theme.spacing.md': '4',
  'Theme.spacing.lg': '6',
  'Theme.spacing.xl': '8',
  'Theme.spacing.xxl': '12',
};

const spacingPropMap = {
  padding: 'p',
  p: 'p',
  px: 'px',
  py: 'py',
  pt: 'pt',
  pb: 'pb',
  pl: 'pl',
  pr: 'pr',
  margin: 'm',
  m: 'm',
  mx: 'mx',
  my: 'my',
  mt: 'mt',
  mb: 'mb',
  ml: 'ml',
  mr: 'mr',
  gap: 'gap',
  space: 'gap',
};

function splitPairs(content) {
  const pairs = [];
  let current = '';
  let depth = 0;
  let quote = null;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if ((char === "'" || char === '"') && (i === 0 || content[i - 1] !== '\\')) {
      if (!quote) quote = char;
      else if (quote === char) quote = null;
    }
    if (!quote) {
      if (char === '{' || char === '(' || char === '[') depth++;
      if (char === '}' || char === ')' || char === ']') depth--;
      if (char === ',' && depth === 0) {
        pairs.push(current.trim());
        current = '';
        continue;
      }
    }
    current += char;
  }
  if (current.trim()) pairs.push(current.trim());
  return pairs;
}

function healFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Regex to match sx prop: sx={{ ... }}
  // Matches globally but respects nested curly braces
  content = content.replace(/sx=\{\{([\s\S]*?)\}\}/g, (m, sxContent) => {
    const classes = [];
    const styles = [];
    const pairs = splitPairs(sxContent);

    pairs.forEach((pair) => {
      const colonIndex = pair.indexOf(':');
      if (colonIndex === -1) return;
      const key = pair.slice(0, colonIndex).trim();
      const val = pair.slice(colonIndex + 1).trim();
      const cleanVal = val.replace(/['"]/g, '').trim();

      let resolved = false;
      if (key === 'backgroundColor' || key === 'bg') {
        if (colorMap[val]) {
          classes.push(`bg-${colorMap[val]}`);
          resolved = true;
        } else if (cleanVal.startsWith('#')) {
          classes.push(`bg-[${cleanVal}]`);
          resolved = true;
        }
      } else if (key === 'color') {
        if (colorMap[val]) {
          classes.push(`text-${colorMap[val]}`);
          resolved = true;
        } else if (cleanVal.startsWith('#')) {
          classes.push(`text-[${cleanVal}]`);
          resolved = true;
        }
      } else if (spacingPropMap[key]) {
        const prefix = spacingPropMap[key];
        if (spacingTokens[val]) {
          classes.push(`${prefix}-${spacingTokens[val]}`);
          resolved = true;
        } else if (cleanVal.match(/^\d+$/)) {
          classes.push(`${prefix}-[${cleanVal}px]`);
          resolved = true;
        } else if (val.startsWith('$')) {
          const token = val.slice(1);
          if (['1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20'].includes(token)) {
            classes.push(`${prefix}-${token}`);
            resolved = true;
          }
        }
      }

      if (!resolved) styles.push(`${key}: ${val}`);
    });

    let res = '';
    if (classes.length > 0) res += ` className="${classes.join(' ')}"`;
    if (styles.length > 0) res += ` style={{ ${styles.join(', ')} }}`;
    return res;
  });

  // Cleanup: Merge double classNames and normalize spaces
  let prev;
  do {
    prev = content;
    // Search for multiple classNames within a likely tag scope (between < and >)
    content = content.replace(
      /(<[\w.]+\s+[^>]*?)className="([^"]*)"([^>]*?)className="([^"]*)"/g,
      (m, tagPrefix, c1, middle, c2) => {
        return `${tagPrefix}className="${c1.trim()} ${c2.trim()}"${middle}`;
      },
    );
  } while (content !== prev);

  // Final pass to clean up double spaces inside tags
  content = content.replace(/<([\w.]+)\s+([^>]+)>/g, (m, tag, attrs) => {
    return `<${tag} ${attrs.replace(/\s+/g, ' ').trim()}>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function walk(dirOrFile) {
  if (fs.statSync(dirOrFile).isFile()) {
    if (healFile(dirOrFile)) console.log(`Healed: ${dirOrFile}`);
  } else {
    const files = fs.readdirSync(dirOrFile);
    files.forEach((file) => {
      const fullPath = path.join(dirOrFile, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && file !== '.git') walk(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        try {
          if (healFile(fullPath)) console.log(`Healed: ${fullPath}`);
        } catch (e) {
          console.error(`Error in ${fullPath}: ${e.message}`);
        }
      }
    });
  }
}

walk(targetDir);
console.log('SX Sweep Complete.');
