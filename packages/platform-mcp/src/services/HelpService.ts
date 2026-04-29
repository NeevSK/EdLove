import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../utils/constants.js';

/**
 * --- Standardized Knowledge Layer ---
 * Manages documentation, philosophy, and tool inventory for the MCP.
 */
export class HelpService {
  private getDocContent(fileName: string, fallbackTitle: string) {
    const docPath = path.join(ROOT_DIR, 'packages', 'platform-mcp', 'docs', fileName);
    if (fs.existsSync(docPath)) {
      return fs.readFileSync(docPath, 'utf-8');
    }
    return `# ${fallbackTitle}\n\nDocumentation file missing.`;
  }

  private getPhilosophyContent() {
    return this.getDocContent('mcp-philosophy.md', 'MCP Philosophy');
  }

  private getRunbyteContent() {
    return this.getDocContent('runbyte-integration.md', 'Runbyte Integration Guide');
  }

  handleGetHelpOverview() {
    const overview = `
# Polymath Platform MCP: Sovereign Control Plane

Welcome to the Polymath Platform MCP. This server uses a **Gateway Pattern** to organize a large set of tools while staying within model context limits.

## The Four Core Gateways
You can access all functionality through these four primary entry points:

1. **sovereign_audit**: Hygiene, architecture, compliance, and quality checks.
2. **sovereign_discovery**: Search, intelligence, scouting, and code statistics.
3. **sovereign_maintenance**: Refactoring, healing, imports normalization, and git checkpoints.
4. **sovereign_guide**: Philosophy, orientation, tool inventory, and integration guidance.

## Quick Access
- Run \`sovereign_guide(action: 'inventory')\` to see the full list of specialized actions.
- Run \`sovereign_guide(action: 'architecture')\` to learn about the Gateway design.
- Run \`sovereign_guide(action: 'philosophy')\` to understand our Sovereign Engineering goals.
- Run \`sovereign_guide(action: 'runbyte')\` to see the recommended Runbyte integration pattern.

---
Tip: If you're looking for a specific tool, use \`sovereign_guide(action: 'inventory')\` to browse the MCP capabilities.
    `;
    return { content: [{ type: 'text' as const, text: overview }] };
  }

  handleGetArchitectureDoc() {
    const doc = `
# Polymath MCP Architecture: The Gateway Pattern

## The Challenge: The 100-Tool Limit
Most LLM interfaces have a practical limit for the number of tools a single MCP server can expose. Once you exceed this:
1. Performance degrades as prompt context grows.
2. The model gets confused by subtle differences between many similar tools.
3. Adding new tools forces painful tradeoffs.

## The Solution: The Sovereign Gateway
Instead of exposing a large set of individual tools, we use **Gateways**. Each gateway is a single tool that takes an \`action\` parameter.

### Current Gateways
- **sovereign_audit**: Quality, hygiene, and compliance checks.
- **sovereign_discovery**: Search, intelligence, and scouting.
- **sovereign_maintenance**: Refactoring, healing, and synchronization.
- **sovereign_guide**: Help, docs, and orientation.

## Adding New Tools
1. **Don't** add a new top-level tool in \`ListToolsRequestSchema\` unless it is a genuinely new domain.
2. **Do** add a new \`action\` to the relevant service.
3. **Do** register the routing in the \`CallToolRequestSchema\` handler in \`index.ts\`.

## Optional Runbyte Layer
If you want token-efficient orchestration across multiple MCP servers, place Runbyte **in front of** this server rather than embedding it inside the package. See \`sovereign_guide(action: 'runbyte')\` for the supported pattern.
    `;
    return { content: [{ type: 'text' as const, text: doc }] };
  }

  handleGetToolInventory() {
    const inventory = `
# Master Tool Index

## Primary Commands
| Tool | Function |
| :--- | :--- |
| **help** | Get a high-level overview of the MCP and its gateways. |
| **info** | Get detailed architectural background and philosophy. |

## Discovery Gateway (\`sovereign_discovery\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **grep** | \`grep_code\` | High-speed text search using ripgrep. |
| **scout** | \`sovereign_scout\` | Orchestrated dossier combining files, docs, and code heatmap. |
| **docs** | \`search_docs\` | Specialized search for markdown and internal guides. |
| **inventory** | \`get_inventory\` | Tree-view of files and packages. |
| **view** | \`shiny_view\` | Syntax-highlighted file viewing. |
| **find** | \`shiny_find\` | Fast filename search. |
| **structural** | \`structural_search\` | Semantic pattern matching. |
| **stats** | \`shiny_stats\` | LOC and language statistics. |
| **jina** | [NEW] | Free web-to-markdown ingestion using Jina AI Reader. |

## Audit Gateway (\`sovereign_audit\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **hygiene** | \`audit_monorepo_hygiene\` | Circular deps, unused code, and boundary checks. |
| **legacy_ui** | \`audit_legacy_ui\` | Detects Gluestack and RN usage in Zero-Legacy areas. |
| **architecture** | \`audit_package_architecture\` | Checks platform agnosticism and integrity. |
| **a11y** | \`audit_accessibility\` | Targeted accessibility linting. |
| **dependency_health** | \`audit_dependency_health\` | Combined SDK compatibility and health report. |
| **i18n** | \`audit_i18n\` | Key coverage and fallback policy compliance. |
| **colors** | \`check_contrast\` | WCAG and APCA contrast calculations. |
| **features** | \`audit_feature_fidelity\` | Gap analysis between docs and implementation. |
| **exports** | \`audit_export_integrity\` | Barrel export and deep-import violation detection. |
| **lint** | \`lint_package\` | High-speed Biome linting for packages. |
| **check** | \`format:fix\` | Primary Biome check/format/fix tool. |
| **syncpack_fix** | \`maintenance:fix\` | Fixes package.json version mismatches monorepo-wide. |
| **types** | \`check_package_types\` | Targeted TypeScript audits. |
| **hooks** | [NEW] | Hook hygiene and policy checks. |

## Maintenance Gateway (\`sovereign_maintenance\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **heal** | \`heal_codebase\` | Repairs JSX and TS syntax corruption. |
| **sync** | \`sync_identity_schema\` | Aligns DB profiles with identity schemas. |
| **checkpoint** | \`create_checkpoint\` | Atomic git commit with smart ledger categorization. |
| **refactor** | \`shiny_refactor\` | Project-wide find and replace. |
| **normalize** | \`normalize_imports\` | Relative-to-workspace alias transformation. |
| **heal_architecture** | [NEW] | Resolves root-to-subpath import violations. |
| **scaffold** | \`scaffold_feature_context\` | Intelligence scout for feature keywords. |
| **runbyte_config** | [NEW] | Generates a ready-to-use Runbyte configuration for this workspace. |

## Guide Gateway (\`sovereign_guide\`)
| Action | Function |
| :--- | :--- |
| **architecture** | Explains the 100-tool limit and Gateway Pattern. |
| **inventory** | Returns the action inventory. |
| **philosophy** | Deep dive into Sovereign Engineering goals. |
| **runbyte** | Integration guidance for using Runbyte as a token-efficient wrapper around platform-mcp. |
    `;
    return { content: [{ type: 'text' as const, text: inventory }] };
  }

  handleGetPhilosophy() {
    return { content: [{ type: 'text' as const, text: this.getPhilosophyContent() }] };
  }

  handleGetRunbyteGuide() {
    return { content: [{ type: 'text' as const, text: this.getRunbyteContent() }] };
  }
}
