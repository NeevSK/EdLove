import fs from 'node:fs';
import path from 'node:path';

/**
 * Stage 2: Typography Sweep
 * Safely converts bold={true}, italic={true}, size="sm" to className.
 */

const targetDir = process.argv[2] || './packages/self/src';

function healFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 1. Boolean props: bold, italic
  // We only replace if they are followed by another prop or space to avoid partial matches
  content = content.replace(/\s+bold=\{?true\}?/g, ' className="font-bold"');
  content = content.replace(/\s+italic=\{?true\}?/g, ' className="italic"');

  // Also handle shorthand bold/italic
  // This is trickier since <Text bold> is valid JSX.
  // We only target Text or Heading tags for shorthand
  content = content.replace(
    /<(Text|Heading)([^>]*?)\s+(bold|italic)(\s|>)/g,
    (m, tag, pre, prop, post) => {
      const className = prop === 'bold' ? 'font-bold' : 'italic';
      return `<${tag}${pre} className="${className}"${post}`;
    },
  );

  // 2. Value props: size, textAlign
  const props = ['size', 'textAlign'];
  props.forEach((prop) => {
    const regex = new RegExp(`\\s+${prop}={?(['"$\\w\\.]+)}?`, 'g');
    content = content.replace(regex, (m, val) => {
      const cleanVal = val.replace(/['"]/g, '');
      if (prop === 'size' && ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(cleanVal)) {
        return ` className="text-${cleanVal}"`;
      }
      if (prop === 'textAlign') {
        return ` className="text-${cleanVal}"`;
      }
      return m;
    });
  });

  // Cleanup: Merge double classNames and normalize spaces
  let prev;
  do {
    prev = content;
    // Search for multiple classNames within a likely tag scope
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
console.log('Typography Sweep Complete.');
