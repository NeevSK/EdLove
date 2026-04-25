import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const targetDir = process.argv[2] || "packages";
const absoluteTargetDir = path.isAbsolute(targetDir) ? targetDir : path.join(rootDir, targetDir);

// Use fd for lightning-fast file location
function getFiles(dir) {
  try {
    const cmd = `fd -t f -e ts -e tsx -e js -e jsx -E node_modules -E dist -E .turbo -E __tests__ -E generated . "${dir}"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    return output.split('\n').filter(f => f.trim());
  } catch (e) {
    console.error(`Error gathering files with fd: ${e.message}`);
    return [];
  }
}

function analyzeFile(filePath) {
  try {
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

    // Calculate generic cognitive score: (SLOC * 0.2) + (Imports * 2) + (Exports * 1) + (MaxDepth * 5)
    const score = (sloc * 0.2) + (imports * 2) + (exports * 1) + (maxDepth * 5);

    return {
      path: path.relative(rootDir, filePath),
      sloc,
      imports,
      exports,
      maxDepth,
      score: Math.round(score)
    };
  } catch (e) {
    return null;
  }
}

async function runReport() {
  console.log(`🧠 Shiny Measuring Cognitive Load in ${path.relative(rootDir, absoluteTargetDir)}...`);
  const files = getFiles(absoluteTargetDir);
  const reports = files.map(analyzeFile).filter(Boolean);

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
