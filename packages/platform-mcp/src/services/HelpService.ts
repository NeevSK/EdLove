import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../utils/constants.js';

/**
 * --- Standardized Knowledge Layer ---
 * Manages documentation, philosophy, and tool inventory for the MCP.
 */
export class HelpService {
  private getPhilosophyContent() {
    const philosophyPath = path.join(
      ROOT_DIR,
      'packages',
      'platform-mcp',
      'docs',
      'mcp-philosophy.md',
    );
    if (fs.existsSync(philosophyPath)) {
      return fs.readFileSync(philosophyPath, 'utf-8');
    }
    return '# MCP Philosophy\n\nDocumentation file missing.';
  }

  handleGetHelpOverview() {
    const overview = `
# 🚀 Polymath Platform MCP: Sovereign Control Plane

Welcome to the Polymath Platform MCP. This server uses a **Gateway Pattern** to organize a vast array of tools while staying within model context limits.

## 🌉 The Four Core Gateways
You can access all functionality through these four primary entry points:

1.  **⚖️ sovereign_audit**: Hygiene, architecture, compliance, and quality checks.
2.  **🔍 sovereign_discovery**: Search, intelligence, scouting, and code statistics.
3.  **🔧 sovereign_maintenance**: Refactoring, healing, imports normalization, and git checkpoints.
4.  **📖 sovereign_guide**: Philosophy, orientation, and this comprehensive tool inventory.

## 🛠️ Quick Access
- Run \`sovereign_guide(action: 'inventory')\` to see the full list of 50+ specialized actions.
- Run \`sovereign_guide(action: 'architecture')\` to learn about the Gateway design.
- Run \`sovereign_guide(action: 'philosophy')\` to understand our Sovereign Engineering goals.

---
*Tip: If you're looking for a specific tool, use \`sovereign_discovery(action: 'inventory')\` to browse the codebase or \`sovereign_guide(action: 'inventory')\` to browse the MCP capabilities.*
    `;
    return { content: [{ type: 'text' as const, text: overview }] };
  }

  handleGetArchitectureDoc() {
    const doc = `
# 🏛️ Polymath MCP Architecture: The Gateway Pattern

## The Challenge: The 100-Tool Limit
Most LLM interfaces (like Claude/Cursor) have a hard limit (usually around 100) for the number of tools a single MCP server can expose. Once you exceed this:
1. Performance degrades as the prompt context grows.
2. The model gets confused by subtle differences between 50+ tools.
3. Adding new tools requires deleting old ones.

## The Solution: The Sovereign Gateway
Instead of exposing 50 individual tools, we use **Gateways**. Each gateway is a single tool that takes an \`action\` parameter.

### Current Gateways:
- **sovereign_audit**: Quality, hygiene, and compliance checks.
- **sovereign_discovery**: Search, intelligence, and scouting.
- **sovereign_maintenance**: Refactoring, healing, and synchronization.
- **sovereign_guide** (This one!): Help, docs, and orientation.

## Adding New Tools
1. **Don't** add a new tool to \`ListToolsRequestSchema\` in \`index.ts\` (unless it's a new domain).
2. **Do** add a new \`action\` to the relevant service (\`Audit\`, \`Discovery\`, etc.).
3. **Do** register the routing in the \`CallToolRequestSchema\` handler in \`index.ts\`.
    `;
    return { content: [{ type: 'text' as const, text: doc }] };
  }

  handleGetToolInventory() {
    const inventory = `
# 🛠️ Master Tool Index (Inventory)

## 🏁 Primary Commands
These tools are available directly as top-level commands.
| Tool | Function |
| :--- | :--- |
| **help** | Get a high-level overview of the MCP and its gateways. |
| **info** | Get detailed architectural background and philosophy. |

## 🔍 Discovery Gateway (\`sovereign_discovery\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **grep** | \`grep_code\` | High-speed text search using ripgrep. |
| **scout** | \`sovereign_scout\` | Orchestrated dossier combining files, docs, and code heatmap. |
| **docs** | \`search_docs\` | Specialized search for .md and internal guides. |
| **inventory** | \`get_inventory\` | Tree-view of files/packages using eza. |
| **view** | \`shiny_view\` | Syntax-highlighted file viewing with bat. |
| **find** | \`shiny_find\` | Lightning-fast filename search using fd. |
| **structural** | \`structural_search\` | GritQL/Biome semantic pattern matching. |
| **stats** | \`shiny_stats\` | LOC and language statistics using tokei. |
| **component_api** | \`get_component_api\` | Extracts Props interfaces from React components. |
| **imports** | \`audit_imports\` | Detects dependency leaks between packages. |
| **ui_report** | \`audit_ui_components\` | Full API documentation generation for @repo/ui. |
| **impact** | \`trace_deletion_impact\` | Traces recursive impact of deleting a symbol. |

## ⚖️ Audit Gateway (\`sovereign_audit\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **hygiene** | \`audit_monorepo_hygiene\` | Circular deps, unused code, and boundary checks. |
| **legacy_ui** | \`audit_legacy_ui\` | Detects Gluestack/RN usage in 'Zero-Legacy' areas. |
| **architecture** | \`audit_package_architecture\` | Checks platform agnosticism and integrity. |
| **a11y** | \`audit_accessibility\` | Targeted ARIA violation and accessibility linting. |
| **dependency_health**| \`audit_dependency_health\` | Combined SDK compatibility and health report. |
| **i18n** | \`audit_i18n\` | Key coverage and fallback policy compliance. |
| **colors** | \`check_contrast\` | WCAG/APCA contrast ratio calculations. |
| **boundaries** | \`check_classroom_boundaries\`| Enforces domain isolation for sub-packages. |
| **features** | \`audit_feature_fidelity\` | Gap analysis between docs and implementation. |
| **exports** | \`audit_export_integrity\` | barrel export and deep-import violation detection. |
| **stale_flags** | \`detect_stale_feature_flags\`| Identifies static feature flags for removal. |
| **load_report** | \`report_cognitive_load\` | Reports high cognitive load 'God Files'. |
| **lint** | \`lint_package\` | High-speed Biome linting for packages. Supports \`fix: true\`. |
| **check** | \`format:fix\` | Primary Biome check/format/fix tool (\`biome check --write\`). |
| **syncpack_fix** | \`maintenance:fix\` | Fixes package.json version mismatches monorepo-wide. |

## 🔧 Maintenance Gateway (\`sovereign_maintenance\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **heal** | \`heal_codebase\` | Surgically repairs JSX/TS syntax corruption. |
| **sync** | \`sync_identity_schema\` | Aligns DB profiles with identity schemas. |
| **checkpoint** | \`create_checkpoint\` | Atomic git commit with smart ledger categorization. |
| **refactor** | \`shiny_refactor\` | Modern project-wide find/replace using sd. |
| **types** | \`check_package_types\` | Targeted tsc audits for specific packages. |
| **normalize** | \`normalize_imports\` | Local relative -> Workspace alias transformation. |
| **scaffold** | \`scaffold_feature_context\` | Intelligence scout for feature keywords. |
| **zod_bridge** | \`bridge_schema_zod\` | JSON Schema to Zod validator generation. |
| **readme_usage** | \`generate_readme_usage\` | JSDoc to Markdown usage generator. |

## 📖 Guide Gateway (\`sovereign_guide\`) - [NEW]
| Action | Function |
| :--- | :--- |
| **architecture** | Explains the 100-tool limit and Gateway Pattern. |
| **inventory** | This comprehensive list of all actions and their purposes. |
| **philosophy** | Deep dive into Sovereign Engineering goals. |
    `;
    return { content: [{ type: 'text' as const, text: inventory }] };
  }

  handleGetPhilosophy() {
    return { content: [{ type: 'text' as const, text: this.getPhilosophyContent() }] };
  }
}
