const fs = require('node:fs');
const path = require('node:path');

const targetDir = process.argv[2] || './packages/self/src';

const colorMap = {
  'Theme.colors.sanctuarySaffron': 'templeGold',
  'Theme.colors.templeGold': 'templeGold',
  'Theme.colors.sacredWhite': 'white',
  'Theme.colors.white': 'white',
  'Theme.colors.sageGreen': 'sageGreen',
  'Theme.colors.skyBlue': 'skyBlue',
  'Theme.colors.emberRed': 'emberRed',
  'Theme.colors.ink': 'ink',
  'Theme.colors.linen': 'linen',
  'Theme.colors.text': 'phaseText-primary',
  'Theme.colors.textSecondary': 'phaseText-secondary',
  'colors.surface': 'phase-world',
  'colors.background': 'phase-world',
  'colors.border': 'phase-border',
  'colors.text': 'phaseText-primary',
  'colors.textSecondary': 'phaseText-secondary',
  'colors.secondary': 'phase-sunlight',
  'colors.tertiary': 'phase-innerCircle',
  'colors.action': 'phase-templeGold',
  'Theme.colors.amberGlow': 'amberGlow',
};

const _spacingTokens = {
  'Theme.spacing.xs': '1',
  'Theme.spacing.sm': '2',
  'Theme.spacing.md': '4',
  'Theme.spacing.lg': '6',
  'Theme.spacing.xl': '8',
  'Theme.spacing.xxl': '12',
  'Theme.corners.tight': 'sm',
  'Theme.corners.comfortable': 'md',
  'Theme.corners.generous': 'xl',
  'Theme.corners.full': 'full',
};

const _spacingPropMap = {
  padding: 'p',
  paddingTop: 'pt',
  paddingBottom: 'pb',
  paddingLeft: 'pl',
  paddingRight: 'pr',
  paddingHorizontal: 'px',
  paddingVertical: 'py',
  margin: 'm',
  marginTop: 'mt',
  marginBottom: 'mb',
  marginLeft: 'ml',
  marginRight: 'mr',
  marginHorizontal: 'mx',
  marginVertical: 'my',
  gap: 'gap',
  p: 'p',
  pt: 'pt',
  pb: 'pb',
  pl: 'pl',
  pr: 'pr',
  px: 'px',
  py: 'py',
  m: 'm',
  mt: 'mt',
  mb: 'mb',
  ml: 'ml',
  mr: 'mr',
  mx: 'mx',
  my: 'my',
};

function _splitPairs(content) {
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

  // 1. Convert bold, italic, textAlign, color props on Text/Heading
  content = content.replace(/<(Text|Heading)([\s\S]*?)>/g, (_fullMatch, tag, props) => {
    let newProps = props;
    const classes = [];

    // bold prop
    if (/\bbold\b(?!-)/.test(newProps)) {
      newProps = newProps.replace(/\bbold\b(?!-)/g, ' ');
      classes.push('font-bold');
    } else if (/bold=\{true\}/.test(newProps)) {
      newProps = newProps.replace(/bold=\{true\}/g, ' ');
      classes.push('font-bold');
    }

    // italic prop
    if (/\bitalic\b(?!-)/.test(newProps)) {
      newProps = newProps.replace(/\bitalic\b(?!-)/g, ' ');
      classes.push('italic');
    } else if (/italic=\{true\}/.test(newProps)) {
      newProps = newProps.replace(/italic=\{true\}/g, ' ');
      classes.push('italic');
    }

    // textAlign prop
    newProps = newProps.replace(/textAlign="([^"]+)"/g, (_m, align) => {
      classes.push(`text-${align}`);
      return ' ';
    });

    // color prop (static string)
    newProps = newProps.replace(/color="([^"]+)"/g, (_m, color) => {
      if (color.startsWith('#')) classes.push(`text-[${color}]`);
      else if (!color.startsWith('var(')) classes.push(`text-${color}`);
      return ' ';
    });

    if (classes.length > 0) {
      if (/className="([^"]*)"/.test(newProps)) {
        newProps = newProps.replace(/className="([^"]*)"/, (_m, existing) => {
          return `className="${existing} ${classes.join(' ')}"`;
        });
      } else if (/className=\{`([^`]*)`\}/.test(newProps)) {
        newProps = newProps.replace(/className=\{`([^`]*)`\}/, (_m, existing) => {
          return `className={\`${existing} ${classes.join(' ')}\`}`;
        });
      } else {
        newProps += ` className="${classes.join(' ')}"`;
      }
    }

    return `<${tag}${newProps}>`;
  });

  // 2. Resolve color props on primitives (dynamic ones)
  content = content.replace(
    /(<(?:Text|Heading|Box|HStack|VStack))([^>]*?)color=\{([\s\S]*?)\}([^>]*?>)/g,
    (_m, tag, pre, colorVal, post) => {
      const val = colorVal.trim();
      if (colorMap[val]) return `${tag}${pre}className="text-${colorMap[val]}" ${post}`;
      return `${tag}${pre}style={{ color: ${val} }} ${post}`;
    },
  );

  // 3. Merging Pass (Generic for any tag)
  content = content.replace(/<([a-zA-Z0-9]+)([\s\S]*?)\/?>/g, (fullTag, tagName, attrContent) => {
    const classNames = [];
    let hasExpression = false;

    // Extract all classNames
    let cleanAttrs = attrContent.replace(
      /className=(?:"([^"]*)"|\{`?([^`"}]*)`?\})/g,
      (_m, qVal, bVal) => {
        const val = qVal || bVal;
        if (val.includes('${')) hasExpression = true;
        classNames.push(val.trim());
        return ' ';
      },
    );

    // Extract all styles
    const styles = [];
    cleanAttrs = cleanAttrs.replace(/style=\{\{([\s\S]*?)\}\}/g, (_m, styleObj) => {
      styles.push(styleObj.trim());
      return ' ';
    });

    if (classNames.length > 0) {
      const combined = classNames.join(' ').replace(/\s+/g, ' ').trim();
      if (hasExpression || combined.includes('`')) {
        cleanAttrs += ` className={\`${combined.replace(/[`]/g, '')}\`}`;
      } else {
        cleanAttrs += ` className="${combined}"`;
      }
    }

    if (styles.length > 0) {
      cleanAttrs += ` style={{ ${styles.join(', ')} }}`;
    }

    // Final cleanup of extra spaces in attributes
    cleanAttrs = cleanAttrs.replace(/\s+/g, ' ').trim();

    const end = fullTag.endsWith('/>') ? ' />' : '>';
    return `<${tagName} ${cleanAttrs}${end}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) walkDir(filePath);
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        if (healFile(filePath)) console.log(`Healed: ${filePath}`);
      } catch (e) {
        console.error(`Error healing ${filePath}: ${e.message}`);
      }
    }
  });
}
walkDir(targetDir);
console.log('Done!');
