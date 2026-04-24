import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const targetDir = process.argv[2] || "packages";
const absoluteTargetDir = path.isAbsolute(targetDir) ? targetDir : path.join(rootDir, targetDir);

const IGNORE_DIRS = ["node_modules", "dist", ".turbo", "__tests__", "generated"];

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        results = results.concat(getFiles(filePath));
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      results.push(filePath);
    }
  });
  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  
  const sloc = lines.filter(l => l.trim() && !l.trim().startsWith("//")).length;
  const imports = (content.match(/^import\s+/gm) || []).length;
  const exports = (content.match(/export\s+/g) || []).length;
  
  // Calculate max indentation depth as a proxy for complexity
  let maxDepth = 0;
  lines.forEach(line => {
    const match = line.match(/^(\s*)/);
    if (match) {
      const depth = match[1].length / 2; // Assuming 2 spaces
      if (depth > maxDepth) maxDepth = depth;
    }
  });

  // Calculate generic cognitive score
  // (SLOC * 0.2) + (Imports * 2) + (Exports * 1) + (MaxDepth * 5)
  const score = (sloc * 0.2) + (imports * 2) + (exports * 1) + (maxDepth * 5);

  return {
    path: path.relative(rootDir, filePath),
    sloc,
    imports,
    exports,
    maxDepth,
    score: Math.round(score)
  };
}

async function runReport() {
  console.log(`🧠 Measuring Cognitive Load in ${path.relative(rootDir, absoluteTargetDir)}...`);
  const files = getFiles(absoluteTargetDir);
  const reports = files.map(analyzeFile);

  // Sort by score descending
  reports.sort((a, b) => b.score - a.score);

  console.log("\n--- ☢️ God File Alert (Top 10 High Cognitive Load) ---");
  console.table(reports.slice(0, 10).map(r => ({
    File: r.path,
    Score: r.score,
    SLOC: r.sloc,
    Deps: r.imports,
    MaxDepth: r.maxDepth
  })));

  const lowHangingFruit = reports.filter(r => r.score > 200);
  if (lowHangingFruit.length > 10) {
     console.log(`\nFound ${lowHangingFruit.length} files with score > 200. Refactoring highly recommended.`);
  }
}

runReport().catch(err => {
  console.error(`❌ Failure: ${err.message}`);
  process.exit(1);
});
