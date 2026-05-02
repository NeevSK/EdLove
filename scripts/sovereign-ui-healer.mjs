import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * 🛠️ Sovereign UI Healer
 * Automatically refactors Legacy UI (react-native imports) to Sovereign Primitives.
 */

const UI_DIR = path.resolve("packages/ui/src");
const PRIMITIVE_MAP = {
  View: "View",
  Text: "Text",
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  FlatList: "FlatList",
  TextInput: "Input",
  Button: "Button",
  ActivityIndicator: "ActivityIndicator",
  KeyboardAvoidingView: "KeyboardAvoidingView",
  RefreshControl: "RefreshControl"
};

console.log(`🛠️ Healing Legacy UI in ${UI_DIR}...`);

function heal() {
  const cmd = `rg "from 'react-native'" ${UI_DIR} -l`;
  let files = [];
  try {
    files = execSync(cmd, { encoding: "utf8" }).trim().split("\n");
  } catch (e) {
    console.log("No files to heal.");
    return;
  }

  for (const rawFile of files) {
    const file = path.resolve(rawFile.trim());
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, "utf8");
    let changed = false;

    // Skip core files to avoid circular imports
    if (file.includes("primitives.ts")) continue;
    if (file.includes("components" + path.sep + "ui")) continue;
    if (file.includes("gluestack" + path.sep)) continue;

    // Regex to match imports from 'react-native'
    // Matches: import { View, Text } from 'react-native';
    const legacyRegex = /import\s*\{([^}]*)\}\s*from\s*['"]react-native['"];?/g;
    
    content = content.replace(legacyRegex, (match, group) => {
      const components = group.split(",").map(c => c.trim());
      const toMove = components.filter(c => PRIMITIVE_MAP[c]);
      const stay = components.filter(c => !PRIMITIVE_MAP[c]);

      if (toMove.length > 0) {
        changed = true;
        
        // Calculate relative path to primitives.ts
        const fileDir = path.dirname(file);
        const primFile = path.join(UI_DIR, "primitives.ts");
        let relPath = path.relative(fileDir, primFile).replace(/\\/g, "/");
        
        // Remove .ts extension and ensure ./ prefix
        relPath = relPath.replace(/\.ts$/, "");
        if (!relPath.startsWith(".")) relPath = "./" + relPath;

        const stayImport = stay.length > 0 ? `import { ${stay.join(", ")} } from 'react-native';\n` : "";
        const primImport = `import { ${toMove.join(", ")} } from '${relPath}';`;
        
        return stayImport + primImport;
      }
      return match;
    });

    if (changed) {
      fs.writeFileSync(file, content, "utf8");
      console.log(`✅ Healed: ${path.relative(process.cwd(), file)}`);
    }
  }
}

heal();
